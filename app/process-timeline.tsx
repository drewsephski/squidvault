"use client";

import { ScrollReveal } from "@/components/scroll-reveal";

const steps = [
  {
    step: "01",
    title: "Encrypt in Your Browser",
    description:
      "Your video is encrypted with AES-256-GCM before it ever leaves your device. Think of it as a digital vault that only you hold the key to.",
    technical: "Client-side AES-256-GCM encryption with ephemeral keys",
    accent: "from-amber-500 to-ochre",
    pattern: "scan",
  },
  {
    step: "02",
    title: "Upload Scrambled Data",
    description:
      "Only encrypted chunks travel to our servers. Even if intercepted, the data is mathematically impossible to crack without your private key.",
    technical: "Zero-knowledge architecture: server never sees plaintext or keys",
    accent: "from-ochre to-orange-600",
    pattern: "transmit",
  },
  {
    step: "03",
    title: "Decrypt to Watch",
    description:
      "When you want to view, your browser fetches the encrypted chunks and decrypts them instantly. The original video never touches our servers.",
    technical: "Streamed decryption using Web Crypto API, no server-side processing",
    accent: "from-orange-600 to-amber-700",
    pattern: "unlock",
  },
];

export const ProcessTimeline = () => {
  return (
    <div className="relative">
      {/* Process flow line - continuous across all cards */}
      <div className="hidden lg:block absolute top-[3.25rem] left-[16.67%] right-[16.67%] h-px">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-ochre/40 to-transparent animate-pulse" style={{ animationDuration: '3s' }} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
        {steps.map((step, index) => (
          <ScrollReveal key={index} delay={index * 150} direction="up">
            <div className="group relative">
              {/* Step indicator with animated ring */}
              <div className="relative mb-6 flex items-center justify-center lg:mb-8">
                <div className="relative">
                  {/* Outer ring - animated on hover */}
                  <div className="absolute inset-0 rounded-full border border-ochre/20 scale-100 transition-transform duration-500 group-hover:scale-150 group-hover:border-ochre/0" />
                  <div className="absolute inset-0 rounded-full border border-ochre/10 scale-125 transition-transform duration-700 group-hover:scale-175" />
                  
                  {/* Step number circle */}
                  <div className="relative h-14 w-14 rounded-full bg-background border-2 border-ochre flex items-center justify-center shadow-sm z-10">
                    <span className="text-sm font-semibold text-ochre tabular-nums">
                      {step.step}
                    </span>
                  </div>
                  
                  {/* Active indicator dot */}
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-background border border-ochre flex items-center justify-center">
                    <div className={`h-2 w-2 rounded-full bg-gradient-to-br ${step.accent}`} />
                  </div>
                </div>
              </div>

              {/* Card with asymmetric design */}
              <div className="relative bg-background border border-border/80 overflow-hidden transition-all duration-300 group-hover:border-ochre/30 group-hover:shadow-lg group-hover:shadow-ochre/5">
                {/* Gradient accent bar - left side */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${step.accent} opacity-60 transition-all duration-300 group-hover:w-1.5 group-hover:opacity-100`} />
                
                {/* Subtle background pattern */}
                <div className="absolute inset-0 opacity-[0.02]" style={{
                  backgroundImage: step.pattern === 'scan' 
                    ? 'repeating-linear-gradient(90deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 8px)'
                    : step.pattern === 'transmit'
                    ? 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 1px)'
                    : 'linear-gradient(45deg, currentColor 1px, transparent 1px)',
                  backgroundSize: step.pattern === 'scan' ? '100% 100%' : step.pattern === 'transmit' ? '12px 12px' : '8px 8px'
                }} />

                <div className="relative p-6 lg:p-7">
                  {/* Header with icon */}
                  <div className="mb-4 flex items-center gap-3">
                    <div className={`h-px flex-1 bg-gradient-to-r ${step.accent} opacity-40`} />
                    <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-stone border border-border text-ochre">
                      {step.pattern === 'scan' && (
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                      )}
                      {step.pattern === 'transmit' && (
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774" />
                          <circle cx="12" cy="12" r="3" className="fill-current opacity-20" />
                        </svg>
                      )}
                      {step.pattern === 'unlock' && (
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                      )}
                    </div>
                    <div className={`h-px flex-1 bg-gradient-to-l ${step.accent} opacity-40`} />
                  </div>

                  {/* Title */}
                  <h3 className="text-center text-lg font-medium text-foreground mb-3">
                    {step.title}
                  </h3>
                  
                  {/* Main description - accessible to all users */}
                  <p className="text-center text-sm text-muted leading-relaxed max-w-[32ch] mx-auto">
                    {step.description}
                  </p>

                  {/* Technical detail - for technical audience */}
                  <div className="mt-4 px-3 py-2 bg-stone/50 border border-border/50 rounded-sm">
                    <p className="text-center text-[11px] font-mono text-ochre/70 leading-snug">
                      {step.technical}
                    </p>
                  </div>

                  {/* Bottom accent line */}
                  <div className="mt-5 pt-4 border-t border-border/50 flex items-center justify-center gap-2">
                    <div className={`h-0.5 w-8 rounded-full bg-gradient-to-r ${step.accent} opacity-60`} />
                    <div className="h-1 w-1 rounded-full bg-ochre/40" />
                    <div className={`h-0.5 w-8 rounded-full bg-gradient-to-l ${step.accent} opacity-60`} />
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
};
