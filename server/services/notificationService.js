import Notification, { NOTIFICATION_TTL_MS } from '../models/notifications/notificationModel.js';
import Tour from '../models/tourModel.js';

const money = (cents, currency = 'usd') =>
  cents == null ? null : `${(cents / 100).toFixed(2)} ${currency.toUpperCase()}`;
const day = (d) => new Date(d).toISOString().slice(0, 10);

const REFUND_REASON_TEXT = {
  booking_cancelled: 'for your cancelled booking',
  payment_on_cancelled_booking: 'because your payment arrived after the booking was cancelled',
  duplicate_payment: 'because you were charged twice for the same booking',
  amount_mismatch: 'because the amount charged did not match the booking price',
};

const CANCELLED_BY_TEXT = {
  user: 'You cancelled',
  admin: 'Our team cancelled',
  system: 'We cancelled',
};

/** Turns an outbox event into notification content. Pure apart from the tour-name lookup. */
const buildContent = (type, p, tourName) => {
  const trip = `"${tourName}"`;
  switch (type) {
    case 'BOOKING_CONFIRMED': {
      const paid = money(p.amountCents);
      return {
        title: 'Booking confirmed',
        message:
          `Your booking for ${trip} on ${day(p.startDate)} (${p.guests} guest${p.guests > 1 ? 's' : ''}) is confirmed.` +
          (paid ? ` Payment received: ${paid}.` : ''),
      };
    }
    case 'BOOKING_CANCELLED':
      return {
        title: 'Booking cancelled',
        message: `${CANCELLED_BY_TEXT[p.cancelledBy] ?? 'We cancelled'} your booking for ${trip} on ${day(p.startDate)}.`,
      };
    case 'BOOKING_COMPLETED':
      return {
        title: 'Trip completed',
        message: `Your trip ${trip} is complete. We hope you had a great time!`,
      };
    case 'REFUND_SUCCEEDED':
      return {
        title: 'Refund issued',
        message:
          `A refund of ${money(p.amountCents, p.currency)} ${REFUND_REASON_TEXT[p.reason] ?? ''}`.trim() +
          ' has been issued. It can take 5-10 business days to appear on your statement.',
      };
    default:
      throw new Error(`No notification template for event type ${type}`);
  }
};

export const createNotificationFromEvent = async (event) => {
  const p = event.payload;
  if (!p?.userId || !p?.bookingId) {
    throw new Error(`Event ${event.eventId} has no userId/bookingId in its payload`);
  }

  const tour = p.tourId ? await Tour.findById(p.tourId).select('name').lean() : null;
  const { title, message } = buildContent(event.type, p, tour?.name ?? 'your tour');

  try {
    await Notification.updateOne(
      { user: p.userId, eventId: event.eventId },
      {
        $setOnInsert: {
          type: event.type,
          title,
          message,
          params: {
            tourName: tour?.name ?? null,
            guests: p.guests ?? null,
            startDate: p.startDate ?? null,
            amountCents: p.amountCents ?? null,
            currency: p.currency ?? 'usd',
            reason: p.reason ?? null,
            cancelledBy: p.cancelledBy ?? null,
          },
          resource: { kind: 'booking', id: p.bookingId },
          occurredAt: event.occurredAt,
          expiresAt: new Date(Date.now() + NOTIFICATION_TTL_MS),
        },
      },
      { upsert: true },
    );
  } catch (err) {
    if (err.code !== 11000) throw err; 
  }
};
