import Stripe from 'stripe';
import Booking from '../models/bookingModel.js';
import catchAsync from '../utils/catchAsync.js';


export const handleStripeWebhook = catchAsync(async (req, res) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
   
    return res.status(400).send(`Webhook signature verification failed: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const bookingId = session.client_reference_id;

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status: 'confirmed', paymentStatus: 'paid' },
      { new: true },
    );

    if (!booking) {
      console.error(`Webhook received for unknown booking: ${bookingId}`);
     
    }
  }

  res.status(200).json({ received: true });
});