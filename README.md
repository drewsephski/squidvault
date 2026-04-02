# SquidVault

Private video vault with encrypted storage and secure sharing.

## Features

- **Encrypted Video Storage**: Client-side encryption before upload to S3/R2
- **Secure Sharing**: Password-protected share links with optional expiration and view limits
- **One-time Payments**: Stripe checkout for tier upgrades (Starter, Vault, Fortress)
- **Better Auth**: Email/password + Google/GitHub OAuth

## Quick Start

```bash
# Install dependencies
bun install

# Set up environment
cp .env.example .env.local
# Fill in your Turso, Stripe, R2, and OAuth credentials

# Run migrations
bun run scripts/migrate.ts

# Start dev server
bun run dev
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `TURSO_DATABASE_URL` | Yes | Turso database URL |
| `TURSO_AUTH_TOKEN` | Yes | Turso auth token |
| `BETTER_AUTH_SECRET` | Yes | Generate with `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | Yes | Your app URL (e.g., `http://localhost:3000`) |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook secret |
| `R2_ENDPOINT` | Yes | Cloudflare R2 endpoint |
| `R2_ACCESS_KEY_ID` | Yes | R2 access key |
| `R2_SECRET_ACCESS_KEY` | Yes | R2 secret key |
| `GOOGLE_CLIENT_ID` | No | For Google OAuth |
| `GITHUB_CLIENT_ID` | No | For GitHub OAuth |

## Deploy

Build passes? Good to go:

```bash
bun run build
```

Configure `BETTER_AUTH_URL` and Stripe webhook to your production domain before deploying.

## API

- `POST /api/checkout` - Create Stripe checkout session
- `POST /api/webhooks/stripe` - Stripe webhook handler
- `GET /api/health` - Health check

## License

MIT
