import mongoose from 'mongoose';
import Booking, { NO_POPULATE } from '../models/bookingModel.js';
import ProcessedWebhookEvent from '../models/processedWebhookEventModel.js';
import catchAsync from '../utils/catchAsync.js';
import { getStripe, expireCheckoutSession } from '../utils/stripe.js';
import { runInTransaction } from '../utils/transaction.js';
import { transitionBooking } from '../services/bookingService.js';
import { queueRefund, processRefundRequest } from '../services/refundService.js';

const CURRENCY = 'usd';

const asId = (v) => (typeof v === 'string' ? v : v?.id ?? null);

const queueRefundAndSchedule = async (params, { session, afterCommit }) => {
  const request = await queueRefund(params, session);
  // executed only AFTER the transaction commits (refund is an external side effect)
  afterCommit.push(() => processRefundRequest(request._id));
};



const handleCheckoutPaid = async (cs, ctx) => {
  const { session, afterCommit } = ctx;
  const bookingId = cs.client_reference_id;
  const paymentIntentId = asId(cs.payment_intent);
  console.log(`[Webhook] checkout paid? booking=${bookingId} session=${cs.id}`);

  if (cs.mode !== 'payment') return;

  // 1) Was it really paid? 'completed' also fires for delayed methods that are still unpaid.
  if (cs.payment_status !== 'paid') {
    console.log(`[Webhook] ${cs.id} completed but payment_status=${cs.payment_status}; waiting`);
    return;
  }
  if (!bookingId || !mongoose.isValidObjectId(bookingId) || !paymentIntentId) {
    console.error(`[Webhook] CRITICAL paid session ${cs.id} cannot be linked to a booking / payment`);
    return;
  }

  const booking = await Booking.findById(bookingId).session(session).setOptions(NO_POPULATE);
  if (!booking) {
    console.error(`[Webhook] CRITICAL paid session ${cs.id} (PI ${paymentIntentId}): unknown booking ${bookingId}`);
    return;
  }

  // 2) Verify the money matches what we asked for
  const expectedCents = Math.round(booking.price * 100);
  if (cs.amount_total !== expectedCents || cs.currency !== CURRENCY) {
    console.error(
      `[Webhook] Amount mismatch booking=${bookingId}: expected ${expectedCents} ${CURRENCY}, got ${cs.amount_total} ${cs.currency}. Refunding.`,
    );
    await queueRefundAndSchedule(
      {
        bookingId: booking._id,
        paymentIntentId,
        amountCents: cs.amount_total,
        reason: 'amount_mismatch',
        isBookingPayment: false,
      },
      ctx,
    );
    return;
  }

  // 3) Happy path: atomic pending -> confirmed
  const before = await transitionBooking({
    bookingId,
    from: 'pending',
    status: 'confirmed',
    where: { paymentStatus: 'pending' },
    set: {
      paymentStatus: 'paid',
      stripePaymentIntentId: paymentIntentId,
      stripeSessionId: cs.id,
      amountPaidCents: cs.amount_total,
    },
    session,
  });
  if (before) {
    console.log(`[Webhook] Booking ${bookingId} confirmed`);
    // If a different (older/orphan) session was recorded, close it so it can't be paid too
    if (before.stripeSessionId && before.stripeSessionId !== cs.id) {
      afterCommit.push(() => expireCheckoutSession(before.stripeSessionId));
    }
    return;
  }

  // 4) Booking was not pending/unpaid. Work out why, each case on its own.
  if (booking.stripePaymentIntentId === paymentIntentId) {
    return; 
  }

  if (booking.status === 'cancelled' && booking.paymentStatus !== 'paid') {
    // Customer paid after the booking was cancelled/expired: record it and refund in full.
    console.error(`[Webhook] Payment on cancelled booking ${bookingId}. Refunding.`);
    await Booking.updateOne(
      { _id: bookingId, status: 'cancelled', paymentStatus: { $in: ['pending', 'failed'] } },
      {
        $set: {
          paymentStatus: 'paid',
          stripePaymentIntentId: paymentIntentId,
          stripeSessionId: cs.id,
          amountPaidCents: cs.amount_total,
        },
      },
      { session },
    );
    await queueRefundAndSchedule(
      {
        bookingId: booking._id,
        paymentIntentId,
        amountCents: cs.amount_total,
        reason: 'payment_on_cancelled_booking',
        isBookingPayment: true,
      },
      ctx,
    );
    return;
  }

  // Already paid with a different payment -> second payment for the same booking
  console.error(`[Webhook] Duplicate payment for booking ${bookingId} (PI ${paymentIntentId}). Refunding.`);
  await queueRefundAndSchedule(
    {
      bookingId: booking._id,
      paymentIntentId,
      amountCents: cs.amount_total,
      reason: 'duplicate_payment',
      isBookingPayment: false,
    },
    ctx,
  );
};

const handleCheckoutClosedUnpaid = async (cs, { session }, reason) => {
  const bookingId = cs.client_reference_id;
  console.log(`[Webhook] ${reason} booking=${bookingId} session=${cs.id}`);
  if (!bookingId || !mongoose.isValidObjectId(bookingId)) return;

  const before = await transitionBooking({
    bookingId,
    from: 'pending',
    status: 'cancelled',
    where: { paymentStatus: 'pending', stripeSessionId: { $in: [cs.id, null] } },
    set: {
      paymentStatus: 'failed',
      cancelledAt: new Date(),
      cancelledBy: 'system',
      cancellationReason: reason,
    },
    session,
  });

  console.log(
    before
      ? `[Webhook] Released pending booking ${bookingId}`
      : `[Webhook] Skipped ${reason} for ${bookingId}: not pending, or belongs to another session`,
  );
};

const handlePaymentFailed = async (paymentIntent) => {
 
  console.log(`[Webhook] payment_intent.payment_failed PI=${paymentIntent.id}`);
};

const dispatchEvent = async (event, ctx) => {
  const obj = event.data.object;
  switch (event.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded':
      return handleCheckoutPaid(obj, ctx);
    case 'checkout.session.expired':
      return handleCheckoutClosedUnpaid(obj, ctx, 'checkout_expired');
    case 'checkout.session.async_payment_failed':
      return handleCheckoutClosedUnpaid(obj, ctx, 'async_payment_failed');
    case 'payment_intent.payment_failed':
      return handlePaymentFailed(obj);
    default:
      console.log(`[Webhook] Unhandled event type: ${event.type}`);
  }
};



export const handleStripeWebhook = catchAsync(async (req, res) => {
  const stripe = getStripe();
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, 
      req.headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error(`[Webhook] Signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook signature verification failed: ${err.message}`);
  }


  const afterCommit = [];
  try {
    await runInTransaction(async (session) => {
      afterCommit.length = 0; // the callback may re-run on transient errors
      await ProcessedWebhookEvent.create([{ eventId: event.id, eventType: event.type }], {
        session,
      });
      await dispatchEvent(event, { session, afterCommit });
    });
  } catch (err) {
    if (err.code === 11000 && (err.keyPattern?.eventId || /eventId/.test(err.message))) {
      console.log(`[Webhook] Duplicate event ignored: ${event.id}`);
      return res.status(200).json({ received: true, duplicate: true });
    }
    throw err; 
  }

  for (const task of afterCommit) {
    try {
      await task();
    } catch (err) {
      console.error(`[Webhook] Post-commit task failed for ${event.id}: ${err.message}`);
    }
  }

  res.status(200).json({ received: true });
});
