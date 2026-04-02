"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth-client";

const ShieldIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

interface SimpleNavbarProps {
  showAuthLinks?: boolean;
}

export function SimpleNavbar({ showAuthLinks = true }: SimpleNavbarProps) {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center bg-foreground text-background transition-colors group-hover:bg-ochre">
            <ShieldIcon className="h-5 w-5" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-foreground">
            SQUID<span className="text-ochre">VAULT</span>
          </span>
        </Link>

        {/* Right side */}
        {showAuthLinks && (
          <div className="flex items-center gap-5">
            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex h-9 items-center justify-center bg-foreground px-5 text-xs font-semibold tracking-wide text-background transition-colors hover:bg-ochre"
              >
                My Vault
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="hidden px-4 py-2 text-xs font-medium text-muted transition-colors hover:text-foreground sm:block"
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  className="inline-flex h-9 items-center justify-center bg-foreground px-5 text-xs font-semibold tracking-wide text-background transition-colors hover:bg-ochre"
                >
                  Create Vault
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
