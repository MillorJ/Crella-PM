# CRELLA_BUILD_SPEC.md

## Role
You are building **Crella**, a ChatGPT-style **Project Manager** chatbot that runs **locally**. Deliver a complete, working app: **frontend + backend + database**.

## Goals
- ChatGPT-like UX with a **Crella** brand.
- Works locally with **Next.js App Router**.
- **Providers**: OpenAI & Anthropic Claude (switchable).
- **Database**: Drizzle ORM + **SQLite** (file at `.data/local.sqlite`).
- **Persona**: Crella = concise PM; bullet points; “Next actions”; owners & dates.

## Tech / Constraints
- Next.js (App Router), TypeScript.
- Styling: Tailwind (keep it clean; no heavy UI lib).
- DB: `better-sqlite3` + Drizzle ORM/Kit.
- **Keys live only on server** via `.env.local` (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`).
- Implement **streaming** responses:
  - OpenAI: Responses API stream or Chat Completions stream.
  - Claude: Messages API stream.
- All code must run with `pnpm dev`. Provide **exact** commands and seed steps.
- No third-party auth; no deployment; **local only**.

## .env.local
Create if missing. Do **not** expose client-side:
```
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-claude-key
OPENAI_MODEL=gpt-4.1-mini
ANTHROPIC_MODEL=claude-3-5-sonnet-latest
```

## DB Schema (Drizzle / SQLite)
Use these tables (align with existing if present):

```ts
// chats (a conversation)
id (pk, autoinc int)
created_at (unix int, default now)
title (text nullable)

// messages
id (pk, autoinc int)
chat_id (int not null)
role ("user" | "assistant" | "system")
provider ("openai" | "anthropic")
content (text not null)
created_at (unix int default now)

// projects (optional starter)
id (pk autoinc), name (text not null), description (text), created_at (unix default now)

// tasks (PM demo)
id (pk autoinc)
project_id (int nullable)
title (text not null)
status ("todo" | "in_progress" | "blocked" | "done") default "todo"
owner (text nullable)
due_date (text nullable, YYYY-MM-DD)
notes (text nullable)
created_at (unix default now)
```

## Files to create / update

### 1) Drizzle config
`drizzle.config.ts` targeting `.data/local.sqlite`. Create `.data/` folder.

### 2) DB code
`src/db/schema.ts` with tables above.  
`src/db/index.ts` with better-sqlite3 + drizzle export.

### 3) Provider adapters
`src/lib/providers.ts`
- `callOpenAI(messages, model)` and `callAnthropic(messages, model)` with **streaming** helpers.
- Normalize `ChatMessage = { role: "system"|"user"|"assistant"; content: string }`.
- Fail safe: if stream errors, fall back to non-stream.

`src/lib/crella.ts`
- `CRELLA_SYSTEM` default system prompt (PM persona).

### 4) API routes
#### `POST /api/chat` (JSON) and `GET /api/chat/stream?chatId=...` (SSE)
- If `chatId` missing, create new chat (title = first 60 chars).
- Insert system message (Crella) **once** per chat.
- Save user message.
- Stream assistant tokens to the client via SSE; when stream ends, persist full assistant message.
- Body:
  ```json
  {
    "chatId": 1,
    "provider": "openai" | "anthropic",
    "userText": "string",
    "system": "optional override",
    "openAIModel": "optional",
    "anthropicModel": "optional"
  }
  ```

#### `POST /api/tasks` (JSON)
- Create or update a task. Accepts:
  ```json
  { "title": "...", "projectId": 1, "owner": "@alex", "dueDate": "2025-11-01", "notes": "..." }
  ```
  or
  ```json
  { "id": 12, "status": "done" }
  ```
- Return `{ ok: true, id, action: "created"|"updated" }`.

### 5) Frontend UI (ChatGPT-like)
`src/app/page.tsx`:
- **Layout**: left sidebar (conversations), main chat panel, top bar with Provider selector (OpenAI / Claude) and “New chat”.
- **Message list**: bubble style; render **Markdown**; code blocks with copy button; auto-scroll; timestamps.
- **Composer**: multiline textarea, Enter to send (Shift+Enter newline).
- **Streaming**: show live tokens; show typing/three-dots indicator while streaming.
- **Slash commands**:
  - `/task Title by YYYY-MM-DD @owner` → calls `/api/tasks` and posts a confirmation message.
  - Optional: `/title New chat title` to rename chat.
- **State**:
  - Keep `chatId`, `provider`, and `model` in component state (and `localStorage` for provider).
  - When starting new chat → clear log, system prompt inserted server-side.

**Edge cases**:
- Show a toasty error if keys missing or provider call fails.
- Disable send while empty.
- Prevent accidental double send.

### 6) Styling
- Tailwind. Neutral, minimal.  
- Container width ~700px, generous line-height, readable code blocks.

### 7) Commands & scripts
Add to `package.json`:
```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit push",
    "db:studio": "drizzle-kit studio",
    "dev": "next dev -p 3000"
  }
}
```

## Implementation Notes

### Streaming (required)
- **OpenAI** (Node): use Responses API with `stream: true` or Chat Completions with SSE. Aggregate tokens into one assistant message; on finish, persist to DB.
- **Anthropic**: `messages.create({stream:true, ...})`; handle `content_block_delta` / `message_delta` events, accumulate text, then persist.

### Security
- Keys are **server-only** (Route Handlers). No client exposure.
- `.env.local` is git-ignored.

### Title heuristics
- On first user message, title = first sentence (max 60 chars).

### System prompt (Crella)
Use by default unless overridden:
```
You are Crella, a proactive and concise project manager.
- Be crisp and structured; prefer bullet points.
- Ask clarifying questions only if blocking.
- Maintain a "Next actions" list when planning emerges.
- Use concrete dates (YYYY-MM-DD) and named owners.
- When creating/updating a task, confirm briefly and show the updated task summary.
- For status, synthesize from history; if info is missing, ask for the minimum details.
```

## Acceptance Criteria (Definition of Done)
- `pnpm db:generate && pnpm db:migrate` creates/updates `.data/local.sqlite`.
- `pnpm dev` → open `http://localhost:3000`:
  - New chat works; messages persist to DB.
  - Switching provider works (OpenAI/Claude).
  - Responses **stream** token-by-token.
  - `/task ...` creates a task and shows confirmation.
  - Sidebar lists chats; can open a past chat and see message history.
  - Markdown + code blocks render; copy button works.
  - No secrets in client bundle (inspect network tab to confirm).
- `pnpm db:studio` shows the tables with data.

## Quick Test Plan
1) New chat → “Plan landing page sprint.”  
2) Streamed reply appears; title set.  
3) `/task Ship hero section by 2025-10-10 @alex` → returns confirmation; verify in DB via `db:studio`.  
4) Switch to **Anthropic**, ask a follow-up → still streams & persists.  
5) Restart server → open old chat from sidebar → history loads correctly.

---

### Paste to Cursor
- Either put this whole file at project root as `CRELLA_BUILD_SPEC.md` and add to `.cursor/rules`:
  ```
  #cursor
  include: CRELLA_BUILD_SPEC.md
  ```
- Or paste directly into the **System Prompt** in Cursor settings.
