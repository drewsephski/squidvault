import Database from "better-sqlite3";
import { join } from "path";

const db = new Database(join(process.cwd(), "sqlite.db"));

// App tables

// Projects table
db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id)
  )
`);

// Deployments table
db.exec(`
  CREATE TABLE IF NOT EXISTS deployments (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    status TEXT NOT NULL,
    url TEXT,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (user_id) REFERENCES user(id)
  )
`);

// Activity logs table
db.exec(`
  CREATE TABLE IF NOT EXISTS activity_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    action TEXT NOT NULL,
    target TEXT NOT NULL,
    target_type TEXT NOT NULL DEFAULT 'project',
    status TEXT NOT NULL DEFAULT 'success',
    metadata TEXT,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id)
  )
`);

// API metrics table
db.exec(`
  CREATE TABLE IF NOT EXISTS api_metrics (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    request_count INTEGER NOT NULL DEFAULT 0,
    avg_response_time REAL NOT NULL DEFAULT 0,
    date INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id)
  )
`);

console.log("App tables created successfully!");
db.close();
