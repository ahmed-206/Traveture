import Stripe from 'stripe';

let client = null;

export const getStripe = () => {
  if (!client) client = new Stripe(process.env.STRIPE_SECRET_KEY);
  return client;
};

const RETRYABLE_TYPES = new Set([
  'StripeConnectionError',
  'StripeAPIError',
  'StripeRateLimitError',
  'StripeIdempotencyError',
]);

export const isRetryableStripeError = (err) => RETRYABLE_TYPES.has(err?.type);


export const expireCheckoutSession = async (sessionId) => {
  const stripe = getStripe();
  try {
    await stripe.checkout.sessions.expire(sessionId);
    return 'expired';
  } catch (err) {
    // expire() fails when the session is not open anymore -> find out why
    const s = await stripe.checkout.sessions.retrieve(sessionId);
    if (s.status === 'open') throw err; // real failure, session still payable
    return s.status; // 'complete' | 'expired'
  }
};
