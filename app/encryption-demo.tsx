"use client";

import { useEffect, useMemo, useState } from "react";

export const EncryptionDemo = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 0.6));
    }, 60);
    return () => clearInterval(interval);
  }, []);

  const step = progress < 20 ? 0 : progress < 35 ? 1 : progress < 90 ? 2 : 3;

  const chunks = useMemo(() => {
    return Array.from({ length: 6 }, () =>
      Array.from({ length: 8 }, () =>
        Math.random().toString(16).substring(2, 4).toUpperCase()
      ).join(" ")
    );
  }, [Math.floor(progress / 20)]);

  const steps = [
    { label: "SCAN", color: "oklch(72% 0.18 75)" },
    { label: "KEYGEN", color: "oklch(65% 0.11 185)" },
    { label: "ENCRYPT", color: "oklch(68% 0.14 145)" },
    { label: "SEALED", color: "oklch(62% 0.2 25)" },
  ];

  const encryptedRows = Math.max(0, Math.floor((progress - 35) / 9));

  return (
    <div className="relative bg-background border border-border/80 overflow-hidden shadow-lg shadow-foreground/5">
      {/* Left accent bar - matches feature cards */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 transition-all duration-300"
        style={{
          background: `linear-gradient(to bottom, ${steps[step].color}, oklch(72% 0.18 75))`,
          opacity: 0.8,
        }}
      />

      {/* Subtle grid pattern - matches process cards */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 8px)",
        }}
      />

      <div className="relative p-6 pl-7">
        {/* Header - clean readout matching site typography */}
        <div className="flex items-baseline justify-between mb-6">
          <div className="flex items-baseline gap-3">
            <span
              className="text-caption"
              style={{ color: steps[step].color }}
            >
              {steps[step].label}
            </span>
            <span className="text-micro text-muted">/</span>
            <span className="text-micro text-muted">AES-256-GCM</span>
          </div>
          <span className="text-caption tabular-nums text-foreground">
            {Math.floor(progress).toString().padStart(3, "0")}
          </span>
        </div>

        {/* Progress bar - minimal, elegant */}
        <div className="relative h-1 bg-stone mb-6">
          <div
            className="h-full transition-all duration-150 ease-out"
            style={{
              width: `${progress}%`,
              background: steps[step].color,
            }}
          />
          {/* Phase tick marks */}
          <div className="absolute inset-0 flex">
            {[20, 35, 90].map((p) => (
              <div
                key={p}
                className="absolute top-0 bottom-0 w-px bg-border"
                style={{ left: `${p}%` }}
              />
            ))}
          </div>
        </div>

        {/* File information */}
        <div className="mb-6 pb-5 border-b border-border/50">
          <div className="flex items-baseline gap-4 mb-1">
            <span className="text-body text-foreground font-medium">
              family_vacation_2024.mp4
            </span>
            <span className="text-micro text-muted">847.3 MB</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: steps[step].color,
                opacity: 0.8,
              }}
            />
            <span className="text-micro text-muted">
              {step === 0
                ? "Analyzing entropy"
                : step === 1
                ? "Generating key material"
                : step === 2
                ? "Block encryption in progress"
                : "Secure vault storage"}
            </span>
          </div>
        </div>

        {/* Data stream - hex view */}
        <div className="space-y-1 text-caption leading-relaxed font-mono">
          <div className="flex items-center gap-3 text-muted mb-2 pb-1 border-b border-border/30">
            <span className="w-10">ADDR</span>
            <span className="flex-1">PAYLOAD</span>
            <span className="w-6 text-right">STATE</span>
          </div>
          {chunks.map((chunk, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 transition-opacity duration-300"
              style={{
                opacity: 0.4 + (idx / chunks.length) * 0.5,
              }}
            >
              <span className="text-muted w-10 tabular-nums">
                {(idx * 256).toString(16).toUpperCase().padStart(3, "0")}0
              </span>
              <span
                className="tracking-[0.15em] flex-1 font-mono"
                style={{
                  color: idx < encryptedRows ? "oklch(68% 0.01 75)" : "oklch(58% 0.015 75)",
                }}
              >
                {chunk}
              </span>
              <span
                className="w-6 text-right text-micro tabular-nums transition-colors duration-200"
                style={{
                  color: idx < encryptedRows ? "oklch(68% 0.14 145)" : "oklch(58% 0.015 75)",
                }}
              >
                {idx < encryptedRows ? "E" : "P"}
              </span>
            </div>
          ))}
        </div>

        {/* Footer - key status */}
        <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-micro text-muted tracking-wider">KEY</span>
            <span
              className="text-caption tracking-[0.15em] font-mono"
              style={{
                color: step >= 1 ? "oklch(96% 0.006 80)" : "oklch(22% 0.018 70)",
              }}
            >
              {step >= 1
                ? step >= 3
                  ? "••••••••••••••••"
                  : "DERIVING..."
                : "───────────────"}
            </span>
          </div>
          <span
            className="text-micro tracking-wider transition-colors duration-300"
            style={{
              color: step === 3 ? "oklch(68% 0.14 145)" : "oklch(58% 0.015 75)",
            }}
          >
            {step === 3 ? "VAULT" : step === 2 ? "CRYPT" : "INIT"}
          </span>
        </div>
      </div>
    </div>
  );
};
