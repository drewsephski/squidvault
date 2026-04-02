import { auth } from "@/lib/auth";
import { getVideoById, incrementVideoView, logVideoAccess } from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { existsSync } from "fs";

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

    // Check if file exists
    if (!existsSync(video.storagePath)) {
      return NextResponse.json({ error: "Video file not found" }, { status: 404 });
    }

    // Read the encrypted file
    const fileBuffer = await readFile(video.storagePath);

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

    // Return the encrypted video with metadata headers
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${video.name}.enc"`,
        "X-Video-Id": video.id,
        "X-Video-Name": encodeURIComponent(video.name),
        "X-Encryption-Salt": video.encryptionSalt,
        "X-Encryption-Iv": video.encryptionIv,
        "X-Original-Size": video.originalSize.toString(),
        "X-Mime-Type": video.mimeType,
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
