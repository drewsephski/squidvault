import Link from "next/link";

export default function PaymentCancelPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-24 bg-background">
      <div className="text-center">
        <div className="mb-6">
          <div className="mx-auto h-16 w-16 rounded-full bg-stone/50 flex items-center justify-center">
            <svg className="h-8 w-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>

        <h1 className="text-headline text-foreground mb-4">Payment Cancelled</h1>
        <p className="text-body text-muted mb-8 max-w-md mx-auto">
          Your payment was cancelled and you weren&apos;t charged. You can try again anytime or explore our free plan.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/#pricing"
            className="inline-flex items-center justify-center px-6 py-3 bg-ochre text-background text-sm font-semibold tracking-wide hover:bg-ochre-dark transition-colors"
          >
            Back to Pricing
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-border text-foreground text-sm font-semibold tracking-wide hover:border-ochre hover:bg-stone/30 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
