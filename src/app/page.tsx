"use client";
import React from "react";

export default function Home() {
  const [chatId, setChatId] = React.useState<number | undefined>();
  const [provider, setProvider] = React.useState<"openai" | "anthropic">("openai");
  const [input, setInput] = React.useState("");
  const [log, setLog] = React.useState<string[]>([]);

  async function send() {
    if (!input.trim()) return;

    // Slash command for quick task creation
    if (input.startsWith("/task ")) {
      const m = input.match(/^\/task\s+(.+?)(?:\s+by\s+(\d{4}-\d{2}-\d{2}))?(?:\s+@(\S+))?$/i);
      if (m) {
        await fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: m[1], dueDate: m[2], owner: m[3] }) });
        setLog((l) => [...l, `Crella: Task created — ${m[1]} ${m[2] ? `(due ${m[2]})` : ""} ${m[3] ? `(@${m[3]})` : ""}`]);
        setInput("");
        return;
      }
    }

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, userText: input, chatId }),
    });
    const data = await res.json();
    setChatId(data.chatId);
    setLog((l) => [...l, `You: ${input}`, `${provider === "openai" ? "GPT" : "Claude"}: ${data.text}`]);
    setInput("");
  }

  return (
    <main className="min-h-dvh p-6 mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold">Crella — Project Manager Chat</h1>
      <p className="text-sm text-gray-500">Your local PM copilot (OpenAI / Claude)</p>

      <div className="flex gap-2 items-center">
        <label className="text-sm">Provider</label>
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value as any)}
          className="border rounded px-2 py-1"
        >
          <option value="openai">OpenAI</option>
          <option value="anthropic">Anthropic (Claude)</option>
        </select>
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2"
          placeholder="Type a message or /task Title by YYYY-MM-DD @owner"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button onClick={send} className="border rounded px-3 py-2">Send</button>
      </div>

      <div className="space-y-2">
        {log.map((line, i) => (
          <div key={i} className="text-sm whitespace-pre-wrap">{line}</div>
        ))}
      </div>
      {chatId && <p className="text-xs text-gray-500">chatId: {chatId}</p>}
    </main>
  );
}
