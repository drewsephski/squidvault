import { Database } from "bun:sqlite";
import { join } from "path";

const db = new Database(join(process.cwd(), "sqlite.db"));

// User table
db.exec(`
  CREATE TABLE IF NOT EXISTS user (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    emailVerified INTEGER,
    name TEXT,
    image TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Session table
db.exec(`
  CREATE TABLE IF NOT EXISTS session (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expiresAt DATETIME NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    ipAddress TEXT,
    userAgent TEXT
  )
`);

// Account table
db.exec(`
  CREATE TABLE IF NOT EXISTS account (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    accountId TEXT NOT NULL,
    providerId TEXT NOT NULL,
    accessToken TEXT,
    refreshToken TEXT,
    accessTokenExpiresAt DATETIME,
    refreshTokenExpiresAt DATETIME,
    scope TEXT,
    idToken TEXT,
    password TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(providerId, accountId)
  )
`);

// Verification table
db.exec(`
  CREATE TABLE IF NOT EXISTS verification (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    expiresAt DATETIME NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Drop and recreate videos tables with correct column names
db.exec(`DROP TABLE IF EXISTS video_access_logs`);
db.exec(`DROP TABLE IF EXISTS videos`);
db.exec(`DROP TABLE IF EXISTS activity_logs`);

// Activity logs table (no foreign key to avoid better-auth conflicts)
db.exec(`
  CREATE TABLE IF NOT EXISTS activity_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    action TEXT NOT NULL,
    target TEXT NOT NULL,
    target_type TEXT NOT NULL DEFAULT 'project',
    status TEXT NOT NULL DEFAULT 'success',
    metadata TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Videos table for private video vault - using snake_case for Drizzle
// Note: user_id is not a foreign key to avoid conflicts with better-auth's user table
db.exec(`
  CREATE TABLE IF NOT EXISTS videos (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    storage_path TEXT NOT NULL,
    original_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    encryption_salt TEXT NOT NULL,
    encryption_iv TEXT NOT NULL,
    duration INTEGER,
    thumbnail_path TEXT,
    is_public INTEGER DEFAULT 0,
    access_code TEXT,
    view_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Video access logs for audit trail - using snake_case for Drizzle
db.exec(`
  CREATE TABLE IF NOT EXISTS video_access_logs (
    id TEXT PRIMARY KEY,
    video_id TEXT NOT NULL,
    user_id TEXT,
    ip_address TEXT,
    user_agent TEXT,
    action TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

console.log("Database schema created successfully!");
db.close();
