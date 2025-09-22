import { NextRequest, NextResponse } from "next/server";
import { db, eq } from "@/db";
import { chats, messages } from "@/db/schema";
import { callOpenAI, callAnthropic } from "@/lib/providers";
import { CRELLA_SYSTEM } from "@/lib/crella";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      chatId,
      provider = "openai",
      userText,
      system = CRELLA_SYSTEM,
      openAIModel,
      anthropicModel,
    } = body;

    if (!userText?.trim()) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 });
    }

    let currentChatId = chatId;

    // Create new chat if none provided
    if (!currentChatId) {
      const title = userText.length > 60 ? userText.substring(0, 60) + "..." : userText;
      const [newChat] = await db.insert(chats).values({ title }).returning();
      currentChatId = newChat.id;

      // Insert system message for new chat
      await db.insert(messages).values({
        chatId: currentChatId,
        role: "system",
        provider,
        content: system,
      });
    }

    // Insert user message
    await db.insert(messages).values({
      chatId: currentChatId,
      role: "user",
      provider,
      content: userText,
    });

    // Get all messages for this chat to maintain conversation history
    const chatMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.chatId, currentChatId))
      .orderBy(messages.createdAt);

    // Convert to format expected by providers
    const formattedMessages = chatMessages.map(msg => ({
      role: msg.role as "system" | "user" | "assistant",
      content: msg.content,
    }));

    console.log("🔍 Chat API - Loaded", formattedMessages.length, "messages for chat", currentChatId);

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let fullResponse = "";
        
        try {
          const model = provider === "openai" ? openAIModel : anthropicModel;
          const streamGenerator = provider === "openai" 
            ? callOpenAI(formattedMessages, model)
            : callAnthropic(formattedMessages, model);

          for await (const chunk of streamGenerator) {
            fullResponse += chunk;
            
            // Send chunk to client
            const data = JSON.stringify({ 
              content: chunk, 
              chatId: currentChatId,
              done: false 
            });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }

          // Save complete assistant response to database
          await db.insert(messages).values({
            chatId: currentChatId,
            role: "assistant",
            provider,
            content: fullResponse,
          });

          // Send completion signal
          const finalData = JSON.stringify({ 
            content: "", 
            chatId: currentChatId,
            done: true,
            fullResponse 
          });
          controller.enqueue(encoder.encode(`data: ${finalData}\n\n`));
          
        } catch (error) {
          console.error("Streaming error:", error);
          const errorData = JSON.stringify({ 
            error: "Failed to generate response", 
            chatId: currentChatId,
            done: true 
          });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
        }
        
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}