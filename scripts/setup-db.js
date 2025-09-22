#!/usr/bin/env node

const path = require('path');
const fs = require('fs');

console.log('🚀 Setting up Crella database...\n');

// 1. Create data directory
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('✅ Created data directory');
} else {
  console.log('✅ Data directory already exists');
}

// 2. Check .env.local file
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (!envContent.includes('DATABASE_URL')) {
    console.log('\n📝 Add this line to your .env.local file:');
    console.log('DATABASE_URL="file:./data/crella.db"');
  } else {
    console.log('✅ DATABASE_URL found in .env.local');
  }
} else {
  console.log('\n📝 Create .env.local file with:');
  console.log('DATABASE_URL="file:./data/crella.db"');
  console.log('OPENAI_API_KEY=your-openai-key');
  console.log('ANTHROPIC_API_KEY=your-anthropic-key');
}

// 3. Initialize database
try {
  const Database = require('better-sqlite3');
  const dbPath = path.join(dataDir, 'crella.db');
  
  console.log('\n🔗 Initializing database at:', dbPath);
  
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
  
  console.log('✅ Database tables created successfully');
  
  // Test insert and select
  const testResult = db.prepare('INSERT INTO chats (title) VALUES (?) RETURNING *').get('Test Chat');
  console.log('✅ Test insert successful:', testResult);
  
  const allChats = db.prepare('SELECT * FROM chats').all();
  console.log('✅ Test select successful:', allChats.length, 'chats found');
  
  db.close();
  
  console.log('\n🎉 Crella database setup complete!');
  console.log('📍 Database location: ./data/crella.db');
  console.log('🚀 Run: pnpm dev');
  
} catch (error) {
  console.error('\n❌ Database setup failed:', error.message);
  console.log('\n💡 Using mock database instead (data will not persist)');
}
