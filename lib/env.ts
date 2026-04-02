/**
 * Environment variable validation utilities
 * Ensures required env vars are set before the app starts
 */

export class EnvError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EnvError";
  }
}

/**
 * Get a required environment variable or throw an error
 */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new EnvError(
      `Missing required environment variable: ${name}\n` +
        `Please check your .env file or environment configuration.`
    );
  }
  return value;
}

/**
 * Get an optional environment variable with a default value
 */
export function getEnv(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue;
}

/**
 * Validate all required environment variables at startup
 * Call this in layout.tsx or middleware to fail fast
 */
export function validateEnv(): void {
  const required = [
    "TURSO_DATABASE_URL",
    "TURSO_AUTH_TOKEN",
    "BETTER_AUTH_SECRET",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
  ];

  const missing: string[] = [];

  for (const name of required) {
    const value = process.env[name];
    if (!value || value.trim() === "" || value.includes("your-")) {
      missing.push(name);
    }
  }

  if (missing.length > 0) {
    throw new EnvError(
      `Missing required environment variables:\n${missing.map((n) => `  - ${n}`).join("\n")}\n\n` +
        `Please set these variables in your .env file or environment.\n` +
        `See .env.example for reference.`
    );
  }
}

// Pre-validated exports for commonly used env vars
// These will throw at import time if not set, ensuring early failure

export const TURSO_DATABASE_URL = requireEnv("TURSO_DATABASE_URL");
export const TURSO_AUTH_TOKEN = requireEnv("TURSO_AUTH_TOKEN");
export const BETTER_AUTH_SECRET = requireEnv("BETTER_AUTH_SECRET");
export const BETTER_AUTH_URL = getEnv("BETTER_AUTH_URL", "http://localhost:3000");
export const STRIPE_SECRET_KEY = requireEnv("STRIPE_SECRET_KEY");
export const STRIPE_WEBHOOK_SECRET = requireEnv("STRIPE_WEBHOOK_SECRET");
export const LOG_LEVEL = getEnv("LOG_LEVEL", "info");

// OAuth - these are optional if not using OAuth
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
export const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || "";
export const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || "";

// Storage
export const R2_ENDPOINT = process.env.R2_ENDPOINT || "";
export const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || "";
export const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || "";
export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "";
