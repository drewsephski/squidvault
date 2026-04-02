"use client";

import { useState, useCallback } from "react";
import { encryptFile, createEncryptedThumbnail } from "@/lib/encryption";
import Link from "next/link";

interface VideoUploadProps {
  currentVideos: number;
  videoLimit: number;
  remaining: number | null;
  tier: string;
}

export function VideoUpload({ currentVideos, videoLimit, remaining, tier }: VideoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [password, setPassword] = useState("");

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleUpload = useCallback(async (file: File) => {
    if (!password) {
      alert("Please enter an encryption password first");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      setUploadProgress(10);
      const encryptedVideo = await encryptFile(file, password);
      setUploadProgress(30);

      const encryptedThumb = await createEncryptedThumbnail(file, password);
      setUploadProgress(50);

      const combinedBuffer = await encryptedVideo.encryptedBlob.arrayBuffer();
      const saltLength = 16;
      const ivLength = 12;
      const headerOffset = saltLength + ivLength;
      const encryptedDataOnly = combinedBuffer.slice(headerOffset);

      const formData = new FormData();
      formData.append("file", new Blob([encryptedDataOnly], { type: "application/octet-stream" }), file.name + ".enc");
      formData.append("name", file.name);
      formData.append("originalMimeType", file.type);
      formData.append("encryptionSalt", encryptedVideo.salt);
      formData.append("encryptionIv", encryptedVideo.iv);

      if (encryptedThumb) {
        formData.append("thumbnail", encryptedThumb.encryptedBlob, "thumb.jpg.enc");
        formData.append("thumbnailSalt", encryptedThumb.salt);
        formData.append("thumbnailIv", encryptedThumb.iv);
      }

      setUploadProgress(70);

      const response = await fetch("/api/videos/upload", {
        method: "POST",
        body: formData,
      });

      setUploadProgress(90);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Upload failed" }));
        if (response.status === 403 && errorData.limit) {
          throw new Error(`Video limit reached: ${errorData.current}/${errorData.limit}. Please upgrade your plan.`);
        }
        throw new Error(errorData.error || `Upload failed: ${response.status}`);
      }

      setUploadProgress(100);
      setPassword("");
      window.location.reload();
    } catch (error) {
      console.error("Upload error:", error);
      const message = error instanceof Error ? error.message : "Failed to upload video";
      alert(message);
    } finally {
      setIsUploading(false);
    }
  }, [password]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files?.[0]) {
      handleUpload(files[0]);
    }
  }, [handleUpload]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  return (
    <div className="border border-border bg-background p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="h-px w-3 bg-ochre" />
        <h3 className="text-micro text-foreground">Upload Video</h3>
      </div>

      {/* Password Input */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-foreground mb-1.5">
          Encryption Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter a strong password"
          className="w-full"
          disabled={isUploading}
        />
        <p className="mt-1 text-micro text-muted">
          Never lose it — we cannot recover it.
        </p>
      </div>

      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          relative border border-dashed p-6 text-center transition-all
          ${dragActive ? "border-ochre bg-ochre/5" : "border-border hover:border-ochre/40"}
          ${isUploading ? "opacity-50 pointer-events-none" : ""}
        `}
      >
        <input
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          className="hidden"
          id="video-upload"
          disabled={isUploading}
        />
        <label htmlFor="video-upload" className="cursor-pointer block">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center border border-ochre/20 bg-ochre/8 text-ochre">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>
          <p className="text-xs font-medium text-foreground mb-0.5">
            Drop video or click to browse
          </p>
          <p className="text-micro text-muted">
            MP4, WebM, MOV up to 500MB
          </p>
        </label>
      </div>

      {/* Progress */}
      {isUploading && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-muted">Encrypting & uploading...</span>
            <span className="text-xs font-semibold text-foreground">{uploadProgress}%</span>
          </div>
          <div className="h-1 bg-stone overflow-hidden">
            <div
              className="h-full bg-ochre transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Plan Limit Indicator */}
      {remaining !== null && (
        <div className={`mt-4 p-3 border ${remaining === 0 ? 'border-error/30 bg-error/5' : 'border-ochre/20 bg-ochre/5'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">Plan Usage</span>
            <span className={`text-xs font-medium ${remaining === 0 ? 'text-error' : 'text-ochre'}`}>
              {currentVideos} / {videoLimit} videos
            </span>
          </div>
          {remaining === 0 ? (
            <div className="mt-2">
              <p className="text-xs text-error mb-2">Video limit reached. Upgrade to upload more.</p>
              <Link 
                href="/#pricing" 
                className="text-xs font-semibold text-ochre hover:text-ochre-dark underline"
              >
                Upgrade Plan →
              </Link>
            </div>
          ) : remaining !== null && remaining <= 2 && (
            <p className="text-xs text-warm-gray mt-1">{remaining} {remaining === 1 ? 'video' : 'videos'} remaining</p>
          )}
        </div>
      )}

      {/* Security Note */}
      <div className="mt-4 flex items-start gap-2.5 p-3 border border-success/15 bg-success/5">
        <div className="mt-0.5 text-success flex-shrink-0">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        </div>
        <div>
          <p className="text-xs font-medium text-success">Client-Side Encrypted</p>
          <p className="text-micro text-muted mt-0.5">
            Encrypted in your browser before upload.
          </p>
        </div>
      </div>
    </div>
  );
}
