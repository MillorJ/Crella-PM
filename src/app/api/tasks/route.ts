import { NextRequest } from "next/server";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { z } from "zod";
import { eq } from "drizzle-orm";

const Create = z.object({ title: z.string().min(1), projectId: z.number().optional(), owner: z.string().optional(), dueDate: z.string().optional(), notes: z.string().optional() });
const Update = z.object({ id: z.number(), status: z.enum(["todo", "in_progress", "blocked", "done"]).optional(), owner: z.string().optional(), dueDate: z.string().optional(), notes: z.string().optional(), title: z.string().optional() });

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body?.id) {
    const input = Update.parse(body);
    await db.update(tasks).set({ ...input, id: undefined }).where(eq(tasks.id, input.id));
    return Response.json({ ok: true, action: "updated", id: input.id });
  }
  const input = Create.parse(body);
  const [row] = await db.insert(tasks).values(input).returning({ id: tasks.id });
  return Response.json({ ok: true, action: "created", id: row.id });
}
