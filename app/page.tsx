import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ScrollReveal, StaggerContainer } from "@/components/scroll-reveal";

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const VideoIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ochre text-white transition-colors group-hover:bg-ochre-dark">
              <ShieldIcon />
            </div>
            <span className="text-lg font-semibold tracking-tight">SQUID<span className="text-ochre">VAULT</span></span>
          </Link>

          <div className="flex items-center gap-3">
            {session ? (
              <Link
                href="/dashboard"
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-ochre"
              >
                My Vault
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="hidden px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground sm:block"
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-ochre"
                >
                  Create Vault
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden px-6 pt-20 pb-28 lg:pt-28 lg:pb-36 bg-gradient-subtle">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />

        <div className="relative mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-8 items-center">
            <div className="lg:col-span-7">
              <ScrollReveal direction="left">
                <div className="mb-6 flex items-center gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full bg-ochre/10 px-3 py-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-ochre animate-pulse" />
                    <span className="text-caption text-ochre">100% Private</span>
                  </span>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={100}>
                <h1 className="text-display text-foreground">
                  Your videos.{" "}
                  <span className="text-ochre">Encrypted.</span>{" "}
                  <span className="text-foreground">Safe.</span>
                </h1>
              </ScrollReveal>

              <ScrollReveal delay={200}>
                <p className="mt-6 max-w-lg text-body-lg text-muted">
                  The only video vault where encryption happens in your browser.
                  We never see your videos. We never see your encryption keys.
                  100% zero-knowledge privacy.
                </p>
              </ScrollReveal>

              <ScrollReveal delay={300}>
                <div className="mt-10 flex flex-wrap items-center gap-4">
                  <Link
                    href="/sign-up"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-foreground px-8 text-base font-medium text-background transition-all hover:bg-ochre"
                  >
                    Create Your Vault
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                    </svg>
                  </Link>
                  <Link
                    href="#security"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-border px-8 text-base font-medium text-foreground transition-all hover:border-ochre hover:bg-stone"
                  >
                    How It Works
                  </Link>
                </div>
              </ScrollReveal>
            </div>

            <div className="lg:col-span-5">
              <ScrollReveal direction="scale" delay={200}>
                <div className="brutal-card p-6 lg:p-8 border-ochre/20">
                  <div className="mb-6 flex items-center justify-between">
                    <span className="text-caption text-muted">Security Status</span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2 py-1">
                      <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                      <span className="text-xs font-medium text-success">Fort Knox Level</span>
                    </span>
                  </div>
                  <div className="space-y-4">
                    {[
                      { label: "Encryption", value: "AES-256-GCM", subtext: "Military grade" },
                      { label: "Key Storage", value: "Zero Knowledge", subtext: "Never leaves browser" },
                      { label: "Server Access", value: "Encrypted Only", subtext: "Server sees nothing" },
                    ].map((stat, idx) => (
                      <div key={idx} className="group border-b border-border pb-3 last:border-0 last:pb-0">
                        <div className="flex items-baseline justify-between">
                          <span className="text-sm text-muted">{stat.label}</span>
                          <span className="text-xs text-warm-gray">{stat.subtext}</span>
                        </div>
                        <div className="mt-1 flex items-baseline gap-3">
                          <span className="text-lg font-semibold tracking-tight text-foreground">{stat.value}</span>
                          <span className="inline-flex h-2 w-2 rounded-full bg-success" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      <section id="security" className="border-t border-border px-6 py-24 lg:py-32 bg-gradient-warm">
        <div className="mx-auto max-w-6xl">
          <ScrollReveal>
            <div className="mb-16 text-center">
              <div className="mb-4 flex items-center justify-center gap-3">
                <span className="h-px w-8 bg-ochre" />
                <span className="text-caption text-ochre">How It Works</span>
                <span className="h-px w-8 bg-ochre" />
              </div>
              <h2 className="text-headline text-foreground mb-4">
                Encryption that actually works
              </h2>
              <p className="text-body-lg text-muted max-w-2xl mx-auto">
                Most &quot;secure&quot; video platforms can still access your content. We literally cannot.
              </p>
            </div>
          </ScrollReveal>

          <StaggerContainer className="grid gap-8 md:grid-cols-3" staggerDelay={100}>
            {[
              {
                step: "01",
                title: "Encrypt in Browser",
                description: "Your video is encrypted using AES-256-GCM before leaving your device.",
                icon: <LockIcon />,
              },
              {
                step: "02",
                title: "Upload Scrambled",
                description: "Only encrypted chunks are sent to our servers. Completely meaningless without your key.",
                icon: <EyeOffIcon />,
              },
              {
                step: "03",
                title: "Decrypt to Watch",
                description: "Download, decrypt in your browser, and play. We never see the original.",
                icon: <VideoIcon />,
              },
            ].map((step, index) => (
              <div key={index} className="brutal-card p-6 text-center reveal hover-lift">
                <div className={`mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-ochre text-white`}>
                  {step.icon}
                </div>
                <div className="text-sm font-display font-bold text-ochre mb-2">Step {step.step}</div>
                <h3 className="text-subhead text-foreground mb-2">{step.title}</h3>
                <p className="text-body text-muted">{step.description}</p>
              </div>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <section className="border-t border-border px-6 py-24 lg:py-32 bg-foreground text-background">
        <div className="mx-auto max-w-4xl text-center">
          <ScrollReveal>
            <h2 className="text-headline mb-6">Ready for true video privacy?</h2>
            <p className="text-body-lg text-background/70 mb-10 max-w-2xl mx-auto">
              Create your private vault in seconds. No credit card required.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/sign-up"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-ochre px-8 text-base font-medium text-white transition-all hover:bg-ochre-dark"
              >
                Create Free Vault
              </Link>
              <Link
                href="/sign-in"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-background/30 bg-transparent px-8 text-base font-medium text-background transition-all hover:bg-background/10"
              >
                Sign In
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <footer className="border-t border-border px-6 py-12 bg-background">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ochre text-white">
                <ShieldIcon />
              </div>
              <span className="text-lg font-semibold tracking-tight">SQUID<span className="text-ochre">VAULT</span></span>
            </div>
            <p className="text-sm text-muted">100% private. Zero-knowledge. End-to-end encrypted.</p>
            <div className="text-sm text-muted">2026 SquidVault</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
