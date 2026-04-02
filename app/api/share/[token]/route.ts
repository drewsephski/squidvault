import { getShareWithVideo, incrementShareView } from "@/lib/data";
import { getVideoSignedUrl } from "@/lib/storage";
import { NextRequest, NextResponse } from "next/server";

// Validate share and return video metadata
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    console.log("[DEBUG] Looking up share with token:", token, "length:", token.length);

    // Get share with video data
    const result = await getShareWithVideo(token);
    console.log("[DEBUG] getShareWithVideo result:", result ? "found" : "not found");
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

    // Check max views
    if (share.maxViews !== null && share.viewCount >= share.maxViews) {
      return NextResponse.json(
        { error: "View limit reached", code: "MAX_VIEWS" },
        { status: 410 }
      );
    }

    // Return share data (recipient will use password to unwrap key client-side)
    return NextResponse.json({
      valid: true,
      share: {
        id: share.id,
        wrappedKey: share.wrappedKey,
        salt: share.salt,
        expiresAt: share.expiresAt,
        maxViews: share.maxViews,
        viewCount: share.viewCount,
      },
      video: {
        id: video.id,
        name: video.name,
        description: video.description,
        originalSize: video.originalSize,
        mimeType: video.mimeType,
        encryptionSalt: video.encryptionSalt,
        encryptionIv: video.encryptionIv,
        thumbnailPath: video.thumbnailPath,
      },
    });
  } catch (error) {
    console.error("Validate share error:", error);
    return NextResponse.json(
      { error: "Failed to validate share" },
      { status: 500 }
    );
  }
}

// Revoke a share (only creator can do this)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { auth } = await import("@/lib/auth");
    const { revokeVideoShare } = await import("@/lib/data");

    // Check authentication
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { token } = await params;

    // Revoke share (ownership checked in data function)
    const revoked = await revokeVideoShare(token, session.user.id);
    if (!revoked) {
      return NextResponse.json(
        { error: "Share not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, revoked: true });
  } catch (error) {
    console.error("Revoke share error:", error);
    return NextResponse.json(
      { error: "Failed to revoke share" },
      { status: 500 }
    );
  }
}
