"use client";

import { useState, useCallback } from "react";
import { Video } from "@/lib/schema";
import { wrapKey, base64ToArrayBuffer } from "@/lib/encryption";

interface ShareModalProps {
  video: Video;
  onClose: () => void;
}

export function ShareModal({ video, onClose }: ShareModalProps) {
  const [sharePassword, setSharePassword] = useState("");
  const [expiresIn, setExpiresIn] = useState<string>("24h");
  const [maxViews, setMaxViews] = useState<string>("");
  const [creating, setCreating] = useState(false);
  const [result, setResult] = useState<{ shareUrl: string; token: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = useCallback(async () => {
    if (!sharePassword) {
      setError("Please enter a share password");
      return;
    }

    if (sharePassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setCreating(true);
    setError(null);

    try {
      // Derive the video encryption key from the user's vault password
      // For this flow, we need the user to enter their vault password to derive the key
      // Then wrap that key with the share password
      // NOTE: This requires the user to enter their vault password - we should prompt for it
      // For now, we'll use a simplified flow where the wrapped key is derived client-side
      
      // Actually, we need the user's vault password to decrypt the video key first
      // Then wrap that key with the share password
      // This is complex - let me implement the proper flow
      
      // For now, let's use a placeholder approach:
      // The video's encryptionSalt and encryptionIv are stored
      // The actual decryption key is derived from the user's vault password
      // We need that key to wrap it with the share password
      
      // Prompt for vault password
      const vaultPassword = prompt("Enter your vault password to create share:");
      if (!vaultPassword) {
        setCreating(false);
        return;
      }

      // Import the deriveKey function dynamically
      const { deriveKey } = await import("@/lib/encryption");
      
      // Derive the video decryption key with extractable=true
      const videoSalt = base64ToArrayBuffer(video.encryptionSalt);
      const videoKey = await deriveKey(vaultPassword, new Uint8Array(videoSalt), true);
      
      // Export the raw key for wrapping
      const rawKey = await crypto.subtle.exportKey("raw", videoKey);
      
      // Wrap the key with the share password
      const { wrappedKey, salt } = await wrapKey(rawKey, sharePassword);
      
      // Create share via API
      const response = await fetch(`/api/videos/${video.id}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wrappedKey,
          salt,
          expiresIn: expiresIn || null,
          maxViews: maxViews ? parseInt(maxViews, 10) : null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create share");
      }

      const data = await response.json();
      setResult({ shareUrl: data.share.shareUrl, token: data.share.id });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create share");
    } finally {
      setCreating(false);
    }
  }, [video, sharePassword, expiresIn, maxViews]);

  const handleCopy = useCallback(() => {
    if (result?.shareUrl) {
      navigator.clipboard.writeText(result.shareUrl);
    }
  }, [result]);

  const handleCopyWithPassword = useCallback(() => {
    if (result?.shareUrl) {
      const text = `Video: ${video.name}\nLink: ${result.shareUrl}\nPassword: ${sharePassword}`;
      navigator.clipboard.writeText(text);
    }
  }, [result, sharePassword, video.name]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-md border border-border bg-background shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-stone/20">
          <h2 className="text-subhead text-foreground">Share Video</h2>
          <button
            onClick={onClose}
            className="p-1 text-muted hover:text-foreground transition-colors"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {result ? (
            /* Success State */
            <div className="space-y-4">
              <div className="p-4 bg-success/10 border border-success/20">
                <p className="text-sm text-success font-medium mb-2">Share created successfully!</p>
                <p className="text-micro text-muted">
                  Share this link and password with the recipient
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-micro text-muted mb-1">Share Link</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={result.shareUrl}
                      readOnly
                      className="flex-1 h-10 px-3 bg-stone/50 border border-border text-sm text-foreground"
                    />
                    <button
                      onClick={handleCopy}
                      className="px-4 h-10 bg-foreground text-background text-sm font-medium hover:bg-foreground/90"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-micro text-muted mb-1">Password</label>
                  <input
                    type="text"
                    value={sharePassword}
                    readOnly
                    className="w-full h-10 px-3 bg-stone/50 border border-border text-sm text-foreground"
                  />
                </div>

                <button
                  onClick={handleCopyWithPassword}
                  className="w-full h-10 border border-border bg-background text-sm font-medium text-foreground hover:bg-stone/50"
                >
                  Copy Link + Password
                </button>
              </div>

              <div className="pt-4 border-t border-border">
                <button
                  onClick={onClose}
                  className="w-full h-10 bg-ochre text-background text-sm font-medium hover:bg-ochre-dark"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Create Form */
            <div className="space-y-4">
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="share-password" className="block text-micro text-muted mb-2">
                  Share Password
                </label>
                <input
                  type="password"
                  id="share-password"
                  value={sharePassword}
                  onChange={(e) => setSharePassword(e.target.value)}
                  placeholder="Enter a strong password"
                  className="w-full h-12 px-4 bg-background border border-border text-foreground placeholder:text-muted focus:border-ochre focus:outline-none"
                />
                <p className="mt-1 text-micro text-muted">
                  Recipients will need this password to view the video
                </p>
              </div>

              <div>
                <label htmlFor="expiry" className="block text-micro text-muted mb-2">
                  Expires After
                </label>
                <select
                  id="expiry"
                  value={expiresIn}
                  onChange={(e) => setExpiresIn(e.target.value)}
                  className="w-full h-12 px-4 bg-background border border-border text-foreground focus:border-ochre focus:outline-none"
                >
                  <option value="1h">1 hour</option>
                  <option value="24h">24 hours</option>
                  <option value="7d">7 days</option>
                  <option value="30d">30 days</option>
                  <option value="">Never</option>
                </select>
              </div>

              <div>
                <label htmlFor="max-views" className="block text-micro text-muted mb-2">
                  Maximum Views (optional)
                </label>
                <input
                  type="number"
                  id="max-views"
                  value={maxViews}
                  onChange={(e) => setMaxViews(e.target.value)}
                  placeholder="Unlimited"
                  min="1"
                  max="1000"
                  className="w-full h-12 px-4 bg-background border border-border text-foreground placeholder:text-muted focus:border-ochre focus:outline-none"
                />
              </div>

              <div className="pt-4 space-y-2">
                <button
                  onClick={handleCreate}
                  disabled={creating || !sharePassword}
                  className="w-full h-12 bg-ochre text-background font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-ochre-dark"
                >
                  {creating ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-25" />
                        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating Share...
                    </span>
                  ) : (
                    "Create Share"
                  )}
                </button>

                <button
                  onClick={onClose}
                  disabled={creating}
                  className="w-full h-12 border border-border bg-background text-foreground font-medium hover:bg-stone/50"
                >
                  Cancel
                </button>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-micro text-muted text-center">
                  {video.name}
                  <br />
                  <span className="text-warm-gray">{formatBytes(video.originalSize)}</span>
                </p>
              </div>
            </div>
          )}
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
