// Quick database connectivity test
const Database = require('better-sqlite3');
const path = require('path');

console.log('🔍 Testing database connectivity...\n');

try {
  const dbPath = path.join(__dirname, '.data', 'local.sqlite');
  console.log('Database path:', dbPath);
  
  const db = new Database(dbPath);
  console.log('✅ Database connection successful!');
  
  // Check if tables exist
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('\n📋 Tables found:');
  tables.forEach(table => {
    console.log(`  - ${table.name}`);
  });
  
  if (tables.length === 0) {
    console.log('\n⚠️  No tables found. Creating basic structure...');
    
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
    
    console.log('✅ Tables created successfully!');
    
    // Verify tables were created
    const newTables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log('\n📋 Tables now available:');
    newTables.forEach(table => {
      console.log(`  - ${table.name}`);
    });
  }
  
  db.close();
  console.log('\n🎯 Database is ready for use!');
  
} catch (error) {
  console.error('❌ Database test failed:', error.message);
  process.exit(1);
}
