import { auth } from "@/lib/auth";
import { createVideo } from "@/lib/data";
import { uploadVideo, generateStorageKey } from "@/lib/storage";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Config to allow large file uploads
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const encryptionSalt = formData.get("encryptionSalt") as string;
    const encryptionIv = formData.get("encryptionIv") as string;
    const thumbnailSalt = formData.get("thumbnailSalt") as string;
    const thumbnailIv = formData.get("thumbnailIv") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type using original mime type before encryption
    const originalMimeType = (formData.get("originalMimeType") as string) || file.type;
    console.log("Received MIME type:", originalMimeType, "File type:", file.type);
    const allowedTypes = ["video/mp4", "video/webm", "video/quicktime", "video/ogg"];
    if (!allowedTypes.includes(originalMimeType)) {
      return NextResponse.json(
        { error: `Invalid file type: ${originalMimeType}. Only video files are allowed.` },
        { status: 400 }
      );
    }

    // Max file size: 500MB
    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 500MB." },
        { status: 400 }
      );
    }

    // Generate unique video ID and storage keys
    const videoId = crypto.randomUUID();
    const fileName = `${videoId}.enc`;
    const storageKey = generateStorageKey(session.user.id, videoId, fileName);

    // Upload encrypted file to object storage
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await uploadVideo(storageKey, fileBuffer, "application/octet-stream");

    // Upload thumbnail if provided
    let thumbnailKey: string | undefined;
    const thumbnailFile = formData.get("thumbnail") as File;
    if (thumbnailFile && thumbnailSalt && thumbnailIv) {
      const thumbnailId = crypto.randomUUID();
      const thumbFileName = `thumb_${thumbnailId}.enc`;
      thumbnailKey = generateStorageKey(session.user.id, videoId, thumbFileName);
      const thumbBuffer = Buffer.from(await thumbnailFile.arrayBuffer());
      await uploadVideo(thumbnailKey, thumbBuffer, "application/octet-stream");
    }

    // Create database record with storage keys
    const video = await createVideo({
      userId: session.user.id,
      name: name || file.name,
      description: description || undefined,
      storagePath: storageKey,
      originalSize: file.size,
      mimeType: file.type,
      encryptionSalt,
      encryptionIv,
      thumbnailPath: thumbnailKey,
    });

    return NextResponse.json({
      success: true,
      video: {
        id: video.id,
        name: video.name,
        description: video.description,
        size: video.originalSize,
        createdAt: video.createdAt,
      },
    });
  } catch (error) {
    console.error("Video upload error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to upload video";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
