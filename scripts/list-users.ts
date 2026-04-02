// Simple script to list users from the database
import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || "",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function listUsers() {
  try {
    // First, list all tables
    const tablesResult = await client.execute({
      sql: "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name",
    });
    console.log("\n📋 All tables in database:");
    for (const row of tablesResult.rows) {
      console.log(`  - ${row.name}`);
    }

    // Check if user table exists
    const hasUserTable = tablesResult.rows.some((r) => r.name === "user");
    if (!hasUserTable) {
      console.log("\n⚠️  No 'user' table found. Better Auth tables not created yet.");
      console.log("   The tables will be created when the first auth operation occurs.");
      return;
    }

    // Query users
    const result = await client.execute({
      sql: "SELECT id, name, email, email_verified, created_at FROM user ORDER BY created_at DESC",
    });

    console.log("\n👥 Users:\n");
    if (result.rows.length === 0) {
      console.log("No users found.");
    } else {
      for (const user of result.rows) {
        console.log(`  ID:    ${user.id}`);
        console.log(`  Name:  ${user.name || "(no name)"}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Created: ${new Date(Number(user.created_at)).toLocaleString()}`);
        console.log("  ---");
      }
      console.log(`\nTotal: ${result.rows.length} user(s)\n`);
    }
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

listUsers();
