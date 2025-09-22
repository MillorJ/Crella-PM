import { NextResponse } from "next/server";
import { db } from "@/db";
import { chats } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const allChats = await db
      .select()
      .from(chats)
      .orderBy(desc(chats.createdAt));

    return NextResponse.json({ chats: allChats });
  } catch (error) {
    console.error("Chats GET API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
