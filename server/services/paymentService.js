import Stripe from 'stripe';
import { createBooking } from './bookingService.js';
import AppError from '../utils/appError.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async ({ userId, tourId, guests, startDate }) => {
  const booking = await createBooking({ userId, tourId, guests, startDate });

  if (!booking) {
    throw new AppError('Failed to create booking', 500);
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/bookings/success?bookingId=${booking._id}`,
      cancel_url: `${process.env.CLIENT_URL}/tours/${tourId}`,
      client_reference_id: booking._id.toString(),
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: Math.round(booking.price * 100),
            product_data: { name: `Booking for tour ${tourId}` },
          },
          quantity: 1,
        },
      ],
    });

    return session;
  } catch (err) {
    booking.status = 'cancelled';
    await booking.save();

    throw new AppError('Failed to create checkout session', 500);
  }
};