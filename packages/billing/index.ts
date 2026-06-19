import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("STRIPE_SECRET_KEY is not set. Billing features will not work.");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-11-20.acacia" as any,
});

export const billing = {
  /**
   * Create a new Stripe customer
   */
  createCustomer: async (email: string, name?: string) => {
    return await stripe.customers.create({
      email,
      name,
    });
  },

  /**
   * Create a checkout session for a subscription
   */
  createCheckoutSession: async (
    customerId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string
  ) => {
    return await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
  },

  /**
   * Report usage for metered billing
   */
  reportUsage: async (subscriptionItemId: string, quantity: number) => {
    return await stripe.subscriptionItems.createUsageRecord(
      subscriptionItemId,
      {
        quantity,
        timestamp: Math.floor(Date.now() / 1000),
        action: "increment",
      }
    );
  },

  /**
   * Get subscription details
   */
  getSubscription: async (subscriptionId: string) => {
    return await stripe.subscriptions.retrieve(subscriptionId);
  },

  /**
   * Cancel a subscription
   */
  cancelSubscription: async (subscriptionId: string) => {
    return await stripe.subscriptions.cancel(subscriptionId);
  },
};
