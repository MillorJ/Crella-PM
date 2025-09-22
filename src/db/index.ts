import * as schema from "./schema";

// Try to use real database, fallback to mock if bindings fail
let db: any;
let eq: any;
let Schema: typeof schema;

try {
  // Attempt to load better-sqlite3
  const Database = require("better-sqlite3");
  const { drizzle } = require("drizzle-orm/better-sqlite3");
  const { eq: drizzleEq } = require("drizzle-orm");
  
  const sqlite = new Database(".data/local.sqlite");
  db = drizzle(sqlite, { schema });
  eq = drizzleEq;
  Schema = schema;
  
  console.log("✅ Connected to SQLite database at .data/local.sqlite");
  
} catch (error) {
  console.warn("⚠️  better-sqlite3 bindings not available, using mock database");
  console.warn("📝 Install/rebuild better-sqlite3 for persistent storage");
  
  // Use mock database
  const mockDb = require("./index-mock");
  db = mockDb.db;
  eq = mockDb.eq;
  Schema = mockDb.Schema;
}

export { db, eq };
export type { Schema };
