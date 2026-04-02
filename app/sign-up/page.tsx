"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await authClient.signUp.email({
      name,
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message || "Failed to sign up");
    } else {
      window.location.href = "/dashboard";
    }
  };

  const signInWithGoogle = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
  };

  const signInWithGitHub = async () => {
    await authClient.signIn.social({
      provider: "github",
      callbackURL: "/dashboard",
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background relative">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <div className="h-full w-full" style={{
          backgroundImage: `linear-gradient(var(--foreground) 0.5px, transparent 0.5px), linear-gradient(90deg, var(--foreground) 0.5px, transparent 0.5px)`,
          backgroundSize: '24px 24px'
        }} />
      </div>

      {/* Header */}
      <header className="w-full border-b border-border px-6 py-3 relative">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center bg-foreground transition-colors group-hover:bg-ochre">
              <svg className="h-5 w-5 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-tight">SQUID<span className="text-ochre">VAULT</span></span>
          </Link>
          <p className="text-xs text-muted">
            Have an account?{" "}
            <Link href="/sign-in" className="font-medium text-foreground transition-colors hover:text-ochre">
              Sign in
            </Link>
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center px-6 py-12 relative">
        <div className="w-full max-w-sm animate-fade-in-scale">
          {/* Title */}
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-px w-8 bg-ochre" />
              <span className="text-micro text-ochre">Get started</span>
            </div>
            <h1 className="text-headline text-foreground">Create your vault</h1>
            <p className="mt-2 text-body text-muted">Start with a free account</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 border border-error/20 bg-error/5 px-3 py-2.5 text-xs text-error">
              <div className="flex items-center gap-2">
                <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Social Sign Up */}
          <div className="grid grid-cols-2 gap-2.5">
            <button onClick={signInWithGoogle} className="inline-flex h-11 items-center justify-center gap-2 border border-border bg-background px-3 text-xs font-medium text-foreground transition-all hover:border-ochre hover:bg-stone">
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
            <button onClick={signInWithGitHub} className="inline-flex h-11 items-center justify-center gap-2 border border-border bg-background px-3 text-xs font-medium text-foreground transition-all hover:border-ochre hover:bg-stone">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-3 text-micro text-muted">Or continue with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label htmlFor="name" className="mb-1 block text-xs font-medium text-foreground">Full name</label>
              <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="block w-full" placeholder="John Doe" />
            </div>
            <div>
              <label htmlFor="email" className="mb-1 block text-xs font-medium text-foreground">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="block w-full" placeholder="name@company.com" />
            </div>
            <div>
              <label htmlFor="password" className="mb-1 block text-xs font-medium text-foreground">Password</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="block w-full" placeholder="Create a strong password" />
              <p className="mt-1 text-micro text-muted">Minimum 8 characters</p>
            </div>
            <button type="submit" disabled={loading} className="brutal-button-accent mt-3 w-full py-2.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating account...
                </span>
              ) : "Create account"}
            </button>
          </form>

          {/* Terms */}
          <p className="mt-5 text-center text-micro text-muted">
            By creating an account, you agree to our{" "}
            <Link href="#" className="font-medium text-foreground transition-colors hover:text-ochre">Terms</Link>
            {" "}and{" "}
            <Link href="#" className="font-medium text-foreground transition-colors hover:text-ochre">Privacy</Link>
          </p>

          <p className="mt-4 text-center text-xs text-muted">
            Have an account?{" "}
            <Link href="/sign-in" className="font-semibold text-foreground transition-colors hover:text-ochre">Sign in</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
