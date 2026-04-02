import { auth } from "@/lib/auth";
import { getUserVideos } from "@/lib/data";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from "./sign-out-button";
import { VideoUpload } from "./video-upload";
import { VideoGrid } from "./video-grid";
import { ScrollReveal, StaggerContainer } from "@/components/scroll-reveal";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const user = session.user;
  const videos = await getUserVideos(user.id);

  // Calculate video stats
  const totalSize = videos.reduce((sum, v) => sum + v.originalSize, 0);
  const totalViews = videos.reduce((sum, v) => sum + v.viewCount, 0);

  const statsDisplay = [
    {
      label: "Total Videos",
      value: videos.length.toString(),
      change: videos.length > 0 ? "In your vault" : "Upload your first",
      color: "bg-ochre",
    },
    {
      label: "Storage Used",
      value: formatBytes(totalSize),
      change: "Encrypted",
      color: "bg-teal",
    },
    {
      label: "Total Views",
      value: totalViews.toString(),
      change: "Across all videos",
      color: "bg-coral",
    },
    {
      label: "Security Status",
      value: "Active",
      change: "Zero-Knowledge",
      color: "bg-sage",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ochre text-white transition-colors group-hover:bg-ochre-dark">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-lg font-semibold tracking-tight">SQUID<span className="text-ochre">VAULT</span></span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 rounded-lg border border-border bg-stone/50 px-3 py-1.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-ochre text-sm font-semibold text-white">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-foreground">{user.name}</p>
                <p className="text-xs text-muted">{user.email}</p>
              </div>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-7xl">
          {/* Welcome Section */}
          <ScrollReveal>
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="h-px w-8 bg-ochre" />
                <span className="text-caption text-ochre">My Vault</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-headline text-foreground">
                    Welcome back, {user.name?.split(" ")[0]}
                  </h1>
                  <p className="mt-2 text-body text-muted">
                    Your videos are encrypted and safe. Only you hold the keys.
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-success/10 px-4 py-2 border border-success/20">
                  <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  <span className="text-sm font-medium text-success">Zero-Knowledge Active</span>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Stats Grid */}
          <StaggerContainer className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" staggerDelay={80}>
            {statsDisplay.map((stat, index) => (
              <div key={index} className="brutal-card brutal-card-hover p-5 reveal">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-caption text-muted">{stat.label}</p>
                  <div className={`h-2 w-2 rounded-full ${stat.color}`} />
                </div>
                <p className="text-3xl font-semibold tracking-tight text-foreground truncate">
                  {stat.value}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-success/10 text-success">
                    {stat.change}
                  </span>
                </div>
              </div>
            ))}
          </StaggerContainer>

          {/* Main Content */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Video Grid */}
            <div className="lg:col-span-2">
              <ScrollReveal>
                <div className="brutal-card overflow-hidden">
                  <div className="border-b border-border px-5 py-4 flex items-center justify-between bg-stone/30">
                    <div className="flex items-center gap-3">
                      <h2 className="text-subhead text-foreground">My Videos</h2>
                      <span className="rounded-full bg-ochre/10 px-2 py-0.5 text-xs font-medium text-ochre">
                        {videos.length}
                      </span>
                    </div>
                  </div>
                  <VideoGrid videos={videos} />
                </div>
              </ScrollReveal>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <ScrollReveal delay={100}>
                <VideoUpload />
              </ScrollReveal>

              {/* Security Info Card */}
              <ScrollReveal delay={200}>
                <div className="brutal-card p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="h-px w-4 bg-ochre" />
                    <h3 className="text-caption text-foreground">Security Info</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 text-success">
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">AES-256-GCM Encryption</p>
                        <p className="text-xs text-muted">Military-grade encryption</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 text-success">
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Client-Side Only</p>
                        <p className="text-xs text-muted">Password never leaves device</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 text-success">
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Zero-Knowledge</p>
                        <p className="text-xs text-muted">We cannot decrypt your videos</p>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
