import { NextResponse } from "next/server";
import { db } from "@/db";

export async function GET() {
  try {
    // Try to identify which database we're using
    let dbType = "unknown";
    let tableExists = false;
    
    try {
      // Try to select from chats table
      const result = await db.select().from({ name: 'chats' }).orderBy();
      dbType = "real-sqlite";
      tableExists = true;
    } catch (error: any) {
      if (error.message?.includes("no such table")) {
        dbType = "real-sqlite-no-tables";
      } else {
        dbType = "mock-database";
      }
    }
    
    return NextResponse.json({
      databaseType: dbType,
      tableExists,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      databaseType: "error"
    });
  }
}
