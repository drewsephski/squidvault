import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Check what tables exist
    const tables = await db.all<{ name: string }>(sql`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      ORDER BY name
    `);

    const hasUserTable = tables.some((t) => t.name === "user");

    if (!hasUserTable) {
      return NextResponse.json({
        tables: tables.map((t) => t.name),
        users: [],
        message: "Better Auth tables not created yet. Sign up a user first.",
      });
    }

    // Query users
    const users = await db.all<{
      id: string;
      name: string;
      email: string;
      email_verified: boolean;
      created_at: number;
    }>(sql`
      SELECT id, name, email, email_verified, created_at 
      FROM user 
      ORDER BY created_at DESC
    `);

    return NextResponse.json({
      tables: tables.map((t) => t.name),
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        emailVerified: u.email_verified,
        createdAt: u.created_at ? new Date(Number(u.created_at)).toISOString() : null,
      })),
      count: users.length,
    });
  } catch (error) {
    console.error("Error listing users:", error);
    return NextResponse.json(
      { error: "Failed to list users", details: String(error) },
      { status: 500 }
    );
  }
}
