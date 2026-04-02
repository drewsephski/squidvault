import { auth } from "@/lib/auth";
import { deleteVideo } from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import { existsSync } from "fs";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get video info before deleting (to remove file)
    const { db } = await import("@/lib/db");
    const { videos } = await import("@/lib/schema");
    const { eq, and } = await import("drizzle-orm");

    const [video] = await db
      .select()
      .from(videos)
      .where(and(eq(videos.id, id), eq(videos.userId, session.user.id)))
      .limit(1);

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    // Delete the physical file
    if (existsSync(video.storagePath)) {
      await unlink(video.storagePath);
    }

    // Delete thumbnail if exists
    if (video.thumbnailPath && existsSync(video.thumbnailPath)) {
      await unlink(video.thumbnailPath);
    }

    // Delete from database
    await deleteVideo(id, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Video delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete video" },
      { status: 500 }
    );
  }
}
