import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { customSession } from "better-auth/plugins";
import { getUserActivePlan } from "./data";
import {
  BETTER_AUTH_SECRET,
  BETTER_AUTH_URL,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
} from "./env";

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
  secret: BETTER_AUTH_SECRET,
  baseURL: BETTER_AUTH_URL,
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 7 * 24 * 60 * 60, // 7 days
    },
  },
  emailAndPassword: {
    enabled: true,
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
