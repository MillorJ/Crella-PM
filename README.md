# Crella - Local Project Manager Chatbot

A ChatGPT-style local project manager chatbot built with Next.js, supporting both OpenAI and Anthropic providers.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Setup Environment
Create `.env.local` with your API keys:
```bash
OPENAI_API_KEY=your-openai-key-here
ANTHROPIC_API_KEY=your-claude-key-here
OPENAI_MODEL=gpt-4o-mini
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```

### 3. Setup Database
```bash
# Create database directory and file
pnpm setup

# Check database status
pnpm db:check
```

### 4. Run Development Server
```bash
pnpm dev
```

Visit http://localhost:3000

## 🗄️ Database Management

### Check Database
```bash
pnpm db:check
```

### View Database with Drizzle Studio
```bash
pnpm db:studio
```
Opens a web interface to view your local SQLite database.

### Database Location
- **Local SQLite file**: `.data/local.sqlite`
- **All data stays local** - no external database needed
- **Data persists** between application restarts

## 🎯 Features

### ✅ Chat Interface
- ChatGPT-style UI with sidebar navigation
- Real-time streaming responses
- Provider switching (OpenAI ↔ Anthropic)
- Message history persistence
- Markdown rendering with code blocks

### ✅ Task Management
- Slash commands: `/task Title by YYYY-MM-DD @owner`
- Task creation and status tracking
- Project association
- Due dates and ownership

### ✅ Project Manager Persona (Crella)
- Bullet-point responses
- "Next actions" lists
- Concrete dates and owners
- Concise, structured communication

## 🛠️ Architecture

### Tech Stack
- **Frontend**: Next.js 15 (App Router) + React 19
- **Styling**: Tailwind CSS
- **Database**: SQLite + Drizzle ORM
- **AI Providers**: OpenAI GPT + Anthropic Claude
- **Type Safety**: TypeScript

### Database Schema
```sql
-- Conversations
chats (id, created_at, title)

-- Messages in conversations  
messages (id, chat_id, role, provider, content, created_at)

-- Project organization
projects (id, name, description, created_at)

-- Task management
tasks (id, project_id, title, status, owner, due_date, notes, created_at)
```

### Data Flow
1. **Local Storage**: All data in `.data/local.sqlite`
2. **Server-Side**: API keys and AI provider calls
3. **Client-Side**: React components with streaming
4. **Real-time**: Server-Sent Events for streaming responses

## 🔒 Security

- ✅ API keys stored server-side only (`.env.local`)
- ✅ No client-side exposure of secrets
- ✅ Local database - no external data sharing
- ✅ All processing happens locally

## 📋 Usage Examples

### Basic Chat
```
You: Plan a website redesign project
Crella: Here's a structured approach:

• **Discovery phase** (Week 1-2)
  - User research and analytics review
  - Stakeholder interviews
  - Competitive analysis

• **Design phase** (Week 3-4)  
  - Wireframes and user flows
  - Visual design concepts
  - Prototype development

• **Next actions:**
  - Set kick-off meeting by 2025-01-15 @projectlead
  - Define target audience by 2025-01-18 @researcher
```

### Task Creation
```
You: /task Create homepage wireframes by 2025-01-20 @designer
Crella: ✅ Task created: **Create homepage wireframes** (due 2025-01-20) (@designer)
```

## 🐛 Troubleshooting

### Database Issues
If you see "Could not locate bindings file" errors:

1. **Rebuild native dependencies:**
   ```bash
   pnpm rebuild
   ```

2. **Check database file:**
   ```bash
   pnpm db:check
   ```

3. **Reset database:**
   ```bash
   rm -rf .data/
   pnpm setup
   ```

### Missing API Keys
Create `.env.local` with your actual API keys (see step 2 above).

### Port Issues
Change port in package.json:
```json
"dev": "next dev -p 3001"
```

## 📝 Development

### Adding Features
1. **Database changes**: Update `src/db/schema.ts`
2. **API routes**: Add to `src/app/api/`
3. **Components**: Add to `src/components/`
4. **Commit every change**: `git add . && git commit -m "feat: description"`

### File Structure
```
src/
├── app/                # Next.js App Router
│   ├── api/           # API routes
│   └── page.tsx       # Main application
├── components/        # React components
├── db/               # Database schema & connection
└── lib/              # Utilities & AI providers
```

---

**Crella** - Your local project management assistant 🎯