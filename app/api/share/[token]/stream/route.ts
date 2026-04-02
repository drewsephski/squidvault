import { getShareWithVideo, incrementShareView } from "@/lib/data";
import { getVideoSignedUrl } from "@/lib/storage";
import { NextRequest, NextResponse } from "next/server";

// Get streaming URL for shared video
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Get share with video data
    const result = await getShareWithVideo(token);
    if (!result) {
      return NextResponse.json({ error: "Share not found" }, { status: 404 });
    }

    const { share, video } = result;

    // Check if share is revoked
    if (share.isRevoked) {
      return NextResponse.json(
        { error: "Share has been revoked", code: "REVOKED" },
        { status: 410 }
      );
    }

    // Check expiry
    if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: "Share has expired", code: "EXPIRED" },
        { status: 410 }
      );
    }

    // Atomically increment view count and check max views
    const canView = await incrementShareView(token, share.maxViews);
    if (!canView) {
      return NextResponse.json(
        { error: "View limit reached", code: "MAX_VIEWS" },
        { status: 410 }
      );
    }

    // Generate signed URL for video access (15 minute expiry)
    const signedUrl = await getVideoSignedUrl(video.storagePath, 15 * 60);

    return NextResponse.json({
      url: signedUrl,
      video: {
        id: video.id,
        name: video.name,
        originalSize: video.originalSize,
        mimeType: video.mimeType,
        encryptionSalt: video.encryptionSalt,
        encryptionIv: video.encryptionIv,
      },
    });
  } catch (error) {
    console.error("Share stream error:", error);
    return NextResponse.json(
      { error: "Failed to get video stream" },
      { status: 500 }
    );
  }
}
