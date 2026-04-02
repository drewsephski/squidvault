"use client";

import { useState } from "react";
import { ScrollReveal, StaggerContainer } from "@/components/scroll-reveal";
import { useSession } from "@/lib/auth-client";

interface PricingTier {
  id: string;
  name: string;
  price: number;
  priceLabel: string;
  description: string;
  storage: string;
  videoLimit: string;
  features: string[];
  cta: string;
  priceId: string | null;
  popular?: boolean;
}

const tiers: PricingTier[] = [
  {
    id: "starter",
    name: "Starter",
    price: 0,
    priceLabel: "Free",
    description: "Try zero-knowledge encryption",
    storage: "2 GB",
    videoLimit: "Up to 3 videos",
    features: [
      "AES-256 encryption",
      "Secure sharing links",
      "7-day link expiry",
      "Web player",
    ],
    cta: "Create Free Vault",
    priceId: null,
  },
  {
    id: "professional",
    name: "Professional",
    price: 12,
    priceLabel: "$12",
    description: "For therapists & supervisors",
    storage: "100 GB",
    videoLimit: "Unlimited videos",
    features: [
      "Everything in Starter",
      "View receipts & audit logs",
      "Custom link expiry",
      "Download original files",
      "Priority support",
    ],
    cta: "Get Professional",
    priceId: "price_1THnbPIv4Ez9jUN2AhoeSnhx", // $12/month Professional
    popular: true,
  },
  {
    id: "practice",
    name: "Practice",
    price: 39,
    priceLabel: "$39",
    description: "For group practices",
    storage: "500 GB",
    videoLimit: "Unlimited videos",
    features: [
      "Everything in Professional",
      "Team sharing (10 members)",
      "Admin controls",
      "View analytics",
      "API access",
      "Priority support",
    ],
    cta: "Get Practice",
    priceId: "price_1THnbPIv4Ez9jUN2V2Vp8fUP", // $39/month Practice
  },
];

const CheckIcon = () => (
  <svg className="h-4 w-4 text-success flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

export const PricingSection = () => {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleCheckout = async (tier: PricingTier) => {
    if (!tier.priceId) {
      // Free tier: go to dashboard if authenticated, otherwise sign up
      window.location.href = session ? "/dashboard" : "/sign-up";
      return;
    }

    if (!session) {
      window.location.href = `/sign-in?redirectTo=${encodeURIComponent("/#pricing")}`;
      return;
    }

    setIsLoading(tier.id);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: tier.priceId, tierId: tier.id }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("Checkout error:", data.error);
        alert("Failed to start checkout. Please try again.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to start checkout. Please try again.");
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <section id="pricing" className="border-t border-border px-6 py-24 lg:py-32 bg-background">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <ScrollReveal>
          <div className="mb-16 text-center">
            <div className="mb-5 flex items-center justify-center gap-3">
              <span className="h-px w-12 bg-ochre/40" />
              <span className="text-micro text-ochre">Pricing</span>
              <span className="h-px w-12 bg-ochre/40" />
            </div>
            <h2 className="text-headline text-foreground mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-body-lg text-muted max-w-lg mx-auto leading-relaxed">
              Pay once, keep forever. All tiers include full encryption.
            </p>
          </div>
        </ScrollReveal>

        {/* Pricing Cards */}
        <StaggerContainer className="grid gap-6 lg:grid-cols-3" staggerDelay={100}>
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative border ${tier.popular ? "border-ochre/50" : "border-border"} bg-background overflow-hidden`}
            >
              {/* Popular badge */}
              {tier.popular && (
                <div className="absolute top-0 right-0">
                  <div className="bg-ochre text-background text-micro px-3 py-1">
                    Popular
                  </div>
                </div>
              )}

              {/* Left accent */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1"
                style={{
                  background: tier.popular
                    ? "var(--ochre)"
                    : "linear-gradient(to bottom, var(--ochre), transparent)",
                }}
              />

              <div className="p-6 pl-7">
                {/* Tier header */}
                <div className="mb-6">
                  <h3 className="text-subhead text-foreground mb-1">{tier.name}</h3>
                  <p className="text-micro text-muted">{tier.description}</p>
                </div>

                {/* Price */}
                <div className="mb-6 pb-6 border-b border-border">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-display font-semibold tracking-tight text-foreground">
                      {tier.price === 0 ? "Free" : `$${tier.price}`}
                    </span>
                    {tier.price > 0 && (
                      <span className="text-micro text-muted">/month</span>
                    )}
                  </div>
                  {tier.price > 0 && (
                    <p className="text-micro text-success mt-1">
                      Cancel anytime
                    </p>
                  )}
                </div>

                {/* Storage highlight */}
                <div className="mb-6 p-3 bg-stone/30 border border-border/50">
                  <div className="flex items-center justify-between">
                    <span className="text-micro text-muted">Storage</span>
                    <span className="text-body font-medium text-foreground">{tier.storage}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-micro text-muted">Videos</span>
                    <span className="text-body font-medium text-foreground">{tier.videoLimit}</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckIcon />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={() => handleCheckout(tier)}
                  disabled={isLoading === tier.id || session?.user?.plan === tier.id}
                  className={`block w-full text-center py-3 text-xs font-semibold tracking-wide transition-all ${
                    tier.popular
                      ? "bg-ochre text-background hover:bg-ochre-dark disabled:opacity-70"
                      : "border border-border text-foreground hover:border-ochre hover:bg-stone/30 disabled:opacity-70"
                  }`}
                >
                  {(() => {
                    const userPlan = session?.user?.plan;
                    const isCurrentPlan = userPlan === tier.id;
                    const isProf = userPlan === "professional";
                    const isPracticeTier = tier.id === "practice";
                    
                    if (isLoading === tier.id) return "Loading...";
                    if (isCurrentPlan) return "Current Plan";
                    if (isProf && isPracticeTier) return "Upgrade";
                    return tier.cta;
                  })()}
                </button>
              </div>
            </div>
          ))}
        </StaggerContainer>

        {/* Trust note */}
        <ScrollReveal delay={300}>
          <div className="mt-12 text-center">
            <p className="text-micro text-muted">
              All plans include zero-knowledge encryption. We literally cannot access your videos.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
