import { auth } from "@/lib/auth";
import { createVideo } from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import crypto from "crypto";

// Config to allow large file uploads
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Upload directory for encrypted videos
const UPLOAD_DIR = join(process.cwd(), "uploads", "videos");

// Ensure upload directory exists
async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureUploadDir();

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

    // Generate unique storage path
    const videoId = crypto.randomUUID();
    const storagePath = join(UPLOAD_DIR, `${videoId}.enc`);

    // Write encrypted file to disk
    const fileBuffer = await file.arrayBuffer();
    await writeFile(storagePath, new Uint8Array(fileBuffer));

    // Save thumbnail if provided
    let thumbnailPath: string | undefined;
    const thumbnailFile = formData.get("thumbnail") as File;
    if (thumbnailFile && thumbnailSalt && thumbnailIv) {
      const thumbnailId = crypto.randomUUID();
      thumbnailPath = join(UPLOAD_DIR, `thumb_${thumbnailId}.enc`);
      const thumbBuffer = await thumbnailFile.arrayBuffer();
      await writeFile(thumbnailPath, new Uint8Array(thumbBuffer));
    }

    // Create database record
    const video = await createVideo({
      userId: session.user.id,
      name: name || file.name,
      description: description || undefined,
      storagePath,
      originalSize: file.size,
      mimeType: file.type,
      encryptionSalt,
      encryptionIv,
      thumbnailPath,
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
