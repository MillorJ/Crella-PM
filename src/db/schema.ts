import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const chats = sqliteTable("chats", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  createdAt: integer("created_at").default(sql`(strftime('%s','now'))`).notNull(),
  title: text("title"),
});

export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  chatId: integer("chat_id").notNull(),
  role: text("role", { enum: ["user", "assistant", "system"] }).notNull(),
  provider: text("provider", { enum: ["openai", "anthropic"] }).notNull(),
  content: text("content").notNull(),
  createdAt: integer("created_at").default(sql`(strftime('%s','now'))`).notNull(),
});

export const projects = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: integer("created_at").default(sql`(strftime('%s','now'))`).notNull(),
});

export const tasks = sqliteTable("tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id"),
  title: text("title").notNull(),
  status: text("status", { enum: ["todo", "in_progress", "blocked", "done"] }).default("todo").notNull(),
  owner: text("owner"),
  dueDate: text("due_date"), // YYYY-MM-DD
  notes: text("notes"),
  createdAt: integer("created_at").default(sql`(strftime('%s','now'))`).notNull(),
});
