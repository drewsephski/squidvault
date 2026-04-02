import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { customSession } from "better-auth/plugins";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db, schema } from "./db";
import { getUserActivePlan } from "./data";
import { sendPasswordResetEmail } from "./email";
import {
  BETTER_AUTH_SECRET,
  BETTER_AUTH_URL,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  BETTER_AUTH_TRUSTED_ORIGINS,
} from "./env";

const trustedOrigins = BETTER_AUTH_TRUSTED_ORIGINS
  ? BETTER_AUTH_TRUSTED_ORIGINS.split(",").map((o) => o.trim())
  : [BETTER_AUTH_URL];

const socialProviders: Record<string, { clientId: string; clientSecret: string }> = {};

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  socialProviders.google = {
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
  };
}

if (GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET) {
  socialProviders.github = {
    clientId: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
  };
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema,
  }),
  secret: BETTER_AUTH_SECRET,
  baseURL: BETTER_AUTH_URL,
  trustedOrigins,
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    disableCSRFCheck: false,
    disableOriginCheck: false,
    ipAddress: {
      ipAddressHeaders: ["x-forwarded-for", "x-real-ip", "cf-connecting-ip"],
      ipv6Subnet: 64,
      disableIpTracking: false,
    },
    defaultCookieAttributes: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      path: "/",
    },
    cookiePrefix: process.env.NODE_ENV === "production" ? "__Host-squidvault" : "squidvault",
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    customRules: {
      "/api/auth/sign-in": {
        window: 60,
        max: 5,
      },
      "/api/auth/sign-up": {
        window: 60,
        max: 3,
      },
      "/api/auth/forgot-password": {
        window: 3600,
        max: 3,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minute cache (per Better Auth best practices)
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false, // Set to true if you add email verification
    minPasswordLength: 8,
    maxPasswordLength: 128,
    sendResetPassword: async ({ user, url }) => {
      void sendPasswordResetEmail(user.email, url);
    },
  },
  socialProviders,
  plugins: [
    nextCookies(),
    customSession(async ({ user, session }) => {
      const plan = await getUserActivePlan(user.id);
      return {
        user: {
          ...user,
          plan,
        },
        session,
      };
    }),
  ],
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // Set default plan for new users
          return {
            data: {
              ...user,
              plan: "starter",
            },
          };
        },
      },
    },
  },
});
