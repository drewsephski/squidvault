"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right" | "scale" | "fade";
  duration?: "fast" | "normal" | "slow";
}

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
  duration = "normal",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add("active");
            }, delay);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    const element = ref.current;
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [delay]);

  const getAnimationClass = () => {
    switch (direction) {
      case "up": return "reveal";
      case "left": return "reveal-left";
      case "right": return "reveal-right";
      case "scale": return "reveal-scale";
      case "fade": return "reveal-fade";
      default: return "reveal";
    }
  };

  const getDurationClass = () => {
    switch (duration) {
      case "fast": return "duration-fast";
      case "slow": return "duration-slow";
      default: return "duration-normal";
    }
  };

  return (
    <div ref={ref} className={`${getAnimationClass()} ${getDurationClass()} ${className}`}>
      {children}
    </div>
  );
}

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  direction?: "up" | "scale";
}

export function StaggerContainer({
  children,
  className = "",
  staggerDelay = 100,
  direction = "up",
}: StaggerContainerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const children = entry.target.children;
            Array.from(children).forEach((child, index) => {
              setTimeout(() => {
                (child as HTMLElement).classList.add("active");
              }, index * staggerDelay);
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    const element = ref.current;
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [staggerDelay]);

  const animationClass = direction === "up" ? "reveal-stagger" : "reveal-stagger-scale";

  return (
    <div ref={ref} className={`${animationClass} ${className}`}>
      {children}
    </div>
  );
}
