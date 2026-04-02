import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { projects } from "@/lib/schema";
import { logger } from "@/lib/logger";
import { sql } from "drizzle-orm";

/**
 * Health check endpoint for monitoring and load balancers
 * Returns 200 OK if all critical services are operational
 */
export async function GET() {
  const checks = {
    database: false,
    timestamp: new Date().toISOString(),
  };

  try {
    // Test database connection with a simple query
    await db.select({ count: sql<number>`count(*)` }).from(projects).limit(1);
    checks.database = true;
  } catch (error) {
    logger.error("Health check: Database connection failed", {}, error);
    checks.database = false;
  }

  const isHealthy = checks.database;

  const status = isHealthy ? 200 : 503;
  const statusText = isHealthy ? "healthy" : "unhealthy";

  return NextResponse.json(
    {
      status: statusText,
      checks,
      version: process.env.APP_VERSION || "0.1.0",
    },
    {
      status,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    }
  );
}
