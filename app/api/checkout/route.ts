import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { STRIPE_SECRET_KEY, BETTER_AUTH_URL } from "@/lib/env";
import { logger } from "@/lib/logger";
import { checkRateLimit, getClientIP, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2026-03-25.dahlia",
});

export async function POST(request: Request) {
  const startTime = Date.now();
  const headersList = await headers();
  const clientIP = getClientIP(headersList);

  // Apply rate limiting
  const rateLimit = checkRateLimit(`checkout:${clientIP}`, RATE_LIMITS.api);
  if (!rateLimit.success) {
    logger.warn("Rate limit exceeded for checkout", { clientIP });
    return rateLimitResponse(rateLimit);
  }

  try {
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session) {
      logger.warn("Unauthorized checkout attempt", { clientIP });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { priceId, tierId } = await request.json();

    if (!priceId || !tierId) {
      logger.warn("Missing priceId or tierId in checkout request", { userId: session.user.id });
      return NextResponse.json({ error: "Missing priceId or tierId" }, { status: 400 });
    }

    const origin = request.headers.get("origin") || BETTER_AUTH_URL || "http://localhost:3000";

    const checkoutSession = await stripe.checkout.sessions.create({
      customer_email: session.user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}&tier=${tierId}`,
      cancel_url: `${origin}/payment/cancel`,
      metadata: {
        userId: session.user.id,
        tierId: tierId,
      },
    });

    const duration = Date.now() - startTime;
    logger.info(`Created checkout session for user ${session.user.id}`, {
      userId: session.user.id,
      tierId,
      sessionId: checkoutSession.id,
    });
    logger.request("POST", "/api/checkout", 200, duration, session.user.id);

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    logger.error("Stripe checkout error", { clientIP }, error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
