import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { ChatMessage } from "./crella";

// Initialize clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function* callOpenAI(
  messages: ChatMessage[],
  model: string = process.env.OPENAI_MODEL || "gpt-4o-mini"
) {
  try {
    console.log("🔍 OpenAI Debug - API Key present:", !!process.env.OPENAI_API_KEY);
    console.log("🔍 OpenAI Debug - Model:", model);
    console.log("🔍 OpenAI Debug - Messages:", messages);
    
    const stream = await openai.chat.completions.create({
      model,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;
      if (delta?.content) {
        yield delta.content;
      }
    }
  } catch (error) {
    console.error("OpenAI streaming error:", error);
    // Fallback to non-streaming
    try {
      const response = await openai.chat.completions.create({
        model,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        stream: false,
      });
      
      const content = response.choices[0]?.message?.content || "";
      yield content;
    } catch (fallbackError) {
      console.error("OpenAI fallback error:", fallbackError);
      yield "Error: Unable to get response from OpenAI";
    }
  }
}

export async function* callAnthropic(
  messages: ChatMessage[],
  model: string = process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022"
) {
  try {
    // Separate system message from other messages for Anthropic
    const systemMessage = messages.find(m => m.role === "system");
    const chatMessages = messages.filter(m => m.role !== "system");

    const stream = await anthropic.messages.create({
      model,
      max_tokens: 4096,
      system: systemMessage?.content || "",
      messages: chatMessages.map(msg => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
      stream: true,
    });

    for await (const chunk of stream) {
      if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
        yield chunk.delta.text;
      }
    }
  } catch (error) {
    console.error("Anthropic streaming error:", error);
    // Fallback to non-streaming
    try {
      const systemMessage = messages.find(m => m.role === "system");
      const chatMessages = messages.filter(m => m.role !== "system");

      const response = await anthropic.messages.create({
        model,
        max_tokens: 4096,
        system: systemMessage?.content || "",
        messages: chatMessages.map(msg => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })),
      });

      const content = response.content[0];
      if (content.type === "text") {
        yield content.text;
      }
    } catch (fallbackError) {
      console.error("Anthropic fallback error:", fallbackError);
      yield "Error: Unable to get response from Anthropic";
    }
  }
}