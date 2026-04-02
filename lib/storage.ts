import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// R2/S3-compatible storage client
const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT!, // e.g., https://<account>.r2.cloudflarestorage.com
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME!;

/**
 * Upload a video file to object storage
 * @param key - Storage key (e.g., "userId/videoId.enc")
 * @param body - File buffer
 * @param contentType - MIME type
 */
export async function uploadVideo(key: string, body: Buffer, contentType: string = "application/octet-stream") {
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
  }));
}

/**
 * Get a signed URL for video access (for private videos)
 * @param key - Storage key
 * @param expiresIn - URL expiration time in seconds (default: 1 hour)
 */
export async function getVideoSignedUrl(key: string, expiresIn: number = 3600) {
  return getSignedUrl(s3, new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  }), { expiresIn });
}

/**
 * Delete a video from object storage
 * @param key - Storage key
 */
export async function deleteVideo(key: string) {
  await s3.send(new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  }));
}

/**
 * Generate storage key for a video
 * @param userId - User ID
 * @param videoId - Video ID
 * @param fileName - Original file name
 */
export function generateStorageKey(userId: string, videoId: string, fileName: string): string {
  return `${userId}/${videoId}/${fileName}`;
}
