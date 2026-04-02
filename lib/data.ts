import { db } from "./db";
import { projects, deployments, activityLogs, apiMetrics, videos, videoAccessLogs, type NewProject, type NewDeployment, type NewActivityLog, type NewVideo, type NewVideoAccessLog } from "./schema";
import { eq, and, desc, sql, gte } from "drizzle-orm";
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

// Deployments

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
