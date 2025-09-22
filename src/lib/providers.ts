import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };
export type Provider = "openai" | "anthropic";

export async function callProvider(
  provider: Provider,
  messages: ChatMessage[],
  opts?: { openAIModel?: string; anthropicModel?: string }
): Promise<string> {
  if (provider === "openai") {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const model = opts?.openAIModel || process.env.OPENAI_MODEL || "gpt-4.1-mini";

    const input = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n");
    const res = await client.responses.create({ model, input });
    return (res.output_text || "").trim();
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const model = opts?.anthropicModel || process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-latest";

  const systemMsg = messages.find(m => m.role === "system")?.content;
  const core = messages
    .filter(m => m.role !== "system")
    .map(m => ({ role: m.role as "user" | "assistant", content: m.content }));

  const res = await anthropic.messages.create({
    model,
    max_tokens: 1024,
    ...(systemMsg ? { system: systemMsg } : {}),
    messages: core,
  });

  const text = res.content?.map(c => (c.type === "text" ? c.text : "")).join("") ?? "";
  return text.trim();
}
