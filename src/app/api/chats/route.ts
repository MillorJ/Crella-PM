import { NextResponse } from "next/server";
import { db } from "@/db";
import { chats } from "@/db/schema";

export async function GET() {
  try {
    const allChats = await db.select().from(chats);
    
    // Ensure we return an array (for both mock and real database)
    const chatsArray = Array.isArray(allChats) ? allChats : [];
    
    return NextResponse.json({ chats: chatsArray });
  } catch (error) {
    console.error("Chats GET API error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
