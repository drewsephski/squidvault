CREATE TABLE `activity_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`action` text NOT NULL,
	`target` text NOT NULL,
	`target_type` text DEFAULT 'project' NOT NULL,
	`status` text DEFAULT 'success' NOT NULL,
	`metadata` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `activity_logs_user_id_idx` ON `activity_logs` (`user_id`);--> statement-breakpoint
CREATE INDEX `activity_logs_created_at_idx` ON `activity_logs` (`created_at`);--> statement-breakpoint
CREATE TABLE `api_metrics` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`request_count` integer DEFAULT 0 NOT NULL,
	`avg_response_time` real DEFAULT 0 NOT NULL,
	`date` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `deployments` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`user_id` text NOT NULL,
	`status` text NOT NULL,
	`url` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `deployments_project_id_idx` ON `deployments` (`project_id`);--> statement-breakpoint
CREATE INDEX `deployments_user_id_idx` ON `deployments` (`user_id`);--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `projects_user_id_idx` ON `projects` (`user_id`);--> statement-breakpoint
CREATE TABLE `video_access_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`video_id` text NOT NULL,
	`user_id` text,
	`ip_address` text,
	`user_agent` text,
	`action` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `video_access_logs_video_id_idx` ON `video_access_logs` (`video_id`);--> statement-breakpoint
CREATE INDEX `video_access_logs_user_id_idx` ON `video_access_logs` (`user_id`);--> statement-breakpoint
CREATE TABLE `videos` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`storage_path` text NOT NULL,
	`original_size` integer NOT NULL,
	`mime_type` text NOT NULL,
	`encryption_salt` text NOT NULL,
	`encryption_iv` text NOT NULL,
	`duration` integer,
	`thumbnail_path` text,
	`is_public` integer DEFAULT false NOT NULL,
	`access_code` text,
	`view_count` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `videos_user_id_idx` ON `videos` (`user_id`);--> statement-breakpoint
CREATE INDEX `videos_storage_path_idx` ON `videos` (`storage_path`);