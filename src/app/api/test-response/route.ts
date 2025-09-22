import { NextRequest, NextResponse } from "next/server";
import { db, eq } from "@/db";
import { chats, messages } from "@/db/schema";
import { CRELLA_SYSTEM } from "@/lib/crella";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      chatId,
      provider = "openai",
      userText,
      system = CRELLA_SYSTEM,
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

    // Create a mock response that simulates streaming
    const testResponse = `Hello! I'm Crella, your PM assistant. You said: "${userText}". Here are some next actions:

• **Review your message** - I've recorded it in chat ${currentChatId}
• **Plan next steps** - What project would you like to work on?
• **Create tasks** - Use /task to add items to your backlog

How can I help you manage your projects today?`;

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Split response into chunks
        const words = testResponse.split(' ');
        
        for (let i = 0; i < words.length; i++) {
          const chunk = (i === 0) ? words[i] : ' ' + words[i];
          
          const data = JSON.stringify({ 
            content: chunk, 
            chatId: currentChatId,
            done: false 
          });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          
          // Simulate typing delay
          await new Promise(resolve => setTimeout(resolve, 50));
        }

        // Save complete assistant response to database
        await db.insert(messages).values({
          chatId: currentChatId,
          role: "assistant",
          provider,
          content: testResponse,
        });

        // Send completion signal
        const finalData = JSON.stringify({ 
          content: "", 
          chatId: currentChatId,
          done: true,
          fullResponse: testResponse 
        });
        controller.enqueue(encoder.encode(`data: ${finalData}\n\n`));
        
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
    console.error("Test response API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
