"use client";

import Link from "next/link";

interface CtaButtonsProps {
  session: boolean;
}

export const CtaButtons = ({ session }: CtaButtonsProps) => {
  return (
    <>
      <div className="mt-10 flex flex-wrap items-center gap-4">
        <Link
          href={session ? "/dashboard" : "/sign-up"}
          className="group inline-flex h-12 items-center justify-center gap-2.5 bg-foreground px-7 text-xs font-semibold tracking-wide text-background transition-all hover:bg-ochre"
        >
          {session ? "Go to Vault" : "Create Your Vault"}
          <svg
            className="h-3.5 w-3.5 transition-transform duration-300 ease-out-quart group-hover:translate-x-1 group-hover:scale-110"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
            />
          </svg>
        </Link>
        <Link
          href="#security"
          className="inline-flex h-12 items-center justify-center gap-2.5 border border-border bg-background px-7 text-xs font-semibold tracking-wide text-foreground transition-all hover:border-ochre hover:bg-stone"
        >
          How It Works
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
        <Link
          href={session ? "/dashboard" : "/sign-up"}
          className="group inline-flex h-12 items-center justify-center gap-2.5 bg-ochre px-8 text-xs font-semibold tracking-wide text-background transition-all duration-300 hover:bg-ochre-dark hover:shadow-lg hover:shadow-ochre/10"
        >
          <span>{session ? "Open Your Vault" : "Create Free Vault"}</span>
          <svg
            className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover:translate-x-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
            />
          </svg>
        </Link>

        <Link
          href={session ? "/dashboard" : "/sign-in"}
          className="group inline-flex h-12 items-center justify-center gap-2.5 border border-border bg-background/50 px-8 text-xs font-semibold tracking-wide text-foreground transition-all duration-300 hover:border-ochre/30 hover:bg-background"
        >
          <span>{session ? "Open Your Vault" : "Sign In"}</span>
          <svg
            className="h-3.5 w-3.5 text-muted transition-all duration-300 group-hover:text-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
            />
          </svg>
        </Link>
      </div>
    </>
  );
};
