import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if this is an update (has id) or create (no id)
    if (body.id) {
      // Update existing task
      const updateData: any = {};
      
      if (body.status !== undefined) updateData.status = body.status;
      if (body.title !== undefined) updateData.title = body.title;
      if (body.owner !== undefined) updateData.owner = body.owner;
      if (body.dueDate !== undefined) updateData.dueDate = body.dueDate;
      if (body.notes !== undefined) updateData.notes = body.notes;
      if (body.projectId !== undefined) updateData.projectId = body.projectId;

      const [updatedTask] = await db
        .update(tasks)
        .set(updateData)
        .where(eq(tasks.id, body.id))
        .returning();

      if (!updatedTask) {
        return NextResponse.json(
          { error: "Task not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        ok: true,
        id: updatedTask.id,
        action: "updated",
        task: updatedTask,
      });
    } else {
      // Create new task
      const { title, projectId, owner, dueDate, notes, status = "todo" } = body;

      if (!title?.trim()) {
        return NextResponse.json(
          { error: "Task title is required" },
          { status: 400 }
        );
      }

      const [newTask] = await db
        .insert(tasks)
        .values({
          title: title.trim(),
          projectId,
          owner,
          dueDate,
          notes,
          status,
        })
        .returning();

      return NextResponse.json({
        ok: true,
        id: newTask.id,
        action: "created",
        task: newTask,
      });
    }
  } catch (error) {
    console.error("Tasks API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const status = searchParams.get("status");

    let query = db.select().from(tasks);

    if (projectId) {
      query = query.where(eq(tasks.projectId, parseInt(projectId)));
    }

    if (status) {
      query = query.where(eq(tasks.status, status as any));
    }

    const allTasks = await query.orderBy(tasks.createdAt);

    return NextResponse.json({ tasks: allTasks });
  } catch (error) {
    console.error("Tasks GET API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}