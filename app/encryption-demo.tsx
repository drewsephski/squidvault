"use client";

import { useEffect, useMemo, useState } from "react";

export const EncryptionDemo = () => {
  const [step, setStep] = useState(0);
  const [speed, setSpeed] = useState(125.0);
  const [keyBytes, setKeyBytes] = useState<string[]>([]);

  useEffect(() => {
    setKeyBytes(
      Array.from({ length: 32 }, () =>
        Math.random().toString(16).substring(2, 4).toUpperCase()
      )
    );
  }, [step]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % 4);
      setSpeed(Math.random() * 50 + 100);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const chunks = useMemo(() => {
    return Array.from({ length: 8 }, () =>
      Array.from({ length: 16 }, () =>
        Math.random().toString(16).substring(2, 4).toUpperCase()
      ).join(" ")
    );
  }, [step]);

  const steps = [
    { 
      label: "SCAN", 
      status: "Analyzing video stream for encryption points...",
      icon: "◈"
    },
    { 
      label: "KEYGEN", 
      status: "Generating 256-bit AES encryption key...",
      icon: "◉"
    },
    { 
      label: "ENCRYPT", 
      status: "Applying Galois/Counter Mode transformation...",
      icon: "◆"
    },
    { 
      label: "SEALED", 
      status: "Payload secured. Ready for transmission.",
      icon: "◊"
    },
  ];

  const statusColors = [
    "text-amber-400",
    "text-cyan-400", 
    "text-emerald-400",
    "text-rose-400"
  ];

  const glowColors = [
    "shadow-amber-400/20",
    "shadow-cyan-400/20",
    "shadow-emerald-400/20", 
    "shadow-rose-400/20"
  ];

  return (
    <div className="relative bg-neutral-950 border border-neutral-800 overflow-hidden">
      {/* CRT scanline overlay */}
      <div 
        className="absolute inset-0 pointer-events-none z-10 opacity-[0.03]"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0,0,0,0.3) 2px,
            rgba(0,0,0,0.3) 4px
          )`
        }}
      />
      
      {/* Corner brackets - industrial feel */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-neutral-600" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-neutral-600" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-neutral-600" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-neutral-600" />

      <div className="p-6 lg:p-8 relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-neutral-500">
              <span className="text-[10px] tracking-[0.3em] font-medium uppercase">Encryption Protocol</span>
              <span className="text-neutral-700">/</span>
              <span className="text-[10px] tracking-widest font-mono">AES-256-GCM</span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-xs tracking-[0.2em] text-neutral-400 uppercase">Terminal</span>
              <span className="text-[10px] font-mono text-neutral-600">v3.2.1-stable</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${
                step === 3 ? "bg-emerald-400 shadow-lg shadow-emerald-400/50" : "bg-amber-400"
              }`} />
              <span className={`text-[11px] tracking-wider font-mono uppercase ${statusColors[step]}`}>
                {steps[step].label}
              </span>
            </div>
            <div className="h-6 w-px bg-neutral-800" />
            <span className="text-[10px] font-mono text-neutral-500 tabular-nums">
              {speed.toFixed(1)} MB/s
            </span>
          </div>
        </div>

        {/* Progress pipeline */}
        <div className="mb-8">
          <div className="flex items-center gap-1">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center">
                <div className={`
                  relative flex items-center justify-center w-12 h-12 border transition-all duration-700
                  ${i <= step 
                    ? `border-${statusColors[step].replace('text-', '')} bg-neutral-900/50 ${glowColors[step]}` 
                    : "border-neutral-800 bg-neutral-900/30"
                  }
                `}>
                  <span className={`text-lg transition-all duration-500 ${
                    i <= step ? statusColors[step] : "text-neutral-700"
                  }`}>
                    {s.icon}
                  </span>
                  {i === step && (
                    <div className="absolute inset-0 border border-current opacity-30 animate-pulse" 
                      style={{ borderColor: 'currentColor' }}
                    />
                  )}
                </div>
                {i < 3 && (
                  <div className={`
                    w-8 h-px mx-1 transition-all duration-500
                    ${i < step ? "bg-neutral-600" : "bg-neutral-800"}
                  `} />
                )}
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-neutral-500 tracking-wide">
            {steps[step].status}
          </p>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-[1fr_auto] gap-6">
          {/* Data stream */}
          <div className="space-y-0 border-l-2 border-neutral-800 pl-4">
            <div className="flex items-center gap-4 mb-3 pb-2 border-b border-neutral-800">
              <span className="text-[10px] tracking-wider text-neutral-500 uppercase">Offset</span>
              <span className="text-[10px] tracking-wider text-neutral-500 uppercase flex-1">Data</span>
              <span className="text-[10px] tracking-wider text-neutral-500 uppercase">State</span>
            </div>
            
            {chunks.map((chunk, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 py-1.5 font-mono text-[11px] transition-all duration-300"
                style={{
                  opacity: step >= 2 
                    ? 0.3 + (idx % 2) * 0.4 
                    : 0.2 + (idx % 3) * 0.1,
                }}
              >
                <span className="text-neutral-600 w-12 tabular-nums">
                  0x{(idx * 16).toString(16).toUpperCase().padStart(4, "0")}
                </span>
                <span className="tracking-[0.15em] text-neutral-400 flex-1">
                  {chunk}
                </span>
                <span className={`
                  w-5 text-center transition-all duration-300
                  ${step >= 2 && idx <= step + 4 
                    ? statusColors[step] 
                    : "text-neutral-700"
                  }
                `}>
                  {step >= 2 && idx <= step + 4 ? "▣" : "□"}
                </span>
              </div>
            ))}
          </div>

          {/* Side panel - Key visualization */}
          <div className="w-40 space-y-3">
            <div className="border border-neutral-800 bg-neutral-900/30 p-3">
              <div className="text-[10px] tracking-wider text-neutral-500 uppercase mb-2">
                Session Key
              </div>
              <div className="font-mono text-[9px] leading-relaxed tracking-wider text-neutral-400 break-all">
                {keyBytes.map((byte, i) => (
                  <span key={i} className={`
                    ${i % 2 === 0 ? "text-neutral-500" : "text-neutral-400"}
                    ${step === 1 && i < (Date.now() % 32) ? "text-cyan-400" : ""}
                  `}>
                    {byte}
                  </span>
                )).reduce((prev, curr, i) => 
                  i === 0 ? [curr] : [...prev, i % 8 === 0 ? <span key={`space-${i}`} className="mx-0.5" /> : null, curr]
                , [] as React.ReactNode[])}
              </div>
            </div>

            <div className="border border-neutral-800 bg-neutral-900/30 p-3">
              <div className="text-[10px] tracking-wider text-neutral-500 uppercase mb-2">
                Block Size
              </div>
              <div className="text-lg font-mono text-neutral-400 tabular-nums">
                128<span className="text-[10px] text-neutral-600 ml-1">bit</span>
              </div>
            </div>

            <div className="border border-neutral-800 bg-neutral-900/30 p-3">
              <div className="text-[10px] tracking-wider text-neutral-500 uppercase mb-2">
                Auth Tag
              </div>
              <div className="font-mono text-[9px] text-neutral-500">
                {step === 3 ? "GCM-AUTH-OK" : "pending..."}
              </div>
            </div>
          </div>
        </div>

        {/* Footer stats */}
        <div className="mt-8 pt-4 border-t border-neutral-800 flex items-center justify-between text-[10px] font-mono">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-neutral-600">CIPHER</span>
              <span className="text-neutral-400">AES-256-GCM</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-600">MODE</span>
              <span className="text-neutral-400">Galois/Counter</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-600">NONCE</span>
              <span className="text-neutral-400">96-bit IV</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-neutral-600">SECURE_CHANNEL</span>
            <span className={step === 3 ? "text-emerald-400" : "text-amber-400"}>
              {step === 3 ? "ESTABLISHED" : "HANDSHAKE"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
