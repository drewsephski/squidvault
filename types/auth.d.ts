import "better-auth";

declare module "better-auth" {
  export interface User {
    plan: "starter" | "professional" | "practice";
  }
}
