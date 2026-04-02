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
      <div className="p-10 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center border border-border bg-stone text-muted">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <h3 className="text-subhead text-foreground mb-1.5">No videos yet</h3>
        <p className="text-body text-muted max-w-xs mx-auto">
          Upload your first video. It will be encrypted before leaving your browser.
        </p>
      </div>
    );
  }

  const handleDelete = async (video: Video, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm(`Delete "${video.name}"? This cannot be undone.`)) {
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
      <div className="p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {videoList.map((video) => (
            <div
              key={video.id}
              className="group relative border border-border bg-stone/20 overflow-hidden hover:border-ochre/40 transition-all cursor-pointer"
              onClick={() => setSelectedVideo(video)}
            >
              {/* Thumbnail */}
              <div className="aspect-video bg-stone flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="text-warm-gray group-hover:text-ochre transition-colors">
                  <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                
                {/* Play overlay on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="h-10 w-10 flex items-center justify-center bg-ochre/90 text-white">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 ml-0.5" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>

                {/* Encrypted badge */}
                <div className="absolute top-2 right-2">
                  <span className="inline-flex items-center gap-1 bg-success/90 px-1.5 py-0.5 text-micro text-white font-semibold">
                    <svg viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                    AES-256
                  </span>
                </div>

                {/* Delete button */}
                <button
                  onClick={(e) => handleDelete(video, e)}
                  disabled={deletingId === video.id}
                  className="absolute top-2 left-2 p-1.5 bg-background/90 text-muted hover:text-error transition-colors opacity-0 group-hover:opacity-100"
                >
                  {deletingId === video.id ? (
                    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="10" strokeWidth="4" className="opacity-25" />
                      <path strokeWidth="4" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Info */}
              <div className="p-3">
                <h3 className="text-xs font-medium text-foreground truncate mb-1.5">{video.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-micro text-muted">{formatBytes(video.originalSize)}</span>
                  <span className="text-micro text-warm-gray">{formatDate(video.createdAt)}</span>
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-micro text-muted">
                  <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {video.viewCount} views
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
