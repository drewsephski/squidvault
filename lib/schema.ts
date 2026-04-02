import { sqliteTable, text, integer, real, index } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("active"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => ({
  userIdIdx: index("projects_user_id_idx").on(table.userId),
}));

export const deployments = sqliteTable("deployments", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull(),
  userId: text("user_id").notNull(),
  status: text("status").notNull(), // success, error, pending
  url: text("url"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => ({
  projectIdIdx: index("deployments_project_id_idx").on(table.projectId),
  userIdIdx: index("deployments_user_id_idx").on(table.userId),
}));

export const activityLogs = sqliteTable("activity_logs", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  action: text("action").notNull(), // created, deployed, updated, failed
  target: text("target").notNull(),
  targetType: text("target_type").notNull().default("project"), // project, deployment
  status: text("status").notNull().default("success"), // success, error
  metadata: text("metadata"), // JSON string
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => ({
  userIdIdx: index("activity_logs_user_id_idx").on(table.userId),
  createdAtIdx: index("activity_logs_created_at_idx").on(table.createdAt),
}));

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
}, (table) => ({
  userIdIdx: index("videos_user_id_idx").on(table.userId),
  storagePathIdx: index("videos_storage_path_idx").on(table.storagePath),
}));

// Video access logs for audit trail
export const videoAccessLogs = sqliteTable("video_access_logs", {
  id: text("id").primaryKey(),
  videoId: text("video_id").notNull(),
  userId: text("user_id"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  action: text("action").notNull(), // view, download, failed_access
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => ({
  videoIdIdx: index("video_access_logs_video_id_idx").on(table.videoId),
  userIdIdx: index("video_access_logs_user_id_idx").on(table.userId),
}));

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

// Video shares for secure sharing with password protection
export const videoShares = sqliteTable("video_shares", {
  id: text("id").primaryKey(), // URL-safe token
  videoId: text("video_id").notNull(),
  createdBy: text("created_by").notNull(),
  
  // Encrypted key material (client-side encrypted with share password)
  wrappedKey: text("wrapped_key").notNull(), // video data key encrypted with share password
  salt: text("salt").notNull(), // for KEK derivation
  
  // Access control
  expiresAt: integer("expires_at", { mode: "timestamp" }),
  maxViews: integer("max_views"),
  viewCount: integer("view_count").notNull().default(0),
  isRevoked: integer("is_revoked", { mode: "boolean" }).notNull().default(false),
  
  // Timestamps
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  lastAccessedAt: integer("last_accessed_at", { mode: "timestamp" }),
}, (table) => ({
  videoIdIdx: index("video_shares_video_id_idx").on(table.videoId),
  expiresAtIdx: index("video_shares_expires_at_idx").on(table.expiresAt),
  isRevokedIdx: index("video_shares_is_revoked_idx").on(table.isRevoked),
}));

// User purchases for tracking one-time payments
export const purchases = sqliteTable("purchases", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  stripeSessionId: text("stripe_session_id").notNull().unique(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  tierId: text("tier_id").notNull(), // starter, vault, fortress
  amount: integer("amount").notNull(), // in cents
  currency: text("currency").notNull().default("usd"),
  status: text("status").notNull().default("pending"), // pending, completed, refunded
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => ({
  userIdIdx: index("purchases_user_id_idx").on(table.userId),
  stripeSessionIdx: index("purchases_stripe_session_idx").on(table.stripeSessionId),
  statusIdx: index("purchases_status_idx").on(table.status),
}));

// Share view events for detailed view receipts
export const shareViewEvents = sqliteTable("share_view_events", {
  id: text("id").primaryKey(),
  shareId: text("share_id").notNull(),
  videoId: text("video_id").notNull(),
  ipHash: text("ip_hash"), // Hashed for privacy, still useful for audit
  userAgent: text("user_agent"),
  watchDuration: integer("watch_duration"), // seconds watched (if trackable)
  completed: integer("completed", { mode: "boolean" }).notNull().default(false), // watched to end
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => ({
  shareIdIdx: index("share_view_events_share_id_idx").on(table.shareId),
  videoIdIdx: index("share_view_events_video_id_idx").on(table.videoId),
  createdAtIdx: index("share_view_events_created_at_idx").on(table.createdAt),
}));

export const purchasesRelations = relations(purchases, ({ one }) => ({
  // No explicit relation since users table is managed by Better Auth
}));

export const shareViewEventsRelations = relations(shareViewEvents, ({ one }) => ({
  share: one(videoShares, {
    fields: [shareViewEvents.shareId],
    references: [videoShares.id],
  }),
  video: one(videos, {
    fields: [shareViewEvents.videoId],
    references: [videos.id],
  }),
}));

export const videoSharesRelations = relations(videoShares, ({ one, many }) => ({
  video: one(videos, {
    fields: [videoShares.videoId],
    references: [videos.id],
  }),
  viewEvents: many(shareViewEvents),
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
export type VideoShare = typeof videoShares.$inferSelect;
export type NewVideoShare = typeof videoShares.$inferInsert;
export type ShareViewEvent = typeof shareViewEvents.$inferSelect;
export type NewShareViewEvent = typeof shareViewEvents.$inferInsert;
