---
name: launch-mvp-stripe-payments
description: Stripe payments and subscriptions for Launch MVP Next.js template. Use when implementing checkout flows, webhook validation, or subscription handling in the Launch MVP Stripe Next.js Supabase stack. Covers secure payment processing, button ID configuration, and webhook endpoint setup.
---

# Launch MVP Stripe Payments

Secure Stripe payment implementation for Next.js 14 with Supabase integration.

## When to Apply

- Setting up Stripe payment flows in Launch MVP template
- Implementing webhook validation and security
- Configuring subscription billing with Supabase user management
- Securing payment endpoints with proper authentication

## Critical Rules

**Webhook Secret Validation**: Always verify webhook signatures using STRIPE_WEBHOOK_SECRET

```typescript
// WRONG - Processing unverified webhook
export async function POST(req: Request) {
  const body = await req.json()
  // Process payment without verification
}

// RIGHT - Verify webhook signature first
export async function POST(req: Request) {
  const signature = req.headers.get('stripe-signature')
  const body = await req.text()
  
  const event = stripe.webhooks.constructEvent(
    body,
    signature!,
    process.env.STRIPE_WEBHOOK_SECRET!
  )
}
```

**Environment Variable Separation**: Use test vs live keys properly

```typescript
// WRONG - Mixing test and live keys
STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx

// RIGHT - Consistent environment
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

## Key Patterns

### Required Environment Variables

```bash
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_
NEXT_PUBLIC_STRIPE_BUTTON_ID=buy_btn_
STRIPE_SECRET_KEY=sk_live_
STRIPE_WEBHOOK_SECRET=whsec_
```

### Webhook Endpoint Structure

Place webhook handler at `/app/api/stripe/webhook/route.ts`:

```typescript
import { stripe } from '@/utils/stripe'

export async function POST(req: Request) {
  const signature = req.headers.get('stripe-signature')!
  const body = await req.text()
  
  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
    
    switch (event.type) {
      case 'payment_intent.succeeded':
        // Handle successful payment
        break
      case 'customer.subscription.created':
        // Handle subscription creation
        break
    }
    
    return Response.json({ received: true })
  } catch (error) {
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }
}
```

### Supabase User Integration

Sync Stripe customers with Supabase users:

```sql
-- Required trigger function for new user handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, created_at, updated_at, is_deleted)
  VALUES (NEW.id, NEW.email, NOW(), NOW(), FALSE);
  
  INSERT INTO public.user_preferences (user_id, has_completed_onboarding)
  VALUES (NEW.id, FALSE);
  
  INSERT INTO public.user_trials (user_id, trial_start_time, trial_end_time)
  VALUES (NEW.id, NOW(), NOW() + INTERVAL '48 hours');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### MCP Configuration

Configure Stripe MCP server in `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "stripe": {
      "command": "npx",
      "args": ["-y", "@stripe/mcp"],
      "env": {
        "STRIPE_SECRET_KEY": "sk_test_51ABC123..."
      }
    }
  }
}
```

## Directory Structure

```bash
app/
├── api/
│   ├── stripe/          # Stripe payment endpoints
│   │   └── webhook/     # Webhook handler
├── pay/                 # Payment pages
└── dashboard/           # Post-payment dashboard
```

## Common Mistakes

- **Missing webhook endpoint**: Create `/app/api/stripe/webhook/route.ts` for event handling
- **Incorrect button ID format**: Use `buy_btn_` prefix for NEXT_PUBLIC_STRIPE_BUTTON_ID
- **Webhook signature bypass**: Never process webhooks without signature verification
- **Environment mismatch**: Ensure test/live key consistency across all Stripe variables