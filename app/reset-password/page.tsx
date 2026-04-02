"use client";

import { useState, useEffect, Suspense } from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const errorParam = searchParams.get("error");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Set error from URL param
  useEffect(() => {
    if (errorParam === "INVALID_TOKEN") {
      setError("This reset link is invalid or has expired. Please request a new one.");
    }
  }, [errorParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    const { error } = await authClient.resetPassword({
      newPassword: password,
      token: token || undefined,
    });

    setLoading(false);

    if (error) {
      setError(error.message || "Failed to reset password");
    } else {
      setSuccess(true);
    }
  };

  // Invalid token state
  if (!token && !success) {
    return (
      <>
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <span className="h-px w-8 bg-error" />
            <span className="text-micro text-error">Invalid link</span>
          </div>
          <h1 className="text-headline text-foreground">Link expired</h1>
          <p className="mt-2 text-body text-muted">
            This password reset link is invalid or has expired.
          </p>
        </div>

        <div className="border border-error/20 bg-error/5 px-3 py-4 text-sm text-error mb-5">
          <div className="flex items-start gap-2">
            <svg
              className="h-4 w-4 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
            <p>Please request a new password reset link.</p>
          </div>
        </div>

        <Link href="/forgot-password" className="brutal-button block w-full py-2.5 text-xs text-center">
          Request new link
        </Link>
      </>
    );
  }

  return (
    <>
      {/* Title */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-2">
          <span className="h-px w-8 bg-ochre" />
          <span className="text-micro text-ochre">Password reset</span>
        </div>
        <h1 className="text-headline text-foreground">
          {success ? "Password updated" : "Create new password"}
        </h1>
        <p className="mt-2 text-body text-muted">
          {success
            ? "Your password has been reset successfully"
            : "Enter your new password below"}
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-5 border border-success/20 bg-success/5 px-3 py-4 text-sm text-success">
          <div className="flex items-start gap-2">
            <svg
              className="h-4 w-4 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="font-medium">Password reset complete</p>
              <p className="text-xs mt-1">
                You can now sign in with your new password.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-5 border border-error/20 bg-error/5 px-3 py-2.5 text-xs text-error">
          <div className="flex items-center gap-2">
            <svg
              className="h-3.5 w-3.5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Form */}
      {!success ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-xs font-medium text-foreground"
            >
              New password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="block w-full"
              placeholder="Enter new password"
            />
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1 block text-xs font-medium text-foreground"
            >
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              className="block w-full"
              placeholder="Confirm new password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="brutal-button mt-3 w-full py-2.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="h-3.5 w-3.5 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Resetting...
              </span>
            ) : (
              "Reset password"
            )}
          </button>
        </form>
      ) : (
        <Link
          href="/sign-in"
          className="brutal-button block w-full py-2.5 text-xs text-center"
        >
          Sign in
        </Link>
      )}
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background relative">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `linear-gradient(var(--foreground) 0.5px, transparent 0.5px), linear-gradient(90deg, var(--foreground) 0.5px, transparent 0.5px)`,
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      {/* Header */}
      <header className="w-full border-b border-border px-6 py-3 relative">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center bg-foreground transition-colors group-hover:bg-ochre">
              <svg
                className="h-5 w-5 text-background"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-tight">
              SQUID<span className="text-ochre">VAULT</span>
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center px-6 py-12 relative">
        <div className="w-full max-w-sm animate-fade-in-scale">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-12">
                <svg
                  className="h-6 w-6 animate-spin text-ochre"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
