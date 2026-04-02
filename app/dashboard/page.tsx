import { auth } from "@/lib/auth";
import { getUserVideos, getUserPlanLimits } from "@/lib/data";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { VideoUpload } from "./video-upload";
import { VideoGrid } from "./video-grid";
import { ScrollReveal, StaggerContainer } from "@/components/scroll-reveal";
import { Navbar } from "@/components/navbar";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const user = session.user;
  const videos = await getUserVideos(user.id);
  const planLimits = await getUserPlanLimits(user.id);

  const totalSize = videos.reduce((sum, v) => sum + v.originalSize, 0);
  const totalViews = videos.reduce((sum, v) => sum + v.viewCount, 0);

  // Calculate video stat detail based on plan
  const videoDetail = planLimits.remaining !== null
    ? `${planLimits.remaining} remaining`
    : (videos.length > 0 ? "Unlimited" : "Empty");

  const statsDisplay = [
    {
      label: "Videos",
      value: videos.length.toString(),
      detail: videoDetail,
      icon: (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
        </svg>
      ),
    },
    {
      label: "Storage",
      value: formatBytes(totalSize),
      detail: "Encrypted",
      icon: (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
        </svg>
      ),
    },
    {
      label: "Views",
      value: totalViews.toString(),
      detail: "Total plays",
      icon: (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      label: "Security",
      value: "Active",
      detail: "Zero-Knowledge",
      icon: (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Navbar currentPath="/dashboard" />

      {/* Main Content */}
      <main className="flex-1 px-6 py-8">
        <div className="mx-auto max-w-7xl">
          {/* Welcome Section */}
          <ScrollReveal>
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="h-px w-10 bg-ochre" />
                <span className="text-micro text-ochre">My Vault</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-headline text-foreground">
                      Welcome back, {user.name?.split(" ")[0]}
                    </h1>
                    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium uppercase tracking-wide ${
                      user.plan === "practice"
                        ? "bg-ochre text-background"
                        : user.plan === "professional"
                          ? "bg-ochre/20 text-ochre border border-ochre/30"
                          : "bg-stone text-muted border border-border"
                    }`}>
                      {user.plan}
                    </span>
                  </div>
                  <p className="text-body text-muted">
                    Your videos are encrypted and safe. Only you hold the keys.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 border border-success/20 bg-success/8 px-3 py-1.5">
                  <span className="h-1 w-1 rounded-full bg-success animate-[pulse-dot_2s_ease-in-out_infinite]" />
                  <span className="text-micro text-success">Zero-Knowledge Active</span>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Stats Grid - Technical Status Panel */}
          <StaggerContainer className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" staggerDelay={80}>
            {statsDisplay.map((stat, index) => (
              <div key={index} className="reveal border border-border bg-background p-4 hover-lift relative group">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-ochre/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center justify-between mb-3">
                  <span className="text-micro text-muted">{stat.label}</span>
                  <span className="text-muted">{stat.icon}</span>
                </div>
                <p className="text-xl font-semibold tracking-tight text-foreground">
                  {stat.value}
                </p>
                <p className="text-micro text-warm-gray mt-1">{stat.detail}</p>
              </div>
            ))}
          </StaggerContainer>

          {/* Main Content */}
          <div className="grid gap-5 lg:grid-cols-3">
            {/* Video Grid */}
            <div className="lg:col-span-2">
              <ScrollReveal>
                <div className="border border-border bg-background overflow-hidden">
                  <div className="px-5 py-3.5 flex items-center justify-between border-b border-border bg-stone/20">
                    <div className="flex items-center gap-3">
                      <h2 className="text-subhead text-foreground text-sm">My Videos</h2>
                      <span className="bg-ochre/10 px-2 py-0.5 text-micro text-ochre font-semibold">
                        {videos.length}
                      </span>
                    </div>
                  </div>
                  <VideoGrid videos={videos} />
                </div>
              </ScrollReveal>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-5">
              <ScrollReveal delay={100}>
                <VideoUpload 
                  currentVideos={planLimits.currentVideos} 
                  videoLimit={planLimits.videoLimit} 
                  remaining={planLimits.remaining}
                  tier={planLimits.tier}
                />
              </ScrollReveal>

              {/* Security Info */}
              <ScrollReveal delay={200}>
                <div className="border border-border bg-background p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="h-px w-3 bg-ochre" />
                    <h3 className="text-micro text-foreground">Security Protocol</h3>
                  </div>
                  <div className="space-y-3.5">
                    {[
                      { label: "AES-256-GCM", detail: "Military-grade encryption" },
                      { label: "Client-Side Only", detail: "Password never leaves device" },
                      { label: "Zero-Knowledge", detail: "We cannot decrypt your videos" },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <div className="mt-1 text-success flex-shrink-0">
                          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-foreground">{item.label}</p>
                          <p className="text-micro text-muted">{item.detail}</p>
                        </div>
                      </div>
                    ))}
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
