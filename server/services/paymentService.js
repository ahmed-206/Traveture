import Booking, { NO_POPULATE } from '../models/bookingModel.js';
import Tour from '../models/tourModel.js';
import AppError from '../utils/appError.js';
import {
  getStripe,
  expireCheckoutSession,
  isRetryableStripeError,
} from '../utils/stripe.js';
import { createBooking, cancelBooking } from './bookingService.js';

const CURRENCY = 'usd';
const CHECKOUT_TTL_MS = 60 * 60 * 1000;
const MIN_REMAINING_MS = 31 * 60 * 1000;

const idOf = (v) => v?._id ?? v;

const PROVIDER_DOWN = () =>
  new AppError('Payment provider is temporarily unavailable. Please retry.', 503);

const hasUsableAttempt = (booking) =>
  booking.checkoutExpiresAt &&
  booking.checkoutExpiresAt.getTime() - Date.now() >= MIN_REMAINING_MS;

const retrieveSession = async (sessionId) => {
  try {
    return await getStripe().checkout.sessions.retrieve(sessionId);
  } catch (err) {
    if (err.code === 'resource_missing') return null;
    if (isRetryableStripeError(err)) throw PROVIDER_DOWN();
    throw err;
  }
};

const startNewAttempt = async (booking) => {
  const updated = await Booking.findOneAndUpdate(
    { _id: booking._id, status: 'pending', checkoutAttempt: booking.checkoutAttempt },
    {
      $inc: { checkoutAttempt: 1 },
      $set: { stripeSessionId: null, checkoutExpiresAt: new Date(Date.now() + CHECKOUT_TTL_MS) },
    },
    { new: true, ...NO_POPULATE },
  );
  if (updated) return updated;

  // A concurrent request started the attempt first: adopt it (same key => same session)
  const fresh = await Booking.findById(booking._id).setOptions(NO_POPULATE);
  if (!fresh || fresh.status !== 'pending') {
    throw new AppError('This booking is no longer pending', 409);
  }
  return fresh;
};

const createStripeSession = (booking, tourName) =>
  getStripe().checkout.sessions.create(
    {
      mode: 'payment',
      payment_method_types: ['card'],
      success_url: `${process.env.CLIENT_URL}/bookings/success?bookingId=${booking._id}`,
      cancel_url: `${process.env.CLIENT_URL}/tours/${idOf(booking.tour)}`,
      client_reference_id: String(booking._id),
      metadata: { bookingId: String(booking._id) },
      expires_at: Math.floor(booking.checkoutExpiresAt.getTime() / 1000),
      line_items: [
        {
          price_data: {
            currency: CURRENCY,
            unit_amount: Math.round(booking.price * 100),
            product_data: { name: `${tourName} (${booking.guests} guest${booking.guests > 1 ? 's' : ''})` },
          },
          quantity: 1,
        },
      ],
    },
    { idempotencyKey: `checkout-${booking._id}-${booking.checkoutAttempt}` },
  );

export const createCheckoutSession = async ({ userId, tourId, guests, startDate }) => {
  // Idempotent: same user/tour/date/guests returns the same pending booking
  let booking = await createBooking({ userId, tourId, guests, startDate });

  // 1) Reuse the existing session if it is still payable
  if (booking.stripeSessionId) {
    const existing = await retrieveSession(booking.stripeSessionId);
    if (existing?.status === 'open') return existing;
    if (existing?.status === 'complete') {
      throw new AppError(
        'Payment for this booking was already completed. Confirmation is being processed.',
        409,
      );
    }
    booking = await startNewAttempt(booking); // expired or missing
  } else if (!hasUsableAttempt(booking)) {
    booking = await startNewAttempt(booking);
  }
  // else: an earlier attempt started but we never recorded its session id
  // (crash / timeout) -> reuse the SAME attempt so the idempotency key replays it.

  const tour = await Tour.findById(idOf(booking.tour)).select('name');
  const tourName = tour?.name ?? 'Tour booking';

  let session;
  try {
    session = await createStripeSession(booking, tourName);
  } catch (err) {
   
    if (err.type === 'StripeIdempotencyError' || err.code === 'idempotency_key_in_use') {
      throw new AppError('A payment session is already being created. Retry in a moment.', 409);
    }
    if (isRetryableStripeError(err)) throw PROVIDER_DOWN();

    console.error(`[Checkout] Permanent failure for booking ${booking._id}: ${err.message}`);
    await cancelBooking({
      bookingId: booking._id,
      actor: 'system',
      reason: 'checkout_creation_failed',
    }).catch((e) => console.error(`[Checkout] Could not release booking: ${e.message}`));
    throw new AppError('Failed to create checkout session', 500);
  }

  // Record the session, but only if the booking is still on this attempt and pending
  const saved = await Booking.updateOne(
    { _id: booking._id, status: 'pending', checkoutAttempt: booking.checkoutAttempt },
    { $set: { stripeSessionId: session.id } },
  );
  if (saved.matchedCount === 0) {
    await expireCheckoutSession(session.id).catch(() => {});
    throw new AppError('This booking is no longer pending', 409);
  }

  return session;
};
