import { NextRequest, NextResponse } from "next/server";
import { db, eq } from "@/db";
import { messages } from "@/db/schema";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const chatId = parseInt(params.id);
    
    if (isNaN(chatId)) {
      return NextResponse.json(
        { error: "Invalid chat ID" },
        { status: 400 }
      );
    }

    const chatMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.chatId, chatId))
      .orderBy(messages.createdAt);

    return NextResponse.json({ messages: chatMessages });
  } catch (error) {
    console.error("Chat messages GET API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
