import { auth } from "@/lib/auth";
import { getVideoById, createVideoShare } from "@/lib/data";
import { generateShareToken } from "@/lib/encryption";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIP, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";

// Create a share for a video
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Apply rate limiting
    const clientIP = getClientIP(request.headers);
    const rateLimit = checkRateLimit(`share:${clientIP}`, RATE_LIMITS.api);
    if (!rateLimit.success) {
      return rateLimitResponse(rateLimit);
    }

    // Check authentication
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: videoId } = await params;

    // Verify video ownership
    const video = await getVideoById(videoId, session.user.id);
    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    // Parse request body
    const body = await request.json();
    const { wrappedKey, salt, expiresIn, maxViews } = body;

    // Validate required fields
    if (!wrappedKey || typeof wrappedKey !== "string") {
      return NextResponse.json({ error: "Missing wrappedKey" }, { status: 400 });
    }
    if (!salt || typeof salt !== "string") {
      return NextResponse.json({ error: "Missing salt" }, { status: 400 });
    }

    // Parse expiry
    let expiresAt: Date | null = null;
    if (expiresIn) {
      const now = new Date();
      switch (expiresIn) {
        case "1h":
          expiresAt = new Date(now.getTime() + 60 * 60 * 1000);
          break;
        case "24h":
          expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
          break;
        case "7d":
          expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
        case "30d":
          expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          return NextResponse.json({ error: "Invalid expiresIn" }, { status: 400 });
      }
    }

    // Validate maxViews
    const validatedMaxViews = maxViews && typeof maxViews === "number" && maxViews > 0
      ? Math.min(maxViews, 1000) // Cap at 1000
      : null;

    // Generate secure token
    const token = generateShareToken();
    console.log("[DEBUG] Creating share with token:", token, "length:", token.length);

    // Create share
    const share = await createVideoShare({
      id: token,
      videoId,
      createdBy: session.user.id,
      wrappedKey,
      salt,
      expiresAt,
      maxViews: validatedMaxViews,
    });
    console.log("[DEBUG] Share created:", share.id);

    // Build share URL
    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const shareUrl = `${origin}/share/${token}`;

    return NextResponse.json({
      success: true,
      share: {
        id: share.id,
        shareUrl,
        expiresAt: share.expiresAt,
        maxViews: share.maxViews,
        createdAt: share.createdAt,
      },
    });
  } catch (error) {
    console.error("Create share error:", error);
    return NextResponse.json(
      { error: "Failed to create share" },
      { status: 500 }
    );
  }
}

// List shares for a video
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Apply rate limiting
    const clientIP = getClientIP(request.headers);
    const rateLimit = checkRateLimit(`share:${clientIP}`, RATE_LIMITS.api);
    if (!rateLimit.success) {
      return rateLimitResponse(rateLimit);
    }

    // Check authentication
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: videoId } = await params;

    // Get shares (ownership verified in data function)
    const { getVideoShares } = await import("@/lib/data");
    const shares = await getVideoShares(videoId, session.user.id);

    // Filter out sensitive data
    const safeShares = shares.map(share => ({
      id: share.id,
      expiresAt: share.expiresAt,
      maxViews: share.maxViews,
      viewCount: share.viewCount,
      isRevoked: share.isRevoked,
      createdAt: share.createdAt,
      lastAccessedAt: share.lastAccessedAt,
      shareUrl: `${request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/share/${share.id}`,
    }));

    return NextResponse.json({ shares: safeShares });
  } catch (error) {
    console.error("List shares error:", error);
    return NextResponse.json(
      { error: "Failed to list shares" },
      { status: 500 }
    );
  }
}
