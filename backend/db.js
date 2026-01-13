import Database from 'better-sqlite3';

const db = new Database('search_logs.db');

// Create table if it doesn't exist
db.prepare(`
  CREATE TABLE IF NOT EXISTS searches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    matricule TEXT,
    faculty TEXT,
    ip TEXT,
    status TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

export default db;
