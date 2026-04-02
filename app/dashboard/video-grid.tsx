"use client";

import { useState, useRef, useCallback } from "react";
import { Video } from "@/lib/schema";
import { VideoPlayer } from "./video-player";
import { DeleteConfirmModal } from "./delete-confirm-modal";
import { ShareModal } from "./share-modal";

interface VideoGridProps {
  videos: Video[];
}

export function VideoGrid({ videos }: VideoGridProps) {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [videoToDelete, setVideoToDelete] = useState<Video | null>(null);
  const [videoList, setVideoList] = useState<Video[]>(videos);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [videoToShare, setVideoToShare] = useState<Video | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const startEditing = useCallback((video: Video, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(video.id);
    setEditValue(video.name);
    // Focus input after render
    setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingId(null);
    setEditValue("");
  }, []);

  const saveName = useCallback(async (videoId: string) => {
    const trimmed = editValue.trim();
    if (!trimmed || trimmed.length > 255) {
      cancelEditing();
      return;
    }

    setSavingId(videoId);
    try {
      const response = await fetch(`/api/videos/${videoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });

      if (response.ok) {
        const { video } = await response.json();
        setVideoList((prev) =>
          prev.map((v) => (v.id === videoId ? { ...v, name: video.name } : v))
        );
      } else {
        alert("Failed to rename video");
      }
    } catch (error) {
      console.error("Rename error:", error);
      alert("Failed to rename video");
    } finally {
      setSavingId(null);
      setEditingId(null);
      setEditValue("");
    }
  }, [editValue, cancelEditing]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, videoId: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveName(videoId);
    } else if (e.key === "Escape") {
      cancelEditing();
    }
  }, [saveName, cancelEditing]);

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

  const handleShare = (video: Video, e: React.MouseEvent) => {
    e.stopPropagation();
    setVideoToShare(video);
  };

  const handleDelete = async (video: Video, e: React.MouseEvent) => {
    e.stopPropagation();
    setVideoToDelete(video);
  };

  const confirmDelete = async () => {
    if (!videoToDelete) return;

    setDeletingId(videoToDelete.id);

    try {
      const response = await fetch(`/api/videos/${videoToDelete.id}/delete`, {
        method: "POST",
      });

      if (response.ok) {
        setVideoList((prev) => prev.filter((v) => v.id !== videoToDelete.id));
      } else {
        alert("Failed to delete video");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete video");
    } finally {
      setDeletingId(null);
      setVideoToDelete(null);
    }
  };

  const cancelDelete = () => {
    setVideoToDelete(null);
  };

  return (
    <>
      <div className="p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {videoList.map((video) => (
            <div
              key={video.id}
              className="group relative border border-border bg-stone/20 overflow-hidden hover:border-border/60 hover:bg-stone/30 transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedVideo(video)}
            >
              {/* Thumbnail */}
              <div className="aspect-video bg-stone flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="text-warm-gray group-hover:text-warm-gray/70 transition-colors duration-300">
                  <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>

                {/* Play overlay on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="h-10 w-10 flex items-center justify-center bg-foreground/80 text-background backdrop-blur-sm">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 ml-0.5" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>

                {/* Share button */}
                <button
                  onClick={(e) => handleShare(video, e)}
                  className="absolute top-2 right-2 p-1.5 bg-background/90 text-muted hover:text-ochre transition-colors opacity-0 group-hover:opacity-100"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.287.696.287 1.093m0-1.093l9.502-3.76a2.25 2.25 0 11.982 4.404l-9.502 3.76m0-4.404l9.502 3.76a2.25 2.25 0 01-.982 4.404l-9.502-3.76m.982 4.404a2.25 2.25 0 100-2.186m0 2.186c-.18-.324-.287-.696-.287-1.093m0 1.093l-9.502 3.76a2.25 2.25 0 11-.982-4.404l9.502-3.76m0 4.404l-9.502-3.76a2.25 2.25 0 01.982-4.404l9.502 3.76" />
                  </svg>
                </button>

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
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Info */}
              <div className="p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  {editingId === video.id ? (
                    <input
                      ref={inputRef}
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, video.id)}
                      onBlur={() => saveName(video.id)}
                      onClick={(e) => e.stopPropagation()}
                      disabled={savingId === video.id}
                      className="flex-1 min-w-0 bg-transparent border-b border-ochre/50 text-xs font-medium text-foreground focus:outline-none focus:border-ochre disabled:opacity-50"
                    />
                  ) : (
                    <>
                      <h3 className="text-xs font-medium text-foreground truncate flex-1">{video.name}</h3>
                      <button
                        onClick={(e) => startEditing(video, e)}
                        className="p-1 text-muted hover:text-foreground transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
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

      {/* Share Modal */}
      {videoToShare && (
        <ShareModal
          video={videoToShare}
          onClose={() => setVideoToShare(null)}
        />
      )}

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayer
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {videoToDelete && (
        <DeleteConfirmModal
          videoName={videoToDelete.name}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
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
