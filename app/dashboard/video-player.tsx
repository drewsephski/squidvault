"use client";

import { useState, useRef, useEffect } from "react";
import { Video } from "@/lib/schema";
import { decryptFile } from "@/lib/encryption";

interface VideoPlayerProps {
  video: Video;
  onClose: () => void;
}

export function VideoPlayer({ video, onClose }: VideoPlayerProps) {
  const [password, setPassword] = useState("");
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptProgress, setDecryptProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Clean up object URL on unmount
  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  const handleDecrypt = async () => {
    if (!password) {
      setError("Please enter the decryption password");
      return;
    }

    setIsDecrypting(true);
    setDecryptProgress(0);
    setError(null);

    try {
      // Download encrypted video
      setDecryptProgress(20);
      const response = await fetch(`/api/videos/${video.id}`);

      if (!response.ok) {
        throw new Error("Failed to download video");
      }

      setDecryptProgress(50);

      // Get encrypted blob
      const encryptedBlob = await response.blob();

      setDecryptProgress(70);

      // Decrypt the video
      const decryptedData = await decryptFile(
        encryptedBlob,
        password,
        video.encryptionSalt,
        video.encryptionIv
      );

      setDecryptProgress(90);

      // Create blob URL for playback
      const decryptedBlob = new Blob([decryptedData], { type: video.mimeType });
      const url = URL.createObjectURL(decryptedBlob);

      setVideoUrl(url);
      setDecryptProgress(100);
    } catch (err) {
      console.error("Decryption error:", err);
      setError("Failed to decrypt video. Wrong password?");
    } finally {
      setIsDecrypting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-4xl brutal-card overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-stone/30">
          <div className="flex items-center gap-3">
            <span className="text-caption text-ochre">SECURE PLAYER</span>
            <span className="text-sm text-muted truncate max-w-xs">{video.name}</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-stone transition-colors"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!videoUrl ? (
            <div className="text-center py-12">
              <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-ochre/10 text-ochre">
                <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>

              <h3 className="text-subhead text-foreground mb-2">Enter Decryption Password</h3>
              <p className="text-body text-muted mb-6 max-w-md mx-auto">
                This video is encrypted. Enter the password you used when uploading to decrypt and watch.
              </p>

              <div className="max-w-sm mx-auto space-y-4">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter decryption password"
                  className="w-full text-center"
                  disabled={isDecrypting}
                  onKeyDown={(e) => e.key === "Enter" && handleDecrypt()}
                />

                {error && (
                  <div className="p-3 bg-error/10 border border-error/30 rounded-lg text-sm text-error">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleDecrypt}
                  disabled={isDecrypting}
                  className="w-full inline-flex h-11 items-center justify-center rounded-lg bg-ochre px-6 text-sm font-medium text-white transition-colors hover:bg-ochre-dark disabled:opacity-50"
                >
                  {isDecrypting ? "Decrypting..." : "Decrypt & Play"}
                </button>
              </div>

              {/* Progress */}
              {isDecrypting && (
                <div className="mt-6 max-w-sm mx-auto">
                  <div className="flex items-center justify-between mb-2 text-sm">
                    <span className="text-muted">Downloading & decrypting...</span>
                    <span className="text-foreground">{decryptProgress}%</span>
                  </div>
                  <div className="h-2 bg-stone rounded-full overflow-hidden">
                    <div
                      className="h-full bg-ochre transition-all duration-300"
                      style={{ width: `${decryptProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <p className="mt-6 text-xs text-muted">
                Decryption happens entirely in your browser. The password never leaves this device.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <video
                ref={videoRef}
                src={videoUrl}
                controls
                autoPlay
                className="w-full rounded-lg bg-charcoal"
                style={{ maxHeight: "60vh" }}
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-success">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Locally decrypted and playing</span>
                </div>

                <button
                  onClick={() => {
                    if (videoUrl) {
                      URL.revokeObjectURL(videoUrl);
                    }
                    setVideoUrl(null);
                    setPassword("");
                  }}
                  className="text-sm text-muted hover:text-foreground transition-colors"
                >
                  Lock and close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
