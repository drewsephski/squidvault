import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Navbar } from "@/components/navbar";
import { EncryptionDemo } from "./encryption-demo";
import { ProcessTimeline } from "./process-timeline";
import { PricingSection } from "./pricing-section";

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const CrosshairIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
  </svg>
);

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Navbar currentPath="/" />

      {/* Hero - Mechanical Precision */}
      <section className="relative overflow-hidden px-6 pt-20 pb-28 lg:pt-32 lg:pb-40">
        {/* Fine grid pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <div className="h-full w-full" style={{
            backgroundImage: `linear-gradient(var(--foreground) 0.5px, transparent 0.5px), linear-gradient(90deg, var(--foreground) 0.5px, transparent 0.5px)`,
            backgroundSize: '32px 32px'
          }} />
        </div>

        {/* Crosshair decorations */}
        <div className="absolute top-24 left-[8%] opacity-[0.08] animate-[crosshair-pulse_4s_ease-in-out_infinite]">
          <CrosshairIcon />
        </div>
        <div className="absolute bottom-32 right-[12%] opacity-[0.06] animate-[crosshair-pulse_4s_ease-in-out_infinite_1s]">
          <CrosshairIcon />
        </div>

        <div className="relative mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-8 items-center">
            <div className="lg:col-span-7">
              <ScrollReveal direction="left">
                <div className="mb-6 flex items-center gap-3">
                  <span className="h-px w-10 bg-ochre" />
                  <span className="text-micro text-ochre">100% Zero-Knowledge</span>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={100}>
                <h1 className="text-display text-foreground leading-[0.88]">
                  Your videos.
                  <br />
                  <span className="text-ochre">Encrypted.</span>{" "}
                  <span className="italic text-foreground">Safe.</span>
                </h1>
              </ScrollReveal>

              <ScrollReveal delay={200}>
                <p className="mt-6 max-w-md text-body-lg text-muted leading-relaxed">
                  The only video vault where encryption happens in your browser.
                  We never see your videos. We never see your keys.
                  100% zero-knowledge privacy.
                </p>
              </ScrollReveal>

              <ScrollReveal delay={300}>
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
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>
                  <Link
                    href="#security"
                    className="inline-flex h-12 items-center justify-center gap-2.5 border border-border bg-background px-7 text-xs font-semibold tracking-wide text-foreground transition-all hover:border-ochre hover:bg-stone"
                  >
                    How It Works
                  </Link>
                </div>
              </ScrollReveal>
            </div>

            <div className="lg:col-span-5">
              <ScrollReveal direction="scale" delay={200}>
                <EncryptionDemo />
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* Security Process */}
      <section id="security" className="border-t border-border px-6 py-24 lg:py-36 bg-gradient-warm">
        <div className="mx-auto max-w-6xl">
          <ScrollReveal>
            <div className="mb-16 text-center">
              <div className="mb-5 flex items-center justify-center gap-3">
                <span className="h-px w-12 bg-ochre/40" />
                <span className="text-micro text-ochre">The Process</span>
                <span className="h-px w-12 bg-ochre/40" />
              </div>
              <h2 className="text-headline text-foreground mb-4">
                Encryption that actually works
              </h2>
              <p className="text-body-lg text-muted max-w-lg mx-auto leading-relaxed">
                Most &quot;secure&quot; platforms can still access your content. We literally cannot.
              </p>
            </div>
          </ScrollReveal>

          <ProcessTimeline />
        </div>
      </section>

      {/* Trust Bridge - Blends warm gradient to stone */}
      <section className="border-t border-border relative overflow-hidden">
        {/* Gradient background - smooth blend from Security Process (ends at sand) to CTA (background) */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--sand)] via-[var(--stone)] to-[var(--background)] pointer-events-none" />
        
        {/* Darker bottom fade for stronger contrast */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[var(--background)] to-transparent pointer-events-none" />
        
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
          <div className="h-full w-full" style={{
            backgroundImage: `linear-gradient(var(--foreground) 0.5px, transparent 0.5px), linear-gradient(90deg, var(--foreground) 0.5px, transparent 0.5px)`,
            backgroundSize: '48px 48px'
          }} />
        </div>
        
        <div className="relative px-6 py-20 lg:py-28">
          <div className="mx-auto max-w-4xl">
            <ScrollReveal>
              {/* Centered quote/testimonial style */}
              <div className="text-center">
                {/* Decorative quote marks */}
                <div className="mb-8 flex justify-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 border border-ochre/20 bg-ochre/5">
                    <svg className="h-5 w-5 text-ochre/60" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                  </div>
                </div>
                
                <blockquote className="font-display text-2xl lg:text-3xl text-foreground leading-tight tracking-tight mb-8">
                  Your encryption key never leaves your device.
                  <br />
                  <span className="text-muted">We literally cannot access your videos.</span>
                </blockquote>
                
                {/* Trust stats row */}
                <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-12">
                  <div className="text-center">
                    <div className="text-2xl font-display font-semibold text-ochre mb-1">AES-256</div>
                    <div className="text-micro text-muted">Military-grade encryption</div>
                  </div>
                  <div className="hidden sm:block w-px h-8 bg-border" />
                  <div className="text-center">
                    <div className="text-2xl font-display font-semibold text-ochre mb-1">Zero</div>
                    <div className="text-micro text-muted">Knowledge architecture</div>
                  </div>
                  <div className="hidden sm:block w-px h-8 bg-border" />
                  <div className="text-center">
                    <div className="text-2xl font-display font-semibold text-ochre mb-1">100%</div>
                    <div className="text-micro text-muted">Open source client</div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
        
        {/* Bottom fade to stone */}
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* CTA Section */}
      <section className="border-t border-border px-6 py-24 lg:py-32 bg-stone/50 relative overflow-hidden">
        {/* Subtle vignette overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background/80 pointer-events-none" />
        
        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-px h-24 bg-gradient-to-b from-ochre/30 to-transparent" />
        <div className="absolute top-0 left-0 h-px w-24 bg-gradient-to-r from-ochre/30 to-transparent" />
        <div className="absolute top-0 right-0 w-px h-24 bg-gradient-to-b from-ochre/20 to-transparent" />
        <div className="absolute top-0 right-0 h-px w-24 bg-gradient-to-l from-ochre/20 to-transparent" />
        <div className="absolute bottom-0 left-0 w-px h-24 bg-gradient-to-t from-ochre/20 to-transparent" />
        <div className="absolute bottom-0 left-0 h-px w-24 bg-gradient-to-r from-ochre/20 to-transparent" />
        <div className="absolute bottom-0 right-0 w-px h-24 bg-gradient-to-t from-ochre/30 to-transparent" />
        <div className="absolute bottom-0 right-0 h-px w-24 bg-gradient-to-l from-ochre/30 to-transparent" />
        
        {/* Radial glow behind content */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] opacity-[0.03] pointer-events-none">
          <div className="w-full h-full rounded-full bg-ochre blur-3xl" />
        </div>
        
        <div className="relative mx-auto max-w-3xl text-center">
          <ScrollReveal>
            <div className="mb-6 flex items-center justify-center gap-4">
              <span className="h-px w-16 bg-gradient-to-r from-transparent via-ochre/30 to-transparent" />
              <span className="text-micro text-ochre/60 tracking-widest">SECURE YOUR VIDEOS</span>
              <span className="h-px w-16 bg-gradient-to-r from-transparent via-ochre/30 to-transparent" />
            </div>
            
            <h2 className="font-display text-headline text-foreground mb-5 tracking-tight">
              Ready for true video privacy?
            </h2>
            
            <p className="text-body-lg text-muted mb-12 max-w-lg mx-auto leading-relaxed">
              Create your encrypted vault in seconds. Your videos stay yours—always.
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4">
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
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              
              <Link
                href="/sign-in"
                className="group inline-flex h-12 items-center justify-center gap-2.5 border border-border bg-background/50 px-8 text-xs font-semibold tracking-wide text-foreground transition-all duration-300 hover:border-ochre/30 hover:bg-background"
              >
                <span>Sign In</span>
                <svg 
                  className="h-3.5 w-3.5 text-muted transition-all duration-300 group-hover:text-foreground" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </Link>
            </div>
            
            {/* Trust indicators */}
            <div className="mt-12 flex items-center justify-center gap-6 text-micro text-muted">
              <span className="flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                No credit card
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                End-to-end encrypted
              </span>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-10 bg-background">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center bg-foreground text-background">
                <ShieldIcon />
              </div>
              <span className="text-xs font-semibold tracking-tight">SQUID<span className="text-ochre">VAULT</span></span>
            </div>
            <p className="text-xs text-muted tracking-wide">100% private. Zero-knowledge. End-to-end encrypted.</p>
            <div className="text-micro text-warm-gray">2026 SquidVault</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
