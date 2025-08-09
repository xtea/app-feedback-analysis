const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs-extra');

const dbPath = path.join(__dirname, '../data/app.db');
fs.ensureDirSync(path.dirname(dbPath));

const db = new Database(dbPath);

// Enable WAL for better concurrency
db.pragma('journal_mode = WAL');

// Schema
db.exec(`
CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  app_id TEXT NOT NULL,
  store TEXT NOT NULL,
  rating REAL,
  title TEXT,
  content TEXT,
  author TEXT,
  date TEXT,
  sentiment TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_reviews_app_store ON reviews(app_id, store);

CREATE TABLE IF NOT EXISTS analyses (
  app_id TEXT NOT NULL,
  store TEXT NOT NULL,
  summary_json TEXT NOT NULL,
  positive_json TEXT,
  negative_json TEXT,
  timestamp TEXT NOT NULL,
  PRIMARY KEY (app_id, store)
);

CREATE TABLE IF NOT EXISTS jobs (
  job_id TEXT PRIMARY KEY,
  app_id TEXT NOT NULL,
  store TEXT NOT NULL,
  status TEXT NOT NULL,
  progress INTEGER NOT NULL,
  message TEXT,
  result_json TEXT,
  error TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
`);

module.exports = db;


