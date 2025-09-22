const Database = require('better-sqlite3');
const path = require('path');

// Create the database file
const dbPath = path.join(__dirname, '..', '.data', 'local.sqlite');
console.log('Creating database at:', dbPath);

const db = new Database(dbPath);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS chats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at INTEGER DEFAULT (strftime('%s','now')) NOT NULL,
    title TEXT
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chat_id INTEGER NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    provider TEXT NOT NULL CHECK (provider IN ('openai', 'anthropic')),
    content TEXT NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s','now')) NOT NULL
  );

  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    created_at INTEGER DEFAULT (strftime('%s','now')) NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'blocked', 'done')),
    owner TEXT,
    due_date TEXT,
    notes TEXT,
    created_at INTEGER DEFAULT (strftime('%s','now')) NOT NULL
  );
`);

console.log('Database initialized successfully!');
console.log('Database location:', dbPath);

// Show table info
console.log('\nTable structure:');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
tables.forEach(table => {
  console.log(`\n${table.name}:`);
  const columns = db.prepare(`PRAGMA table_info(${table.name})`).all();
  columns.forEach(col => {
    console.log(`  - ${col.name}: ${col.type}${col.pk ? ' (PRIMARY KEY)' : ''}${col.notnull ? ' NOT NULL' : ''}`);
  });
});

db.close();
