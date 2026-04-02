"use client";

import { useState } from "react";
import { Video } from "@/lib/schema";
import { VideoPlayer } from "./video-player";

interface VideoGridProps {
  videos: Video[];
}

export function VideoGrid({ videos }: VideoGridProps) {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [videoList, setVideoList] = useState<Video[]>(videos);

  if (videoList.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-stone text-muted">
          <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-subhead text-foreground mb-2">No videos yet</h3>
        <p className="text-body text-muted">
          Upload your first video to get started. It will be encrypted and stored securely.
        </p>
      </div>
    );
  }

  const handleDelete = async (video: Video, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm(`Delete "${video.name}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(video.id);

    try {
      const response = await fetch(`/api/videos/${video.id}/delete`, {
        method: "POST",
      });

      if (response.ok) {
        setVideoList((prev) => prev.filter((v) => v.id !== video.id));
      } else {
        alert("Failed to delete video");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete video");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {videoList.map((video) => (
            <div
              key={video.id}
              className="group relative bg-stone/30 rounded-xl border border-border overflow-hidden hover:border-ochre/50 hover:shadow-md transition-all cursor-pointer"
              onClick={() => setSelectedVideo(video)}
            >
              {/* Thumbnail */}
              <div className="aspect-video bg-stone flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="text-muted group-hover:text-ochre transition-colors">
                  <svg viewBox="0 0 24 24" className="h-16 w-16" fill="none" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                
                {/* Play overlay on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="h-14 w-14 rounded-full bg-ochre/90 flex items-center justify-center text-white shadow-lg">
                    <svg viewBox="0 0 24 24" className="h-6 w-6 ml-1" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>

                {/* Encrypted badge */}
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-success/90 px-2 py-1 text-xs font-medium text-white shadow-sm">
                    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    AES-256
                  </span>
                </div>

                {/* Delete button */}
                <button
                  onClick={(e) => handleDelete(video, e)}
                  disabled={deletingId === video.id}
                  className="absolute top-3 left-3 p-2 rounded-full bg-background/90 text-muted hover:text-error hover:bg-error/10 transition-colors opacity-0 group-hover:opacity-100 shadow-sm"
                >
                  {deletingId === video.id ? (
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="10" strokeWidth="4" className="opacity-25" />
                      <path strokeWidth="4" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="text-sm font-medium text-foreground truncate mb-1">{video.name}</h3>
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>{formatBytes(video.originalSize)}</span>
                  <span>{formatDate(video.createdAt)}</span>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <span className="flex items-center gap-1 text-xs text-muted">
                    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {video.viewCount} views
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayer
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
