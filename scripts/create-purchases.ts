import { createClient } from "@libsql/client";

const client = createClient({
  url: "libsql://squidcoder-drew.aws-us-east-1.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NzUxMDAyODMsImlkIjoiMDE5ZDRjMzMtMTcwMS03NjY3LTg3ZGItMzBmOWFlZGIzMDhjIiwicmlkIjoiYzFjMDZjOGQtNTU3Yi00MzYzLTk2MmQtZWYwYWUzM2E1MDQwIn0.WpZJDgsjTgMY1j-WsJmH3BMUZ4nyK-Yh-kVsSFZLykgEi8znFfYffZ3UYv5tyxtmdHOLPa6igPR32D-_UVEGCw"
});

async function createPurchasesTable() {
  try {
    await client.execute(`CREATE TABLE IF NOT EXISTS purchases (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      stripe_session_id TEXT NOT NULL UNIQUE,
      stripe_payment_intent_id TEXT,
      tier_id TEXT NOT NULL,
      amount INTEGER NOT NULL,
      currency TEXT DEFAULT 'usd' NOT NULL,
      status TEXT DEFAULT 'pending' NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )`);

    await client.execute("CREATE INDEX IF NOT EXISTS purchases_user_id_idx ON purchases (user_id)");
    await client.execute("CREATE INDEX IF NOT EXISTS purchases_status_idx ON purchases (status)");

    console.log("✅ purchases table created successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating table:", error);
    process.exit(1);
  }
}

createPurchasesTable();
