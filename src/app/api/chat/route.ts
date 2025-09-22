import { NextRequest } from "next/server";
import { db } from "@/db";
import { chats, messages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { callProvider, type Provider } from "@/lib/providers";
import { CRELLA_SYSTEM } from "@/lib/crella";

const Body = z.object({
  chatId: z.number().optional(),
  provider: z.union([z.literal("openai"), z.literal("anthropic")]),
  userText: z.string().min(1),
  system: z.string().optional(),
  openAIModel: z.string().optional(),
  anthropicModel: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const json = await req.json();
  const input = Body.parse(json);

  // Create chat if not provided
  let chatId = input.chatId;
  if (!chatId) {
    const inserted = await db.insert(chats).values({ title: input.userText.slice(0, 60) }).returning({ id: chats.id });
    chatId = inserted[0].id;
  }

  // Ensure system persona exists once per chat
  const systemText = input.system ?? CRELLA_SYSTEM;
  const existing = await db.select().from(messages).where(eq(messages.chatId, chatId));
  if (!existing.some((m) => m.role === "system")) {
    await db.insert(messages).values({ chatId, role: "system", provider: input.provider, content: systemText });
  }

  // Persist user message
  await db.insert(messages).values({ chatId, role: "user", provider: input.provider, content: input.userText });

  // Take last 12 messages as context
  const history = await db
    .select()
    .from(messages)
    .where(eq(messages.chatId, chatId))
    .orderBy(messages.createdAt)
    .limit(12);

  const assistantReply = await callProvider(
    input.provider as Provider,
    history.map((m) => ({ role: m.role as any, content: m.content })),
    { openAIModel: input.openAIModel, anthropicModel: input.anthropicModel }
  );

  const [saved] = await db
    .insert(messages)
    .values({ chatId, role: "assistant", provider: input.provider, content: assistantReply })
    .returning({ id: messages.id });

  return Response.json({ chatId, messageId: saved.id, text: assistantReply });
}
