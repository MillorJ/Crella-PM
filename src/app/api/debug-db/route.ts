import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Import the mock database data
    const { getMockData } = await import("@/db/index-mock");
    
    const data = getMockData();
    
    return NextResponse.json({
      database: "mock",
      counts: {
        chats: data.chats.length,
        messages: data.messages.length,
        tasks: data.tasks.length,
        projects: data.projects.length
      },
      data: data
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json({ error: "Debug failed", details: error.message }, { status: 500 });
  }
}
