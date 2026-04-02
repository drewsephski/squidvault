"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { unwrapKey, base64ToArrayBuffer, decryptData } from "@/lib/encryption";
import Link from "next/link";

interface ShareData {
  valid: boolean;
  share: {
    id: string;
    wrappedKey: string;
    salt: string;
    expiresAt: string | null;
    maxViews: number | null;
    viewCount: number;
  };
  video: {
    id: string;
    name: string;
    description: string | null;
    originalSize: number;
    mimeType: string;
    encryptionSalt: string;
    encryptionIv: string;
    thumbnailPath: string | null;
  };
}

export default function SharePage() {
  const params = useParams();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [password, setPassword] = useState("");
  const [decrypting, setDecrypting] = useState(false);
  const [videoKey, setVideoKey] = useState<ArrayBuffer | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);

  // Fetch share data on mount
  useEffect(() => {
    async function fetchShare() {
      try {
        const res = await fetch(`/api/share/${token}`);
        if (!res.ok) {
          const data = await res.json();
          if (data.code === "REVOKED") {
            setError("This share has been revoked by the owner.");
          } else if (data.code === "EXPIRED") {
            setError("This share has expired.");
          } else if (data.code === "MAX_VIEWS") {
            setError("This share has reached its view limit.");
          } else {
            setError(data.error || "Share not found.");
          }
          setLoading(false);
          return;
        }

        const data = await res.json();
        setShareData(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load share. Please try again.");
        setLoading(false);
      }
    }

    fetchShare();
  }, [token]);

  // Handle password submit and decrypt
  const handleUnlock = useCallback(async () => {
    if (!shareData || !password) return;

    setDecrypting(true);
    setError(null);

    try {
      // Unwrap the video key with the share password
      const unwrappedKey = await unwrapKey(shareData.share.wrappedKey, password);
      
      if (!unwrappedKey) {
        setError("Incorrect password. Please try again.");
        setDecrypting(false);
        return;
      }

      setVideoKey(unwrappedKey);

      // Fetch the encrypted video stream
      const streamRes = await fetch(`/api/share/${token}/stream`);
      if (!streamRes.ok) {
        const data = await streamRes.json();
        if (data.code === "MAX_VIEWS") {
          setError("View limit reached while loading.");
        } else {
          setError("Failed to load video stream.");
        }
        setDecrypting(false);
        return;
      }

      const streamData = await streamRes.json();

      // Fetch encrypted video data
      const videoRes = await fetch(streamData.url);
      if (!videoRes.ok) {
        setError("Failed to download video.");
        setDecrypting(false);
        return;
      }

      const encryptedBuffer = await videoRes.arrayBuffer();

      // Import the unwrapped key as a CryptoKey for decryption
      const videoKey = await crypto.subtle.importKey(
        "raw",
        unwrappedKey,
        { name: "AES-GCM", length: 256 },
        false,
        ["decrypt"]
      );

      // Decrypt the video
      const videoIv = base64ToArrayBuffer(shareData.video.encryptionIv);
      const decryptedBuffer = await decryptData(encryptedBuffer, videoKey, new Uint8Array(videoIv));

      // Create blob and URL for video player
      const blob = new Blob([decryptedBuffer], { type: shareData.video.mimeType });
      const url = URL.createObjectURL(blob);

      setVideoBlob(blob);
      setVideoUrl(url);
      setDecrypting(false);
    } catch (err) {
      console.error("Unlock error:", err);
      setError("Failed to decrypt video. The password may be incorrect.");
      setDecrypting(false);
    }
  }, [shareData, password, token]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-ochre border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted">Loading share...</p>
        </div>
      </div>
    );
  }

  if (error && !shareData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 mb-4">
            <svg className="h-6 w-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-foreground mb-2">Share Unavailable</h1>
          <p className="text-muted mb-6">{error}</p>
          <Link href="/" className="text-ochre hover:underline text-sm">
            Return to SquidVault
          </Link>
        </div>
      </div>
    );
  }

  if (!shareData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted">Share not found.</p>
        </div>
      </div>
    );
  }

  // Video is unlocked and ready to play
  if (videoUrl) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="mb-6">
            <Link href="/" className="text-muted hover:text-foreground text-sm">
              ← Back to SquidVault
            </Link>
          </div>

          <div className="border border-border bg-background overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-stone/20">
              <h1 className="text-subhead text-foreground">{shareData.video.name}</h1>
              {shareData.video.description && (
                <p className="text-body text-muted mt-1">{shareData.video.description}</p>
              )}
            </div>

            <div className="aspect-video bg-black">
              <video
                src={videoUrl}
                controls
                className="w-full h-full"
                autoPlay
              />
            </div>

            <div className="px-5 py-3 border-t border-border bg-stone/10">
              <div className="flex items-center justify-between text-micro text-muted">
                <span>End-to-end encrypted</span>
                <span>{formatBytes(shareData.video.originalSize)}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-micro text-muted">
              This video was shared securely via SquidVault.
              <br />
              Zero-knowledge encryption — even we can&apos;t see the content.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Password entry form
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-ochre/10 mb-4">
            <svg className="h-6 w-6 text-ochre" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h1 className="text-headline text-foreground mb-2">Encrypted Video</h1>
          <p className="text-body text-muted">
            {shareData.video.name}
          </p>
        </div>

        <div className="border border-border bg-background p-6">
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-micro text-muted mb-2">
                Enter share password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
                className="w-full h-12 px-4 bg-background border border-border text-foreground placeholder:text-muted focus:border-ochre focus:outline-none"
                placeholder="Password provided by sender"
                disabled={decrypting}
              />
            </div>

            <button
              onClick={handleUnlock}
              disabled={!password || decrypting}
              className="w-full h-12 bg-ochre text-background font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-ochre-dark transition-colors"
            >
              {decrypting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Decrypting...
                </span>
              ) : (
                "Unlock Video"
              )}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center justify-between text-micro text-muted">
              <span>Size: {formatBytes(shareData.video.originalSize)}</span>
              {shareData.share.maxViews && (
                <span>Views: {shareData.share.viewCount}/{shareData.share.maxViews}</span>
              )}
            </div>
            {shareData.share.expiresAt && (
              <p className="text-micro text-muted mt-2">
                Expires: {new Date(shareData.share.expiresAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-micro text-muted">
            Protected by AES-256-GCM encryption.
            <br />
            <Link href="/" className="text-ochre hover:underline">
              Learn more about SquidVault
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
