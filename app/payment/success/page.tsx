import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { createPurchase, getPurchaseByStripeSession, updatePurchaseStatus } from "@/lib/data";
import Stripe from "stripe";
import { STRIPE_SECRET_KEY } from "@/lib/env";
import { logger } from "@/lib/logger";

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2026-03-25.dahlia",
});

async function PaymentSuccessContent({ searchParams }: { searchParams: Promise<{ session_id?: string; tier?: string }> }) {
  const { session_id, tier } = await searchParams;

  if (!session_id || !tier) {
    redirect("/");
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  // Verify the checkout session
  let checkoutSession;
  try {
    checkoutSession = await stripe.checkout.sessions.retrieve(session_id);
  } catch {
    return <ErrorMessage />;
  }

  if (checkoutSession.payment_status !== "paid") {
    return <ErrorMessage />;
  }

  // Check if purchase already exists
  let purchase = await getPurchaseByStripeSession(session_id);

  if (!purchase) {
    // Create new purchase record
    const amount = checkoutSession.amount_total || 0;
    const currency = checkoutSession.currency || "usd";

    purchase = await createPurchase({
      userId: session.user.id,
      stripeSessionId: session_id,
      stripePaymentIntentId: checkoutSession.payment_intent as string | undefined,
      tierId: tier,
      amount,
      currency,
      status: "completed",
    });

    logger.info(`Created purchase on success page`, {
      purchaseId: purchase.id,
      userId: session.user.id,
      tierId: tier,
      amount,
    });
  } else if (purchase.status !== "completed") {
    // Update existing purchase to completed
    await updatePurchaseStatus(purchase.id, "completed", checkoutSession.payment_intent as string | undefined);

    logger.info(`Updated purchase to completed on success page`, {
      purchaseId: purchase.id,
      userId: session.user.id,
    });
  }

  return (
    <div className="text-center">
      <div className="mb-6">
        <div className="mx-auto h-16 w-16 rounded-full bg-success/10 flex items-center justify-center">
          <svg className="h-8 w-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
      </div>

      <h1 className="text-headline text-foreground mb-4">Payment Successful!</h1>
      <p className="text-body text-muted mb-8 max-w-md mx-auto">
        Thank you for your purchase. Your <strong className="text-foreground capitalize">{tier}</strong> plan is now active.
        You can start uploading videos right away.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center px-6 py-3 bg-ochre text-background text-sm font-semibold tracking-wide hover:bg-ochre-dark transition-colors"
        >
          Go to Dashboard
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 border border-border text-foreground text-sm font-semibold tracking-wide hover:border-ochre hover:bg-stone/30 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

function ErrorMessage() {
  return (
    <div className="text-center">
      <h1 className="text-headline text-foreground mb-4">Payment Verification Failed</h1>
      <p className="text-body text-muted mb-8">
        We couldn&apos;t verify your payment. If you were charged, please contact support.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center px-6 py-3 bg-ochre text-background text-sm font-semibold tracking-wide hover:bg-ochre-dark transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="text-center">
      <div className="mx-auto h-16 w-16 rounded-full bg-stone/30 flex items-center justify-center mb-6">
        <div className="h-8 w-8 border-2 border-ochre border-t-transparent rounded-full animate-spin" />
      </div>
      <h1 className="text-headline text-foreground mb-4">Verifying Payment...</h1>
      <p className="text-body text-muted">Please wait while we confirm your purchase.</p>
    </div>
  );
}

export default function PaymentSuccessPage({ searchParams }: { searchParams: Promise<{ session_id?: string; tier?: string }> }) {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-24 bg-background">
      <Suspense fallback={<LoadingState />}>
        <PaymentSuccessContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
