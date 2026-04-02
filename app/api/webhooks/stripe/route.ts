import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createPurchase, getPurchaseByStripeSession, updatePurchaseStatus } from "@/lib/data";
import { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } from "@/lib/env";
import { logger } from "@/lib/logger";
import { checkRateLimit, getClientIP, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2026-03-25.dahlia",
});

const webhookSecret = STRIPE_WEBHOOK_SECRET;

export async function POST(request: Request) {
  const startTime = Date.now();
  const headersList = await headers();
  const clientIP = getClientIP(headersList);

  // Apply rate limiting for webhooks
  const rateLimit = checkRateLimit(`webhook:${clientIP}`, RATE_LIMITS.webhook);
  if (!rateLimit.success) {
    logger.warn("Rate limit exceeded for webhook", { clientIP });
    return rateLimitResponse(rateLimit);
  }

  try {
    const body = await request.text();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      logger.warn("Missing stripe-signature header", { clientIP });
      return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      logger.error("Webhook signature verification failed", { clientIP }, err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    logger.webhook(event.type, { id: event.id, clientIP });

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case "checkout.session.async_payment_succeeded": {
        // For async payment methods (e.g., bank transfers)
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        await handleChargeRefunded(charge);
        break;
      }

      default:
        logger.info(`Unhandled webhook event type: ${event.type}`, { eventId: event.id });
    }

    const duration = Date.now() - startTime;
    logger.request("POST", "/api/webhooks/stripe", 200, duration);

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error("Webhook processing failed", { clientIP }, error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const sessionId = session.id;
  const userId = session.metadata?.userId;
  const tierId = session.metadata?.tierId;

  if (!userId || !tierId) {
    logger.error("Missing metadata in checkout session", { sessionId });
    return;
  }

  if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
    logger.info(`Payment not completed for session ${sessionId}`, { paymentStatus: session.payment_status });
    return;
  }

  try {
    // Check if purchase already exists
    const existingPurchase = await getPurchaseByStripeSession(sessionId);

    if (existingPurchase) {
      if (existingPurchase.status !== "completed") {
        await updatePurchaseStatus(
          existingPurchase.id,
          "completed",
          session.payment_intent as string | undefined
        );
        logger.info(`Updated purchase ${existingPurchase.id} to completed`);
      }
      return;
    }

    // Create new purchase
    const amount = session.amount_total || 0;
    const currency = session.currency || "usd";

    const purchase = await createPurchase({
      userId,
      stripeSessionId: sessionId,
      stripePaymentIntentId: session.payment_intent as string | undefined,
      tierId,
      amount,
      currency,
      status: "completed",
    });

    logger.info(`Created purchase ${purchase.id} for user ${userId}`, {
      purchaseId: purchase.id,
      userId,
      tierId,
      amount,
    });
  } catch (error) {
    logger.error("Failed to process checkout session completion", { sessionId, userId }, error);
    throw error;
  }
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  const paymentIntentId = charge.payment_intent as string;

  if (!paymentIntentId) {
    logger.error("No payment intent in charge", { chargeId: charge.id });
    return;
  }

  logger.info(`Charge ${charge.id} was refunded`, { paymentIntentId });

  // Note: In production, you'd want to track purchases by payment intent ID
  // and update the purchase status to "refunded" here
}
