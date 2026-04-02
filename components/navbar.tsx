import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { SignOutButton } from "@/app/dashboard/sign-out-button";

const ShieldIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

interface NavbarProps {
  currentPath?: string;
}

export async function Navbar({ currentPath = "/" }: NavbarProps) {
  const headerStore = await headers();
  const session = await auth.api.getSession({
    headers: headerStore,
  });

  const user = session?.user;
  const isDashboard = currentPath === "/dashboard" || currentPath.startsWith("/dashboard/");
  const isLandingPage = currentPath === "/";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        {/* Logo - always links to home */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center bg-foreground text-background transition-colors group-hover:bg-ochre">
            <ShieldIcon className="h-5 w-5" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-foreground">
            SQUID<span className="text-ochre">VAULT</span>
          </span>
        </Link>

        {/* Right side - context aware */}
        <div className="flex items-center gap-5">
          {user ? (
            // Authenticated: show dashboard link + user profile + sign out
            <div className="flex items-center gap-4">
              {!isDashboard && (
                <Link
                  href="/dashboard"
                  className="inline-flex h-9 items-center justify-center bg-foreground px-5 text-xs font-semibold tracking-wide text-background transition-colors hover:bg-ochre"
                >
                  Dashboard
                </Link>
              )}
              {!isLandingPage && (
                <div className="flex items-center gap-2.5 border border-border bg-stone/50 px-3 py-1.5">
                <div className="flex h-7 w-7 items-center justify-center bg-foreground text-background text-xs font-semibold">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs font-medium text-foreground leading-tight">{user.name}</p>
                  <p className="text-micro text-muted">{user.email}</p>
                </div>
              </div>
              )}
              <SignOutButton />
            </div>
          ) : (
            // Not authenticated: show auth links
            <>
              <Link
                href="/#pricing"
                className="hidden px-4 py-2 text-xs font-medium text-muted transition-colors hover:text-foreground sm:block"
              >
                Pricing
              </Link>
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
      </div>
    </header>
  );
}
