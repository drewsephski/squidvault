CREATE TABLE `share_view_events` (
	`id` text PRIMARY KEY NOT NULL,
	`share_id` text NOT NULL,
	`video_id` text NOT NULL,
	`ip_hash` text,
	`user_agent` text,
	`watch_duration` integer,
	`completed` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `share_view_events_share_id_idx` ON `share_view_events` (`share_id`);--> statement-breakpoint
CREATE INDEX `share_view_events_video_id_idx` ON `share_view_events` (`video_id`);--> statement-breakpoint
CREATE INDEX `share_view_events_created_at_idx` ON `share_view_events` (`created_at`);
