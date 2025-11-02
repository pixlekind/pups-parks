// pages/api/webhook.ts
import { buffer } from "micro";
import Stripe from "stripe";

export const config = { api: { bodyParser: false } };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const sig = req.headers["stripe-signature"];
  const buf = await buffer(req);

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case "checkout.session.completed":
      console.log("Checkout completed:", event.data.object.id);
      break;
    case "customer.subscription.created":
    case "customer.subscription.updated":
      const subscription = event.data.object;
      console.log("Subscription status:", subscription.status);
      // 👉 Update your DB here: mark walker as active/canceled
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
}
