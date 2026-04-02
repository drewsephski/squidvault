"use client";

import { useState, useEffect } from "react";
import { VideoShare, ShareViewEvent } from "@/lib/schema";

interface ShareWithEvents extends VideoShare {
  viewEvents: Array<Pick<ShareViewEvent, "id" | "createdAt" | "watchDuration" | "completed" | "ipHash">>;
}

interface ViewActivityProps {
  videoId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ViewActivity({ videoId, isOpen, onClose }: ViewActivityProps) {
  const [shares, setShares] = useState<ShareWithEvents[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    async function fetchShares() {
      try {
        setLoading(true);
        const response = await fetch(`/api/videos/${videoId}/shares`);
        if (!response.ok) throw new Error("Failed to fetch shares");
        const data = await response.json();
        setShares(data.shares);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load shares");
      } finally {
        setLoading(false);
      }
    }

    fetchShares();
  }, [videoId, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[80vh] border border-border bg-background shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-stone/20">
          <div>
            <h2 className="text-subhead text-foreground">View Activity</h2>
            <p className="text-micro text-muted mt-0.5">Audit trail for supervision documentation</p>
          </div>
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
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin h-6 w-6 border-2 border-ochre border-t-transparent rounded-full" />
            </div>
          ) : error ? (
            <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          ) : shares.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-stone mb-4">
                <svg className="h-5 w-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-body text-muted">No shares created yet</p>
              <p className="text-micro text-warm-gray mt-1">
                Create a share link to track supervisor viewing activity
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {shares.map((share) => (
                <div key={share.id} className="border border-border bg-stone/10">
                  {/* Share Header */}
                  <div className="px-4 py-3 border-b border-border bg-background flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-muted">
                        {share.id.slice(0, 8)}...
                      </span>
                      {share.isRevoked && (
                        <span className="px-2 py-0.5 bg-warm-gray/20 text-warm-gray text-micro">
                          Revoked
                        </span>
                      )}
                      {share.maxViews && (
                        <span className="px-2 py-0.5 bg-ochre/10 text-ochre text-micro">
                          {share.viewCount}/{share.maxViews} views
                        </span>
                      )}
                    </div>
                    <span className="text-micro text-warm-gray">
                      Created {new Date(share.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* View Events */}
                  <div className="px-4 py-3">
                    {share.viewEvents.length === 0 ? (
                      <p className="text-micro text-warm-gray italic">
                        Not viewed yet
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {share.viewEvents.map((event) => (
                          <div
                            key={event.id}
                            className="flex items-center justify-between py-2 px-3 bg-background border-l-2 border-ochre"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-success/10">
                                <svg className="h-3.5 w-3.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-sm text-foreground">
                                  Viewed {new Date(event.createdAt).toLocaleString()}
                                </p>
                                {event.ipHash && (
                                  <p className="text-micro text-warm-gray font-mono">
                                    ID: {event.ipHash.slice(0, 8)}...
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              {event.completed ? (
                                <span className="px-2 py-0.5 bg-success/10 text-success text-micro">
                                  Completed
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-stone text-muted text-micro">
                                  Partial
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border bg-stone/20">
          <div className="flex items-center justify-between">
            <p className="text-micro text-muted">
              {shares.reduce((sum, s) => sum + s.viewEvents.length, 0)} total views across {shares.length} shares
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-foreground text-background text-sm font-medium hover:bg-foreground/90"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
