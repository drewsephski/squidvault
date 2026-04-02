import "better-auth";

declare module "better-auth" {
  interface User {
    plan: "starter" | "vault" | "fortress";
  }
}
