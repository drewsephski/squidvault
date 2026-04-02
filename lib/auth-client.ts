import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // Base URL is automatically inferred in Next.js
  // You can add custom configuration here if needed
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient;
