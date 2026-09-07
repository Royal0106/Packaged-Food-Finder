import Stripe from "stripe";
import { getConfig } from "../config";
import { prisma } from "../lib/prisma";
import { Errors } from "../utils/errors";
import { mapStripeSubscriptionStatus, unixToDate } from "../utils/subscription";
import { getDemoUser } from "./user.service";

let stripeClient: Stripe | undefined;

export function getStripe(): Stripe {
  if (!stripeClient) {
    stripeClient = new Stripe(getConfig().STRIPE_SECRET_KEY);
  }

  return stripeClient;
}

export function resetStripeClient() {
  stripeClient = undefined;
}

export async function createCheckoutSession() {
  try {
    const config = getConfig();
    const user = await getDemoUser();
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: config.STRIPE_PRICE_ID, quantity: 1 }],
      success_url: `${config.FRONTEND_URL}/subscription/success`,
      cancel_url: `${config.FRONTEND_URL}/subscription/cancel`,
      client_reference_id: String(user.id),
      metadata: { userId: String(user.id) },
      ...(user.stripeCustomerId
        ? { customer: user.stripeCustomerId }
        : { customer_email: user.email }),
    });

    if (!session.url) {
      throw Errors.checkoutFailed();
    }

    return { url: session.url };
  } catch (error) {
    if (error instanceof Error && error.name === "AppError") {
      throw error;
    }
    throw Errors.checkoutFailed();
  }
}

export function constructWebhookEvent(rawBody: Buffer, signature: string | undefined) {
  if (!signature) {
    throw Errors.webhookVerificationFailed();
  }

  try {
    return getStripe().webhooks.constructEvent(
      rawBody,
      signature,
      getConfig().STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    throw Errors.webhookVerificationFailed();
  }
}

export async function handleStripeEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object);
      break;
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await applySubscription(event.data.object);
      break;
    case "invoice.payment_failed":
      await handleInvoicePaymentFailed(event.data.object);
      break;
    default:
      break;
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const customerId = asId(session.customer);
  const subscriptionId = asId(session.subscription);

  if (subscriptionId) {
    const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
    await applySubscription(subscription);
    return;
  }

  if (customerId) {
    await updateDemoUser({
      stripeCustomerId: customerId,
    });
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = asId(invoice.customer);
  const invoiceRecord = invoice as Stripe.Invoice & {
    subscription?: string | Stripe.Subscription | null;
  };
  const subscriptionId = asId(invoiceRecord.subscription);

  await updateDemoUser({
    ...(customerId ? { stripeCustomerId: customerId } : {}),
    ...(subscriptionId ? { stripeSubscriptionId: subscriptionId } : {}),
    subscriptionStatus: "past_due",
  });
}

async function applySubscription(subscription: Stripe.Subscription) {
  const customerId = asId(subscription.customer);
  const periodEnd = getSubscriptionPeriodEnd(subscription);

  await updateDemoUser({
    ...(customerId ? { stripeCustomerId: customerId } : {}),
    stripeSubscriptionId: subscription.id,
    subscriptionStatus: mapStripeSubscriptionStatus(subscription.status),
    subscriptionCurrentPeriodEnd: periodEnd,
  });
}

async function updateDemoUser(data: {
  stripeCustomerId?: string;
  stripeSubscriptionId?: string | null;
  subscriptionStatus?: "inactive" | "active" | "canceled" | "past_due";
  subscriptionCurrentPeriodEnd?: Date | null;
}) {
  const user = await getDemoUser();
  await prisma.user.update({
    where: { id: user.id },
    data,
  });
}

function getSubscriptionPeriodEnd(subscription: Stripe.Subscription): Date | null {
  const record = subscription as Stripe.Subscription & {
    current_period_end?: number;
    items?: { data?: Array<{ current_period_end?: number }> };
  };

  return (
    unixToDate(record.current_period_end) ??
    unixToDate(record.items?.data?.[0]?.current_period_end)
  );
}

function asId(value: unknown): string | null {
  if (typeof value === "string" && value.length > 0) {
    return value;
  }

  if (value && typeof value === "object" && "id" in value) {
    const id = (value as { id: unknown }).id;
    return typeof id === "string" ? id : null;
  }

  return null;
}
