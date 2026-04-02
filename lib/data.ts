import { db } from "./db";
import { projects, deployments, activityLogs, apiMetrics, videos, videoAccessLogs, videoShares, purchases, shareViewEvents, type NewProject, type NewDeployment, type NewActivityLog, type NewVideo, type NewVideoAccessLog, type NewVideoShare, type NewPurchase, type NewShareViewEvent } from "./schema";
import { eq, and, desc, sql, gte, lt } from "drizzle-orm";
import { generateId } from "./utils";

// Stats

export async function getUserStats(userId: string) {
  const [projectCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(projects)
    .where(eq(projects.userId, userId));

  const [activeDeployments] = await db
    .select({ count: sql<number>`count(*)` })
    .from(deployments)
    .where(and(eq(deployments.userId, userId), eq(deployments.status, "success")));

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [apiStats] = await db
    .select({
      totalRequests: sql<number>`COALESCE(SUM(request_count), 0)`,
      avgResponseTime: sql<number>`COALESCE(AVG(avg_response_time), 0)`,
    })
    .from(apiMetrics)
    .where(and(eq(apiMetrics.userId, userId), gte(apiMetrics.date, thirtyDaysAgo)));

  // Get previous period for comparison
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const [prevApiStats] = await db
    .select({
      totalRequests: sql<number>`COALESCE(SUM(request_count), 0)`,
    })
    .from(apiMetrics)
    .where(and(eq(apiMetrics.userId, userId), gte(apiMetrics.date, sixtyDaysAgo)));

  const requestChange = prevApiStats.totalRequests > 0
    ? ((apiStats.totalRequests - prevApiStats.totalRequests) / prevApiStats.totalRequests * 100).toFixed(0)
    : "0";

  return {
    totalProjects: projectCount?.count ?? 0,
    activeDeployments: activeDeployments?.count ?? 0,
    totalRequests: apiStats?.totalRequests ?? 0,
    avgResponseTime: Math.round(apiStats?.avgResponseTime ?? 0),
    requestChange: parseInt(requestChange),
  };
}

// Projects

export async function getUserProjects(userId: string, limit = 5) {
  return db
    .select()
    .from(projects)
    .where(eq(projects.userId, userId))
    .orderBy(desc(projects.createdAt))
    .limit(limit);
}

export async function createProject(data: Omit<NewProject, "id" | "createdAt" | "updatedAt">) {
  const id = generateId();
  const now = new Date();

  const [project] = await db
    .insert(projects)
    .values({
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  // Log activity
  await createActivityLog({
    userId: data.userId,
    action: "Created",
    target: data.name,
    targetType: "project",
    status: "success",
  });

  return project;
}

// Activity Logs

export async function getUserActivity(userId: string, limit = 10) {
  return db
    .select()
    .from(activityLogs)
    .where(eq(activityLogs.userId, userId))
    .orderBy(desc(activityLogs.createdAt))
    .limit(limit);
}

export async function createActivityLog(data: Omit<NewActivityLog, "id" | "createdAt">) {
  const id = generateId();
  const now = new Date();

  const [log] = await db
    .insert(activityLogs)
    .values({
      ...data,
      id,
      createdAt: now,
    })
    .returning();

  return log;
}

// Plan limits configuration
export const PLAN_LIMITS = {
  starter: { videoLimit: 3, name: "Starter" },
  professional: { videoLimit: Infinity, name: "Professional" },
  practice: { videoLimit: Infinity, name: "Practice" },
} as const;

export type PlanTier = "starter" | "professional" | "practice";

export async function getUserVideoCount(userId: string): Promise<number> {
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(videos)
    .where(eq(videos.userId, userId));

  return result?.count ?? 0;
}

export async function canUserUploadVideo(userId: string): Promise<{ allowed: boolean; current: number; limit: number; tier: PlanTier }> {
  const tier = await getUserActivePlan(userId);
  const videoCount = await getUserVideoCount(userId);
  const limit = PLAN_LIMITS[tier].videoLimit;

  return {
    allowed: limit === Infinity || videoCount < limit,
    current: videoCount,
    limit,
    tier,
  };
}

export async function getUserPlanLimits(userId: string): Promise<{ tier: PlanTier; videoLimit: number; currentVideos: number; remaining: number | null }> {
  const tier = await getUserActivePlan(userId);
  const videoCount = await getUserVideoCount(userId);
  const limit = PLAN_LIMITS[tier].videoLimit;

  return {
    tier,
    videoLimit: limit,
    currentVideos: videoCount,
    remaining: limit === Infinity ? null : Math.max(0, limit - videoCount),
  };
}

export async function createDeployment(data: Omit<NewDeployment, "id" | "createdAt">) {
  const id = generateId();
  const now = new Date();

  const [deployment] = await db
    .insert(deployments)
    .values({
      ...data,
      id,
      createdAt: now,
    })
    .returning();

  // Log activity
  const project = await db
    .select({ name: projects.name })
    .from(projects)
    .where(eq(projects.id, data.projectId))
    .limit(1);

  await createActivityLog({
    userId: data.userId,
    action: "Deployed",
    target: project[0]?.name ?? data.projectId,
    targetType: "deployment",
    status: data.status,
  });

  return deployment;
}

// API Metrics

export async function recordApiMetrics(userId: string, requestCount: number, responseTime: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const id = generateId();

  const [metric] = await db
    .insert(apiMetrics)
    .values({
      id,
      userId,
      requestCount,
      avgResponseTime: responseTime,
      date: today,
    })
    .returning();

  return metric;
}

// Videos - Private Video Vault

export async function getUserVideos(userId: string) {
  return db
    .select()
    .from(videos)
    .where(eq(videos.userId, userId))
    .orderBy(desc(videos.createdAt));
}

export async function getVideoById(videoId: string, userId: string) {
  const [video] = await db
    .select()
    .from(videos)
    .where(and(eq(videos.id, videoId), eq(videos.userId, userId)))
    .limit(1);
  return video;
}

export async function createVideo(data: Omit<NewVideo, "id" | "createdAt" | "updatedAt" | "viewCount">) {
  const id = generateId();
  const now = new Date();

  const [video] = await db
    .insert(videos)
    .values({
      ...data,
      id,
      viewCount: 0,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  // Log activity
  await createActivityLog({
    userId: data.userId,
    action: "Uploaded",
    target: data.name,
    targetType: "video",
    status: "success",
  });

  return video;
}

export async function incrementVideoView(videoId: string) {
  await db
    .update(videos)
    .set({ viewCount: sql`${videos.viewCount} + 1` })
    .where(eq(videos.id, videoId));
}

export async function deleteVideo(videoId: string, userId: string) {
  const [deleted] = await db
    .delete(videos)
    .where(and(eq(videos.id, videoId), eq(videos.userId, userId)))
    .returning();

  if (deleted) {
    await createActivityLog({
      userId,
      action: "Deleted",
      target: deleted.name,
      targetType: "video",
      status: "success",
    });
  }

  return deleted;
}

export async function updateVideoName(videoId: string, userId: string, name: string) {
  const [updated] = await db
    .update(videos)
    .set({ name, updatedAt: new Date() })
    .where(and(eq(videos.id, videoId), eq(videos.userId, userId)))
    .returning();

  if (updated) {
    await createActivityLog({
      userId,
      action: "Renamed",
      target: name,
      targetType: "video",
      status: "success",
    });
  }

  return updated;
}

export async function logVideoAccess(data: Omit<NewVideoAccessLog, "id" | "createdAt">) {
  const id = generateId();
  const now = new Date();

  await db.insert(videoAccessLogs).values({
    ...data,
    id,
    createdAt: now,
  });
}

export async function getVideoAccessLogs(videoId: string, userId: string, limit = 50) {
  // First verify ownership
  const video = await getVideoById(videoId, userId);
  if (!video) return [];

  return db
    .select()
    .from(videoAccessLogs)
    .where(eq(videoAccessLogs.videoId, videoId))
    .orderBy(desc(videoAccessLogs.createdAt))
    .limit(limit);
}

// Video Shares

export async function createVideoShare(data: Omit<NewVideoShare, "createdAt" | "viewCount" | "isRevoked">) {
  const now = new Date();

  const [share] = await db
    .insert(videoShares)
    .values({
      ...data,
      viewCount: 0,
      isRevoked: false,
      createdAt: now,
    })
    .returning();

  return share;
}

export async function getVideoShares(videoId: string, userId: string) {
  // Verify ownership
  const video = await getVideoById(videoId, userId);
  if (!video) return [];

  return db
    .select()
    .from(videoShares)
    .where(eq(videoShares.videoId, videoId))
    .orderBy(desc(videoShares.createdAt));
}

export async function getShareByToken(token: string) {
  const [share] = await db
    .select({
      id: videoShares.id,
      videoId: videoShares.videoId,
      createdBy: videoShares.createdBy,
      wrappedKey: videoShares.wrappedKey,
      salt: videoShares.salt,
      expiresAt: videoShares.expiresAt,
      maxViews: videoShares.maxViews,
      viewCount: videoShares.viewCount,
      isRevoked: videoShares.isRevoked,
      createdAt: videoShares.createdAt,
      lastAccessedAt: videoShares.lastAccessedAt,
    })
    .from(videoShares)
    .where(eq(videoShares.id, token))
    .limit(1);

  return share || null;
}

export async function getShareWithVideo(token: string) {
  const result = await db
    .select({
      share: {
        id: videoShares.id,
        videoId: videoShares.videoId,
        createdBy: videoShares.createdBy,
        wrappedKey: videoShares.wrappedKey,
        salt: videoShares.salt,
        expiresAt: videoShares.expiresAt,
        maxViews: videoShares.maxViews,
        viewCount: videoShares.viewCount,
        isRevoked: videoShares.isRevoked,
        createdAt: videoShares.createdAt,
        lastAccessedAt: videoShares.lastAccessedAt,
      },
      video: {
        id: videos.id,
        name: videos.name,
        description: videos.description,
        storagePath: videos.storagePath,
        originalSize: videos.originalSize,
        mimeType: videos.mimeType,
        encryptionSalt: videos.encryptionSalt,
        encryptionIv: videos.encryptionIv,
        thumbnailPath: videos.thumbnailPath,
      },
    })
    .from(videoShares)
    .innerJoin(videos, eq(videoShares.videoId, videos.id))
    .where(eq(videoShares.id, token))
    .limit(1);

  return result[0] || null;
}

export async function incrementShareView(token: string, maxViews: number | null): Promise<boolean> {
  // Atomic increment with max views check
  if (maxViews !== null) {
    const result = await db
      .update(videoShares)
      .set({
        viewCount: sql`${videoShares.viewCount} + 1`,
        lastAccessedAt: new Date(),
      })
      .where(
        and(
          eq(videoShares.id, token),
          lt(videoShares.viewCount, maxViews),
          eq(videoShares.isRevoked, false),
          sql`${videoShares.expiresAt} IS NULL OR ${videoShares.expiresAt} > datetime('now')`
        )
      )
      .returning({ viewCount: videoShares.viewCount });

    return result.length > 0;
  } else {
    // No max views limit, just increment
    await db
      .update(videoShares)
      .set({
        viewCount: sql`${videoShares.viewCount} + 1`,
        lastAccessedAt: new Date(),
      })
      .where(eq(videoShares.id, token));

    return true;
  }
}

export async function revokeVideoShare(token: string, userId: string) {
  const [updated] = await db
    .update(videoShares)
    .set({ isRevoked: true })
    .where(and(eq(videoShares.id, token), eq(videoShares.createdBy, userId)))
    .returning();

  return updated || null;
}

export async function deleteVideoShare(token: string, userId: string) {
  const [deleted] = await db
    .delete(videoShares)
    .where(and(eq(videoShares.id, token), eq(videoShares.createdBy, userId)))
    .returning();

  return deleted || null;
}

// Purchases

export async function createPurchase(data: Omit<NewPurchase, "id" | "createdAt" | "updatedAt">) {
  const id = generateId();
  const now = new Date();

  const [purchase] = await db
    .insert(purchases)
    .values({
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return purchase;
}

export async function getPurchaseByStripeSession(stripeSessionId: string) {
  const [purchase] = await db
    .select()
    .from(purchases)
    .where(eq(purchases.stripeSessionId, stripeSessionId))
    .limit(1);

  return purchase || null;
}

export async function updatePurchaseStatus(
  id: string,
  status: "pending" | "completed" | "refunded",
  stripePaymentIntentId?: string
) {
  const updateData: { status: string; updatedAt: Date; stripePaymentIntentId?: string } = {
    status,
    updatedAt: new Date(),
  };

  if (stripePaymentIntentId) {
    updateData.stripePaymentIntentId = stripePaymentIntentId;
  }

  const [updated] = await db
    .update(purchases)
    .set(updateData)
    .where(eq(purchases.id, id))
    .returning();

  return updated || null;
}

export async function getUserPurchases(userId: string) {
  return db
    .select()
    .from(purchases)
    .where(eq(purchases.userId, userId))
    .orderBy(desc(purchases.createdAt));
}

export async function getUserActivePlan(userId: string): Promise<"starter" | "professional" | "practice"> {
  const [latestPurchase] = await db
    .select({ tierId: purchases.tierId })
    .from(purchases)
    .where(and(eq(purchases.userId, userId), eq(purchases.status, "completed")))
    .orderBy(desc(purchases.createdAt))
    .limit(1);

  if (!latestPurchase) return "starter";

  const tier = latestPurchase.tierId;
  if (tier === "practice") return "practice";
  if (tier === "professional") return "professional";
  if (tier === "fortress") return "practice"; // Legacy: map old Fortress to Practice
  if (tier === "vault") return "professional"; // Legacy: map old Vault to Professional
  return "starter";
}

// Share View Events - for detailed view receipts

export async function recordShareView(data: Omit<NewShareViewEvent, "id" | "createdAt">) {
  const id = generateId();
  const now = new Date();

  const [event] = await db.insert(shareViewEvents).values({
    ...data,
    id,
    createdAt: now,
  }).returning();

  return event;
}

export async function getShareViewEvents(shareId: string, userId: string, limit = 50) {
  // First verify the share belongs to a video owned by this user
  const share = await db
    .select({ videoId: videoShares.videoId })
    .from(videoShares)
    .where(eq(videoShares.id, shareId))
    .limit(1);

  if (!share[0]) return [];

  // Verify video ownership
  const video = await getVideoById(share[0].videoId, userId);
  if (!video) return [];

  return db
    .select()
    .from(shareViewEvents)
    .where(eq(shareViewEvents.shareId, shareId))
    .orderBy(desc(shareViewEvents.createdAt))
    .limit(limit);
}

export async function getVideoShareViewSummary(videoId: string, userId: string) {
  // Verify ownership
  const video = await getVideoById(videoId, userId);
  if (!video) return null;

  // Get all shares for this video with their view counts
  const shares = await db
    .select({
      shareId: videoShares.id,
      shareCreatedAt: videoShares.createdAt,
      maxViews: videoShares.maxViews,
      isRevoked: videoShares.isRevoked,
      viewCount: sql<number>`count(${shareViewEvents.id})`,
      lastViewedAt: sql<number | null>`max(${shareViewEvents.createdAt})`,
    })
    .from(videoShares)
    .leftJoin(shareViewEvents, eq(videoShares.id, shareViewEvents.shareId))
    .where(eq(videoShares.videoId, videoId))
    .groupBy(videoShares.id)
    .orderBy(desc(videoShares.createdAt));

  return shares;
}
