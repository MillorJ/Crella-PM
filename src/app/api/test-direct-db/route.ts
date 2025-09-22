import { NextResponse } from "next/server";
import { db } from "@/db";
import { chats } from "@/db/schema";

export async function POST() {
  try {
    console.log("🔍 Testing direct database operations...");
    
    // Try to insert a test chat
    const testChat = {
      title: "Direct DB Test " + Date.now(),
    };
    
    console.log("🔍 Inserting test chat:", testChat);
    const insertResult = await db.insert(chats).values(testChat).returning();
    console.log("🔍 Insert result:", insertResult);
    
    // Try to select all chats using different approaches
    console.log("🔍 Selecting all chats...");
    
    // Method 1: Standard Drizzle select
    const selectResult1 = await db.select().from(chats);
    console.log("🔍 Method 1 result:", selectResult1);
    
    // Method 2: Select with explicit columns
    const selectResult2 = await db.select({
      id: chats.id,
      title: chats.title,
      createdAt: chats.createdAt
    }).from(chats);
    console.log("🔍 Method 2 result:", selectResult2);
    
    // Method 3: Query method if available
    try {
      const selectResult3 = await db.query.chats.findMany();
      console.log("🔍 Method 3 result:", selectResult3);
    } catch (e) {
      console.log("🔍 Method 3 failed:", e.message);
    }
    
    return NextResponse.json({
      success: true,
      inserted: insertResult,
      method1: { result: selectResult1, type: typeof selectResult1, isArray: Array.isArray(selectResult1) },
      method2: { result: selectResult2, type: typeof selectResult2, isArray: Array.isArray(selectResult2) }
    });
    
  } catch (error: any) {
    console.error("Direct DB test error:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}
