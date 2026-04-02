-- Migration: Add stripe_customers table for mapping users to Stripe customers
-- Created: 2026-04-02

CREATE TABLE IF NOT EXISTS stripe_customers (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    stripe_customer_id TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Index for efficient lookups
CREATE INDEX IF NOT EXISTS stripe_customers_user_id_idx ON stripe_customers(user_id);
CREATE INDEX IF NOT EXISTS stripe_customers_stripe_customer_id_idx ON stripe_customers(stripe_customer_id);
