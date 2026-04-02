"use client";

import { useState, useCallback } from "react";
import { encryptFile, createEncryptedThumbnail } from "@/lib/encryption";

export function VideoUpload() {
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
      // Encrypt the video file
      setUploadProgress(10);
      const encryptedVideo = await encryptFile(file, password);

      setUploadProgress(30);

      // Create encrypted thumbnail
      const encryptedThumb = await createEncryptedThumbnail(file, password);

      setUploadProgress(50);

      // Prepare form data
      // Note: The encryptedBlob from encryptFile contains: salt(16) + iv(12) + encryptedData
      // We need to strip the salt+iv prefix since we're sending them separately
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

      // Upload to server
      const response = await fetch("/api/videos/upload", {
        method: "POST",
        body: formData,
      });

      setUploadProgress(90);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Upload failed" }));
        throw new Error(errorData.error || `Upload failed: ${response.status}`);
      }

      setUploadProgress(100);

      // Clear password field for security
      setPassword("");

      // Refresh the page to show the new video
      window.location.reload();
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload video. Please try again.");
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
    <div className="brutal-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="h-px w-4 bg-ochre" />
        <h3 className="text-caption text-foreground">Upload Video</h3>
      </div>

      {/* Password Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-foreground mb-2">
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
        <p className="mt-1 text-xs text-muted">
          This password encrypts your video. Never lose it - we cannot recover it!
        </p>
      </div>

      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all
          ${dragActive ? "border-ochre bg-ochre/5" : "border-border hover:border-ochre/50"}
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
          <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-ochre/10 text-ochre">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <p className="text-sm font-medium text-foreground mb-1">
            Drop your video here or click to browse
          </p>
          <p className="text-xs text-muted">
            MP4, WebM, MOV up to 500MB
          </p>
        </label>
      </div>

      {/* Progress */}
      {isUploading && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted">Encrypting & uploading...</span>
            <span className="text-sm font-medium text-foreground">{uploadProgress}%</span>
          </div>
          <div className="h-2 bg-stone rounded-full overflow-hidden">
            <div
              className="h-full bg-ochre transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Security Note */}
      <div className="mt-6 p-4 bg-success/5 border border-success/20 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 text-success">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-success">Client-Side Encrypted</p>
            <p className="text-xs text-muted mt-1">
              Your video is encrypted in your browser before upload. We never see the original file.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
