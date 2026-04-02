// List users script - run with: node --env-file=.env.local scripts/list-users.mjs
import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN");
  process.exit(1);
}

const client = createClient({ url, authToken });

async function main() {
  try {
    const result = await client.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
    console.log("\n📋 Tables:");
    for (const row of result.rows) {
      console.log(`  - ${row.name}`);
    }

    const hasUser = result.rows.some(r => r.name === "user");
    if (!hasUser) {
      console.log("\n⚠️  No 'user' table found");
      return;
    }

    const users = await client.execute("SELECT id, name, email, created_at FROM user ORDER BY created_at DESC");
    console.log("\n👥 Users:");
    if (users.rows.length === 0) {
      console.log("  No users found");
    } else {
      for (const u of users.rows) {
        console.log(`\n  ID: ${u.id}`);
        console.log(`  Name: ${u.name || "(none)"}`);
        console.log(`  Email: ${u.email}`);
        console.log(`  Created: ${new Date(Number(u.created_at)).toLocaleString()}`);
      }
      console.log(`\nTotal: ${users.rows.length} user(s)`);
    }
  } catch (e) {
    console.error("Error:", e.message);
    process.exit(1);
  }
}

main();
