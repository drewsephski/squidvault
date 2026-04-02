---
name: better-auth-nextjs-production-security
description: Production security configuration for Better Auth in Next.js with Stripe integration. Use when hardening authentication, implementing session management, securing production deployments, or integrating one-time payments with Better Auth.
---

# Better Auth Production Security & Stripe

Production security configuration for Better Auth with Next.js and Stripe integration patterns.

## When to Apply

- Hardening Better Auth for production deployment
- Implementing secure session management with rate limiting
- Integrating Stripe one-time payments with authenticated users
- Migrating from development to production auth configuration

## Critical Rules

**Server-Side Session Validation**: Always validate sessions in server components, not just middleware

```typescript
// WRONG - middleware only (optimistic redirect)
export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.redirect(new URL("/sign-in", request.url));
}

// RIGHT - per-page validation in server component
export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");
  return <h1>Welcome {session.user.name}</h1>;
}
```

**Production Cookie Security**: Configure secure cookies and CSRF protection

```typescript
// WRONG - default security settings
export const auth = betterAuth({
  database: new Database("./sqlite.db"),
});

// RIGHT - production security
export const auth = betterAuth({
  database: new Pool({ connectionString: process.env.DATABASE_URL }),
  advanced: {
    useSecureCookies: true,
    disableCSRFCheck: false,
    defaultCookieAttributes: {
      httpOnly: true,
      secure: true,
      sameSite: "lax"
    },
    cookiePrefix: "myapp"
  }
});
```

## Key Patterns

### Production Security Configuration

```typescript
import { betterAuth } from "better-auth";
import { Pool } from "pg";

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  advanced: {
    useSecureCookies: true,
    disableCSRFCheck: false,
    ipAddress: {
      ipAddressHeaders: ["x-forwarded-for", "x-real-ip"],
      ipv6Subnet: 64 // Rate limit by IPv6 subnet
    },
    defaultCookieAttributes: {
      httpOnly: true,
      secure: true,
      sameSite: "lax"
    }
  },
  rateLimit: {
    enabled: true,
    window: 60, // seconds
    max: 100    // requests per window
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 300 // 5 minutes cache
    }
  }
});
```

### Secure Route Protection

```typescript
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <div>
      <h1>Protected Content</h1>
      <p>User: {session.user.email}</p>
    </div>
  );
}
```

### Custom User Fields for Production

```typescript
export const auth = betterAuth({
  user: {
    additionalFields: {
      stripeCustomerId: {
        type: "string",
        required: false,
        input: false // Don't allow user input
      },
      role: {
        type: ["user", "admin"],
        required: false,
        defaultValue: "user",
        input: false
      }
    }
  }
});
```

### Stripe Checkout Integration

```typescript
import { betterAuth } from "better-auth";
import { dodopayments, checkout } from "@dodopayments/better-auth";
import DodoPayments from "dodopayments";

const dodoPayments = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
  environment: process.env.NODE_ENV === "production" ? "live" : "test_mode"
});

export const auth = betterAuth({
  plugins: [
    dodopayments({
      client: dodoPayments,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [
            { productId: "prod_xxx", slug: "premium" }
          ],
          successUrl: "/dashboard/success",
          authenticatedUsersOnly: true
        })
      ]
    })
  ]
});
```

### Client-Side Checkout Flow

```typescript
"use client";
import { authClient } from "@/lib/auth-client";

export function CheckoutButton({ productSlug }: { productSlug: string }) {
  const handleCheckout = async () => {
    const { data, error } = await authClient.dodopayments.checkout({
      slug: productSlug,
      customer: {
        email: session.user.email,
        name: session.user.name
      }
    });
    
    if (data) {
      window.location.href = data.url;
    }
  };

  return <button onClick={handleCheckout}>Purchase</button>;
}
```

## Common Mistakes

- **Middleware-only protection**: Use server components for actual security checks
- **Development rate limits**: Enable rate limiting in production with `enabled: true`
- **Insecure cookies**: Always set `useSecureCookies: true` in production
- **Missing CSRF protection**: Never set `disableCSRFCheck: true` in production
- **Storing sensitive data in user table**: Use separate tables for payment/sensitive data