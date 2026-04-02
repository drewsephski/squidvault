import { auth } from "@/lib/auth";
import { getVideoById, incrementVideoView, logVideoAccess, updateVideoName, deleteVideo as deleteVideoDb } from "@/lib/data";
import { getVideoSignedUrl, deleteVideo } from "@/lib/storage";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
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

    // Get video from database
    const video = await getVideoById(id, session.user.id);
    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    // Generate signed URL for video access
    const signedUrl = await getVideoSignedUrl(video.storagePath, 3600); // 1 hour expiration

    // Log access
    await logVideoAccess({
      videoId: video.id,
      userId: session.user.id,
      action: "download",
      ipAddress: request.headers.get("x-forwarded-for") || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
    });

    // Increment view count
    await incrementVideoView(video.id);

    // Return signed URL and metadata headers
    return NextResponse.json({
      url: signedUrl,
      video: {
        id: video.id,
        name: video.name,
        encryptionSalt: video.encryptionSalt,
        encryptionIv: video.encryptionIv,
        originalSize: video.originalSize,
        mimeType: video.mimeType,
      },
    });
  } catch (error) {
    console.error("Video download error:", error);
    return NextResponse.json(
      { error: "Failed to download video" },
      { status: 500 }
    );
  }
}

export async function PATCH(
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
    const { name } = await request.json();

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }

    const trimmedName = name.trim();
    if (trimmedName.length > 255) {
      return NextResponse.json({ error: "Name too long" }, { status: 400 });
    }

    const updated = await updateVideoName(id, session.user.id, trimmedName);
    if (!updated) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, video: updated });
  } catch (error) {
    console.error("Video update error:", error);
    return NextResponse.json(
      { error: "Failed to update video" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Get video to find storage path
    const video = await getVideoById(id, session.user.id);
    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    // Delete from object storage
    try {
      await deleteVideo(video.storagePath);
      if (video.thumbnailPath) {
        await deleteVideo(video.thumbnailPath);
      }
    } catch (storageError) {
      console.error("Storage delete error (continuing with DB delete):", storageError);
    }

    // Delete from database
    const deleted = await deleteVideoDb(id, session.user.id);
    if (!deleted) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Video delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete video" },
      { status: 500 }
    );
  }
}
