import { getVideoShares, getShareViewEvents } from "@/lib/data";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

// Get shares and view events for a video
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: videoId } = await params;
    const userId = session.user.id;

    // Get all shares for this video
    const shares = await getVideoShares(videoId, userId);

    // Get view events for each share
    const sharesWithEvents = await Promise.all(
      shares.map(async (share) => {
        const events = await getShareViewEvents(share.id, userId, 100);
        return {
          ...share,
          viewEvents: events.map(e => ({
            id: e.id,
            createdAt: e.createdAt,
            watchDuration: e.watchDuration,
            completed: e.completed,
            ipHash: e.ipHash,
          })),
        };
      })
    );

    return NextResponse.json({ shares: sharesWithEvents });
  } catch (error) {
    console.error("Get video shares error:", error);
    return NextResponse.json(
      { error: "Failed to get video shares" },
      { status: 500 }
    );
  }
}
