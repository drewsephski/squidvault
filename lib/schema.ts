import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("active"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const deployments = sqliteTable("deployments", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull(),
  userId: text("user_id").notNull(),
  status: text("status").notNull(), // success, error, pending
  url: text("url"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const activityLogs = sqliteTable("activity_logs", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  action: text("action").notNull(), // created, deployed, updated, failed
  target: text("target").notNull(),
  targetType: text("target_type").notNull().default("project"), // project, deployment
  status: text("status").notNull().default("success"), // success, error
  metadata: text("metadata"), // JSON string
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const apiMetrics = sqliteTable("api_metrics", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  requestCount: integer("request_count").notNull().default(0),
  avgResponseTime: real("avg_response_time").notNull().default(0),
  date: integer("date", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Videos table for private video vault
export const videos = sqliteTable("videos", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  // Storage path for encrypted video chunks
  storagePath: text("storage_path").notNull(),
  // Original file metadata
  originalSize: integer("original_size").notNull(),
  mimeType: text("mime_type").notNull(),
  // Encryption metadata (stored with video, key is NOT stored - user must provide)
  encryptionSalt: text("encryption_salt").notNull(),
  encryptionIv: text("encryption_iv").notNull(),
  // Video metadata
  duration: integer("duration"), // in seconds
  thumbnailPath: text("thumbnail_path"), // encrypted thumbnail
  // Access control
  isPublic: integer("is_public", { mode: "boolean" }).notNull().default(false),
  accessCode: text("access_code"), // optional additional access code
  viewCount: integer("view_count").notNull().default(0),
  // Timestamps
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Video access logs for audit trail
export const videoAccessLogs = sqliteTable("video_access_logs", {
  id: text("id").primaryKey(),
  videoId: text("video_id").notNull(),
  userId: text("user_id"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  action: text("action").notNull(), // view, download, failed_access
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const projectsRelations = relations(projects, ({ many }) => ({
  deployments: many(deployments),
  activities: many(activityLogs),
}));

export const deploymentsRelations = relations(deployments, ({ one }) => ({
  project: one(projects, {
    fields: [deployments.projectId],
    references: [projects.id],
  }),
}));

export const videosRelations = relations(videos, ({ one, many }) => ({
  accessLogs: many(videoAccessLogs),
}));

export const videoAccessLogsRelations = relations(videoAccessLogs, ({ one }) => ({
  video: one(videos, {
    fields: [videoAccessLogs.videoId],
    references: [videos.id],
  }),
}));

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Deployment = typeof deployments.$inferSelect;
export type NewDeployment = typeof deployments.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type ApiMetric = typeof apiMetrics.$inferSelect;
export type NewApiMetric = typeof apiMetrics.$inferInsert;
export type Video = typeof videos.$inferSelect;
export type NewVideo = typeof videos.$inferInsert;
export type VideoAccessLog = typeof videoAccessLogs.$inferSelect;
export type NewVideoAccessLog = typeof videoAccessLogs.$inferInsert;
