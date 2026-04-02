CREATE TABLE `purchases` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`stripe_session_id` text NOT NULL,
	`stripe_payment_intent_id` text,
	`tier_id` text NOT NULL,
	`amount` integer NOT NULL,
	`currency` text DEFAULT 'usd' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `purchases_stripe_session_idx` ON `purchases` (`stripe_session_id`);--> statement-breakpoint
CREATE INDEX `purchases_user_id_idx` ON `purchases` (`user_id`);--> statement-breakpoint
CREATE INDEX `purchases_status_idx` ON `purchases` (`status`);
