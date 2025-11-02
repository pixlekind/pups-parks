// pages/api/checkout.ts
import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { plan } = req.body; // "monthly" or "yearly"

  const priceId =
    plan === "yearly"
      ? "price_1SOlidKtedAAfiE0xcZ9eI91" // £250/year
      : "price_1SOOU0KtedAAfiE0LaLPeRwd"; // £25/month

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${req.headers.origin}/walker-dashboard.html?success=true`,
      cancel_url: `${req.headers.origin}/pricing.html?canceled=true`,
    });

    res.json({ url: session.url });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
