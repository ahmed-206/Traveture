import Booking, { NO_POPULATE } from '../models/bookingModel.js';
import RefundRequest from '../models/refundRequestModel.js';
import AppError from '../utils/appError.js';
import { getStripe, isRetryableStripeError } from '../utils/stripe.js';
import { runInTransaction } from '../utils/transaction.js';
import { emitEvent } from './outboxService.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_REFUND_ATTEMPTS = 5;


export const REFUND_POLICY_TIERS = [
  { minDaysBeforeStart: 7, percent: 100 },
  { minDaysBeforeStart: 2, percent: 50 },
  { minDaysBeforeStart: 0, percent: 0 },
];

export const planCancellationRefund = ({ booking, actor, now = new Date() }) => {
  let percent = 100;

  if (actor === 'user') {
    const msUntilStart = booking.startDate.getTime() - now.getTime();
    if (msUntilStart <= 0) {
      throw new AppError('Cannot cancel a booking after the tour has started', 400);
    }
    const days = msUntilStart / DAY_MS;
    percent = REFUND_POLICY_TIERS.find((t) => days >= t.minDaysBeforeStart).percent;
  }

  const amountCents = booking.amountPaidCents
    ? Math.floor((booking.amountPaidCents * percent) / 100)
    : 0;

  return {
    percent,
    amountCents,
    paymentIntentId: booking.stripePaymentIntentId,
  };
};

export const queueRefund = async (
  { bookingId, paymentIntentId, amountCents, reason, isBookingPayment },
  session,
) => {
  await RefundRequest.updateOne(
    { paymentIntentId },
    {
      $setOnInsert: {
        booking: bookingId,
        paymentIntentId,
        amountCents,
        reason,
        isBookingPayment,
      },
    },
    { upsert: true, session },
  );
  return RefundRequest.findOne({ paymentIntentId }).session(session);
};


export const processRefundRequest = async (requestId) => {
  const request = await RefundRequest.findOneAndUpdate(
    { _id: requestId, status: 'pending' },
    { $inc: { attempts: 1 } },
    { new: true },
  );
  if (!request) return null; // already done or unknown

  const stripe = getStripe();
  let refund;

  // ---- Phase 1: Stripe ----
  try {
    const existing = await stripe.refunds.list({
      payment_intent: request.paymentIntentId,
      limit: 100,
    });
    refund = existing.data.find(
      (r) =>
        r.metadata?.refundRequestId === String(request._id) &&
        !['failed', 'canceled'].includes(r.status),
    );

    if (!refund) {
      refund = await stripe.refunds.create(
        {
          payment_intent: request.paymentIntentId,
          amount: request.amountCents,
          metadata: {
            refundRequestId: String(request._id),
            bookingId: String(request.booking),
            reason: request.reason,
          },
        },
        { idempotencyKey: `refund-${request._id}` },
      );
    }
  } catch (err) {
    const retryable = isRetryableStripeError(err) && request.attempts < MAX_REFUND_ATTEMPTS;
    await RefundRequest.updateOne(
      { _id: request._id },
      { $set: { status: retryable ? 'pending' : 'needs_review', lastError: err.message } },
    );
    console.error(
      `[Refund] ${request._id} failed (attempt ${request.attempts}, ${
        retryable ? 'will retry' : 'NEEDS MANUAL REVIEW'
      }): ${err.message}`,
    );
    return null;
  }

  // bookkeeping, atomic with the notification event 
  try {
    await runInTransaction(async (session) => {
      await RefundRequest.updateOne(
        { _id: request._id },
        { $set: { status: 'succeeded', stripeRefundId: refund.id, lastError: null } },
        { session },
      );

      if (request.isBookingPayment) {
        await Booking.updateOne(
          { _id: request.booking, paymentStatus: 'paid' },
          { $set: { paymentStatus: 'refunded', refundedAmountCents: request.amountCents } },
          { session },
        );
      }

      const owner = await Booking.findById(request.booking)
        .session(session)
        .setOptions(NO_POPULATE);

      if (owner) {
        await emitEvent(
          {
            key: `refund:${request._id}:succeeded`,
            type: 'REFUND_SUCCEEDED',
            aggregateId: owner._id,
            payload: {
              userId: owner.user,
              bookingId: owner._id,
              tourId: owner.tour,
              amountCents: request.amountCents,
              currency: request.currency,
              reason: request.reason,
            },
          },
          session,
        );
      }
    });
    return refund;
  } catch (err) {
    console.error(
      `[Refund] ${request._id} accepted by Stripe but bookkeeping failed (will retry): ${err.message}`,
    );
    await RefundRequest.updateOne(
      { _id: request._id },
      { $set: { lastError: `bookkeeping failed: ${err.message}` } },
    );
    return null;
  }
};


export const processPendingRefunds = async ({ limit = 50 } = {}) => {
  const cutoff = new Date(Date.now() - 60 * 1000);
  const pending = await RefundRequest.find({ status: 'pending', updatedAt: { $lt: cutoff } })
    .sort({ updatedAt: 1 })
    .limit(limit);
  for (const r of pending) {
    await processRefundRequest(r._id);
  }
  return pending.length;
};
