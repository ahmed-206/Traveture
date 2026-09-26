import Stripe from 'stripe';
import Booking from '../models/bookingModel.js';
import catchAsync from '../utils/catchAsync.js';
import ProcessedWebhookEvent from '../models/processedWebhookEventModel.js';

const handleCheckoutCompleted = async (session) => {
  const bookingId = session.client_reference_id;
  console.log(`[Webhook] checkout.session.completed — booking: ${bookingId}`);

  const booking = await Booking.findByIdAndUpdate(
    bookingId,
    { status: 'confirmed', paymentStatus: 'paid' },
    { new: true },
  );

  if (!booking) {
    console.error(`[Webhook] Unknown booking: ${bookingId}`);
  }
};

const handleCheckoutExpired = async (session) => {
  const bookingId = session.client_reference_id;
  console.log(`[Webhook] checkout.session.expired — booking: ${bookingId}`);

  if (!bookingId) return;

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    console.error(`[Webhook] Unknown booking for expired session: ${bookingId}`);
    return;
  }

  if (booking.status === 'pending') {
    booking.status = 'cancelled';
    booking.paymentStatus = 'failed';
    await booking.save();
    console.log(`[Webhook] Released pending booking: ${bookingId}`);
  }
};

const handlePaymentFailed = async (paymentIntent) => {
  console.log(`[Webhook] payment_intent.payment_failed — PI: ${paymentIntent.id}`);
};


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
    console.error(`[Webhook] Signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook signature verification failed: ${err.message}`);
  }


  //Idempotency check
  try {
    await ProcessedWebhookEvent.create({
      eventId: event.id,
      eventType: event.type,
    });
  } catch (err) {
    if (err.code === 11000) {
      // duplicate key — الـ event ده اتعالج قبل كده، تجاهله بأمان
      console.log(`[Webhook] Duplicate event ignored: ${event.id}`);
      return res.status(200).json({ received: true, duplicate: true });
    }
    throw err; 
  }

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object);
      break;
    case 'checkout.session.expired':
      await handleCheckoutExpired(event.data.object);
      break;
    case 'payment_intent.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;
    default:
      console.log(`[Webhook] Unhandled event type: ${event.type}`);
  }

  res.status(200).json({ received: true });
});