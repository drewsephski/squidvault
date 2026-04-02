"use client";

import { ScrollReveal } from "@/components/scroll-reveal";

const LockIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
    />
  </svg>
);

const EyeOffIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
    />
  </svg>
);

const VideoIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
    />
  </svg>
);

const steps = [
  {
    step: "01",
    title: "Encrypt in Browser",
    description:
      "Your video is encrypted using AES-256-GCM before leaving your device. Zero exposure.",
    icon: <LockIcon />,
    size: "large",
  },
  {
    step: "02",
    title: "Upload Scrambled",
    description:
      "Only encrypted chunks are sent to our servers. Completely meaningless without your key.",
    icon: <EyeOffIcon />,
    size: "compact",
  },
  {
    step: "03",
    title: "Decrypt to Watch",
    description:
      "Download, decrypt in your browser, and play. We never see the original.",
    icon: <VideoIcon />,
    size: "large",
  },
];

export const ProcessTimeline = () => {
  return (
    <div className="relative">
      {/* Connecting line - desktop */}
      <div className="hidden lg:block absolute top-12 left-[15%] right-[15%] h-px bg-gradient-to-r from-ochre/20 via-border to-ochre/20" />

      <div className="grid gap-8 lg:grid-cols-3 lg:gap-6">
        {steps.map((step, index) => (
          <ScrollReveal key={index} delay={index * 120} direction="up">
            <div
              className={`relative group ${
                step.size === "large" ? "lg:pt-8" : "lg:pt-0"
              }`}
            >
              {/* Timeline dot - desktop */}
              <div
                className={`hidden lg:flex absolute left-1/2 -translate-x-1/2 w-6 h-6 items-center justify-center border border-ochre/30 bg-background z-10 ${
                  step.size === "large" ? "top-4" : "top-20"
                }`}
              >
                <div className="w-2 h-2 bg-ochre" />
              </div>

              <div
                className={`border border-border/60 bg-background p-6 relative hover-lift transition-all duration-300 ${
                  step.size === "large" ? "lg:p-8" : "lg:p-5"
                }`}
              >
                {/* Top accent line */}
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-ochre/40 to-transparent" />

                <div className="flex items-start justify-between mb-4">
                  <div className="inline-flex h-10 w-10 items-center justify-center border border-ochre/20 bg-ochre/8 text-ochre">
                    {step.icon}
                  </div>
                  <span className="text-micro text-ochre/50 font-semibold">
                    {step.step}
                  </span>
                </div>

                <h3
                  className={`text-foreground mb-2 ${
                    step.size === "large"
                      ? "text-xl font-medium"
                      : "text-base font-semibold"
                  }`}
                >
                  {step.title}
                </h3>
                <p className="text-body text-muted leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
};
