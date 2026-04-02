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
CREATE UNIQUE INDEX `purchases_stripe_session_id_unique` ON `purchases` (`stripe_session_id`);--> statement-breakpoint
CREATE INDEX `purchases_user_id_idx` ON `purchases` (`user_id`);--> statement-breakpoint
CREATE INDEX `purchases_stripe_session_idx` ON `purchases` (`stripe_session_id`);--> statement-breakpoint
CREATE INDEX `purchases_status_idx` ON `purchases` (`status`);--> statement-breakpoint
CREATE TABLE `video_shares` (
	`id` text PRIMARY KEY NOT NULL,
	`video_id` text NOT NULL,
	`created_by` text NOT NULL,
	`wrapped_key` text NOT NULL,
	`salt` text NOT NULL,
	`expires_at` integer,
	`max_views` integer,
	`view_count` integer DEFAULT 0 NOT NULL,
	`is_revoked` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`last_accessed_at` integer
);
--> statement-breakpoint
CREATE INDEX `video_shares_video_id_idx` ON `video_shares` (`video_id`);--> statement-breakpoint
CREATE INDEX `video_shares_expires_at_idx` ON `video_shares` (`expires_at`);--> statement-breakpoint
CREATE INDEX `video_shares_is_revoked_idx` ON `video_shares` (`is_revoked`);