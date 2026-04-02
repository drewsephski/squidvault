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

  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  const handleDecrypt = async () => {
    if (!password) {
      setError("Enter the decryption password");
      return;
    }

    setIsDecrypting(true);
    setDecryptProgress(0);
    setError(null);

    try {
      setDecryptProgress(20);
      
      // Get signed URL from API
      const response = await fetch(`/api/videos/${video.id}`);
      if (!response.ok) {
        throw new Error("Failed to get video URL");
      }
      
      const { url: signedUrl, video: videoMeta } = await response.json();
      setDecryptProgress(40);
      
      // Fetch encrypted file from signed URL
      let fileResponse;
      try {
        fileResponse = await fetch(signedUrl);
      } catch (fetchErr) {
        console.error("Fetch error:", fetchErr);
        throw new Error(`Network error: ${fetchErr instanceof Error ? fetchErr.message : 'Failed to fetch'}`);
      }
      if (!fileResponse.ok) {
        throw new Error("Failed to download encrypted video");
      }
      
      setDecryptProgress(60);
      const encryptedBlob = await fileResponse.blob();
      setDecryptProgress(80);

      const decryptedData = await decryptFile(
        encryptedBlob,
        password,
        videoMeta.encryptionSalt,
        videoMeta.encryptionIv
      );

      setDecryptProgress(90);

      const decryptedBlob = new Blob([decryptedData], { type: video.mimeType });
      const url = URL.createObjectURL(decryptedBlob);

      setVideoUrl(url);
      setDecryptProgress(100);
    } catch (err) {
      console.error("Decryption error:", err);
      setError("Wrong password? Decryption failed.");
    } finally {
      setIsDecrypting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-4xl border border-border bg-background overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-stone/20">
          <div className="flex items-center gap-3">
            <span className="text-micro text-ochre">Secure Player</span>
            <span className="text-xs text-muted truncate max-w-xs">{video.name}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-stone transition-colors"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!videoUrl ? (
            <div className="text-center py-10">
              <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center border border-ochre/20 bg-ochre/8 text-ochre">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>

              <h3 className="text-subhead text-foreground mb-1.5">Enter Decryption Password</h3>
              <p className="text-body text-muted mb-5 max-w-sm mx-auto">
                This video is encrypted. Enter the password you used when uploading to watch.
              </p>

              <div className="max-w-sm mx-auto space-y-3">
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
                  <div className="p-2.5 bg-error/10 border border-error/20 text-xs text-error">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleDecrypt}
                  disabled={isDecrypting}
                  className="w-full inline-flex h-10 items-center justify-center bg-ochre px-5 text-xs font-semibold text-white transition-colors hover:bg-ochre-dark disabled:opacity-50"
                >
                  {isDecrypting ? "Decrypting..." : "Decrypt & Play"}
                </button>
              </div>

              {isDecrypting && (
                <div className="mt-5 max-w-sm mx-auto">
                  <div className="flex items-center justify-between mb-1.5 text-xs">
                    <span className="text-muted">Downloading & decrypting...</span>
                    <span className="text-foreground font-medium">{decryptProgress}%</span>
                  </div>
                  <div className="h-1 bg-stone overflow-hidden">
                    <div
                      className="h-full bg-ochre transition-all duration-300"
                      style={{ width: `${decryptProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <p className="mt-5 text-micro text-muted">
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
                className="w-full bg-charcoal"
                style={{ maxHeight: "60vh" }}
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-success">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  <span>Locally decrypted</span>
                </div>

                <button
                  onClick={() => {
                    if (videoUrl) {
                      URL.revokeObjectURL(videoUrl);
                    }
                    setVideoUrl(null);
                    setPassword("");
                  }}
                  className="text-xs text-muted hover:text-foreground transition-colors"
                >
                  Lock & close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
