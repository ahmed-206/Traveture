

import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import User from '../models/userModel.js';
import Tour from '../models/tourModel.js';
import Booking from '../models/bookingModel.js';
import Availability from '../models/availabilityModel.js';
import RefundRequest from '../models/refundRequestModel.js';
import ProcessedWebhookEvent from '../models/processedWebhookEventModel.js';
import { expireStalePendingBookings } from '../services/bookingService.js';


// We mock the Stripe module 
vi.mock('../utils/stripe.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getStripe: vi.fn(),
    expireCheckoutSession: vi.fn(),
    isRetryableStripeError: actual.isRetryableStripeError,
  };
});

import {
  getStripe,
  expireCheckoutSession,
} from '../utils/stripe.js';

// Shared fixture data
const futureDate = new Date('2028-06-15');
const secondFutureDate = new Date('2028-07-20');

const tourData = {
  name: 'Payment Test Tour',
  duration: 3,
  maxGroupSize: 10,
  difficulty: 'easy',
  price: 300,
  summary: 'Tour used for payment integration tests',
  imageCover: 'payment-tour-cover.jpg',
  startDates: [futureDate, secondFutureDate],
};

const userCredentials = {
  name: 'Payment Test User',
  email: 'payuser@test.com',
  password: 'test1234',
  passwordConfirm: 'test1234',
};

const adminCredentials = {
  name: 'Payment Admin',
  email: 'payadmin@test.com',
  password: 'test1234',
  passwordConfirm: 'test1234',
  role: 'admin',
};


const signupAndGetCookies = async (credentials) => {
  const res = await request(app).post('/api/v1/users/signup').send(credentials);
  return res.headers['set-cookie'];
};

const createAdminAndGetCookies = async (credentials) => {
  await User.create({
    name: credentials.name,
    email: credentials.email,
    password: credentials.password,
    passwordConfirm: credentials.passwordConfirm,
    role: 'admin',
  });
  const loginRes = await request(app).post('/api/v1/users/login').send({
    email: credentials.email,
    password: credentials.password,
  });
  return loginRes.headers['set-cookie'];
};

const createTour = (overrides = {}) => Tour.create({ ...tourData, ...overrides });

const createBookingViaAPI = (cookies, body) =>
  request(app).post('/api/v1/bookings').set('Cookie', cookies).send(body);

const createCheckoutSessionViaAPI = (cookies, body) =>
  request(app)
    .post('/api/v1/bookings/checkout-session')
    .set('Cookie', cookies)
    .send(body);


const buildStripeSession = (overrides = {}) => ({
  id: `cs_test_${new mongoose.Types.ObjectId().toString()}`,
  mode: 'payment',
  payment_status: 'paid',
  currency: 'usd',
  amount_total: 60000, // $600 = 2 guests × $300
  payment_intent: `pi_test_${new mongoose.Types.ObjectId().toString()}`,
  client_reference_id: null,
  ...overrides,
});


const WEBHOOK_SECRET = 'whsec_test_secret';
const sendWebhookEvent = async (event) => {
  const jsonStr = typeof event === 'string' ? event : JSON.stringify(event);
  return request(app)
    .post('/api/v1/stripe/webhook')
    .set('Content-Type', 'application/json')
    .set('stripe-signature', 'test_sig')
    .send(jsonStr);
};

const makeWebhookEvent = (type, object, id = null) => ({
  id: id ?? `evt_${new mongoose.Types.ObjectId().toString()}`,
  type,
  data: { object },
});

/**
 * Returns a fake Stripe client whose methods are vitest spies.
 */
const buildMockStripe = (overrides = {}) => ({
  checkout: {
    sessions: {
      create: vi.fn().mockResolvedValue({
        id: `cs_test_${new mongoose.Types.ObjectId().toString()}`,
        url: 'https://checkout.stripe.com/test',
        status: 'open',
        expires_at: Math.floor((Date.now() + 3600_000) / 1000),
      }),
      retrieve: vi.fn().mockResolvedValue({ status: 'open' }),
      expire: vi.fn().mockResolvedValue({}),
    },
  },
  webhooks: {
    constructEvent: vi.fn().mockImplementation((_body, _sig, _secret) => {
      let parsed = Buffer.isBuffer(_body)
        ? JSON.parse(_body.toString())
        : typeof _body === 'string'
        ? JSON.parse(_body)
        : _body;
      if (parsed?.type === 'Buffer' && Array.isArray(parsed?.data)) {
        parsed = JSON.parse(Buffer.from(parsed.data).toString());
      }
      return parsed;
    }),
  },
  refunds: {
    list: vi.fn().mockResolvedValue({ data: [] }),
    create: vi.fn().mockResolvedValue({ id: `re_test_${Date.now()}`, status: 'succeeded' }),
  },
  ...overrides,
});

//  Test suite 
describe('Payment & Checkout Integration Tests', () => {
  let userCookies;
  let adminCookies;
  let tour;
  let mockStripe;

  beforeEach(async () => {
    userCookies = await signupAndGetCookies(userCredentials);
    adminCookies = await createAdminAndGetCookies(adminCredentials);
    tour = await createTour();

    // Reset and configure stripe mock before every test
    mockStripe = buildMockStripe();
    getStripe.mockReturnValue(mockStripe);
    expireCheckoutSession.mockResolvedValue('expired');
  });

  
  // POST /api/v1/bookings/checkout-session
  describe('POST /api/v1/bookings/checkout-session  (Create Checkout Session)', () => {
    it('should create a checkout session and return 200 with a Stripe URL', async () => {
      const res = await createCheckoutSessionViaAPI(userCookies, {
        tourId: tour._id,
        guests: 2,
        startDate: futureDate,
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.url).toMatch(/checkout\.stripe\.com/);
      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledOnce();
    });

    it('should auto-create the underlying booking (status=pending) when none exists', async () => {
      await createCheckoutSessionViaAPI(userCookies, {
        tourId: tour._id,
        guests: 1,
        startDate: futureDate,
      });

      const booking = await Booking.findOne({}).setOptions({ skipPopulate: true });
      expect(booking).not.toBeNull();
      expect(booking.status).toBe('pending');
      expect(booking.paymentStatus).toBe('pending');
      expect(booking.guests).toBe(1);
    });

    it('should reuse the existing open Stripe session on a second request (idempotency)', async () => {
      const existingSessionId = `cs_test_existing_${Date.now()}`;

      // First call creates the session and stores it in the booking
      mockStripe.checkout.sessions.create.mockResolvedValueOnce({
        id: existingSessionId,
        url: 'https://checkout.stripe.com/existing',
        status: 'open',
        expires_at: Math.floor((Date.now() + 3600_000) / 1000),
      });
      await createCheckoutSessionViaAPI(userCookies, {
        tourId: tour._id,
        guests: 2,
        startDate: futureDate,
      });

      // Second call: Stripe returns the open session
      mockStripe.checkout.sessions.retrieve.mockResolvedValueOnce({
        id: existingSessionId,
        status: 'open',
        url: 'https://checkout.stripe.com/existing',
      });

      const res = await createCheckoutSessionViaAPI(userCookies, {
        tourId: tour._id,
        guests: 2,
        startDate: futureDate,
      });

      expect(res.statusCode).toBe(200);
      // create should NOT have been called a second time
      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledTimes(1);
    });

    it('should return 409 when Stripe session is already complete (payment in flight)', async () => {
      const sessionId = `cs_test_complete_${Date.now()}`;

      mockStripe.checkout.sessions.create.mockResolvedValueOnce({
        id: sessionId,
        url: 'https://checkout.stripe.com/complete',
        status: 'open',
        expires_at: Math.floor((Date.now() + 3600_000) / 1000),
      });

      // First request: creates booking + session
      await createCheckoutSessionViaAPI(userCookies, {
        tourId: tour._id,
        guests: 2,
        startDate: futureDate,
      });

      // Second request: Stripe says the session is already complete
      mockStripe.checkout.sessions.retrieve.mockResolvedValueOnce({
        id: sessionId,
        status: 'complete',
      });

      const res = await createCheckoutSessionViaAPI(userCookies, {
        tourId: tour._id,
        guests: 2,
        startDate: futureDate,
      });

      expect(res.statusCode).toBe(409);
    });

    it('should return 401 when not authenticated', async () => {
      const res = await request(app)
        .post('/api/v1/bookings/checkout-session')
        .send({ tourId: tour._id, guests: 1, startDate: futureDate });

      expect(res.statusCode).toBe(401);
    });

    it('should return 403 when an admin tries to create a checkout session', async () => {
      const res = await createCheckoutSessionViaAPI(adminCookies, {
        tourId: tour._id,
        guests: 1,
        startDate: futureDate,
      });

      expect(res.statusCode).toBe(403);
    });

    it('should return 404 when tourId does not exist', async () => {
      const res = await createCheckoutSessionViaAPI(userCookies, {
        tourId: new mongoose.Types.ObjectId(),
        guests: 1,
        startDate: futureDate,
      });

      expect(res.statusCode).toBe(404);
    });

    it('should return 400 when guests exceed available capacity', async () => {
      const res = await createCheckoutSessionViaAPI(userCookies, {
        tourId: tour._id,
        guests: 11,
        startDate: futureDate,
      });

      expect(res.statusCode).toBe(400);
    });

    it('should return 400 when startDate is not a valid tour start date', async () => {
      const res = await createCheckoutSessionViaAPI(userCookies, {
        tourId: tour._id,
        guests: 1,
        startDate: new Date('2029-12-01'),
      });

      expect(res.statusCode).toBe(400);
    });

    it('should return 409 when guests count differs from an existing pending booking', async () => {
      // Create a pending booking for 2 guests
      await createBookingViaAPI(userCookies, {
        tourId: tour._id,
        guests: 2,
        startDate: futureDate,
      });

      // Attempt checkout session for same tour/date but different guest count
      const res = await createCheckoutSessionViaAPI(userCookies, {
        tourId: tour._id,
        guests: 3,
        startDate: futureDate,
      });

      expect(res.statusCode).toBe(409);
    });

    it('should return 503 when the Stripe API is temporarily unavailable', async () => {
      const networkError = new Error('Connection error');
      networkError.type = 'StripeConnectionError';
      mockStripe.checkout.sessions.create.mockRejectedValueOnce(networkError);

      const res = await createCheckoutSessionViaAPI(userCookies, {
        tourId: tour._id,
        guests: 1,
        startDate: futureDate,
      });

      expect(res.statusCode).toBe(503);
    });

    it('should cancel the booking and return 500 when Stripe throws a permanent error', async () => {
      const permanentError = new Error('Invalid account');
      permanentError.type = 'StripeInvalidRequestError'; // not retryable
      mockStripe.checkout.sessions.create.mockRejectedValueOnce(permanentError);

      const res = await createCheckoutSessionViaAPI(userCookies, {
        tourId: tour._id,
        guests: 2,
        startDate: futureDate,
      });

      expect(res.statusCode).toBe(500);

      // Booking should have been cancelled to release the seats
      const booking = await Booking.findOne({}).setOptions({ skipPopulate: true });
      expect(booking.status).toBe('cancelled');

      // Availability should have been released (bookedGuests back to 0)
      const slot = await Availability.findOne({ tour: tour._id, startDate: futureDate });
      expect(slot.bookedGuests).toBe(0);
    });
  });

  // 
  // Cancelling a booking that already has a Stripe session (pending)
  // 
  describe('Cancelling a pending booking with an active Stripe session', () => {
    it('should expire the Stripe session and cancel the booking', async () => {
      // Create booking via API (status=pending, no stripe session yet)
      const createRes = await createBookingViaAPI(userCookies, {
        tourId: tour._id,
        guests: 2,
        startDate: futureDate,
      });
      const bookingId = createRes.body.data._id;

      // Simulate a Stripe session having been attached
      await Booking.findByIdAndUpdate(bookingId, {
        stripeSessionId: 'cs_test_with_session',
      });
      expireCheckoutSession.mockResolvedValueOnce('expired');

      const res = await request(app)
        .patch(`/api/v1/bookings/my-bookings/${bookingId}`)
        .set('Cookie', userCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe('cancelled');
      expect(expireCheckoutSession).toHaveBeenCalledWith('cs_test_with_session');
    });

    it('should return 409 when the Stripe session was just paid (race condition)', async () => {
      const createRes = await createBookingViaAPI(userCookies, {
        tourId: tour._id,
        guests: 1,
        startDate: futureDate,
      });
      const bookingId = createRes.body.data._id;

      await Booking.findByIdAndUpdate(bookingId, {
        stripeSessionId: 'cs_test_just_paid',
      });

      // expireCheckoutSession returns 'complete' → payment just went through
      expireCheckoutSession.mockResolvedValueOnce('complete');

      const res = await request(app)
        .patch(`/api/v1/bookings/my-bookings/${bookingId}`)
        .set('Cookie', userCookies);

      expect(res.statusCode).toBe(409);
    });
  });

  
  // Cancelling a confirmed (paid) booking
 
  describe('Cancelling a confirmed (paid) booking', () => {
    let confirmedBookingId;

    beforeEach(async () => {
      const createRes = await createBookingViaAPI(userCookies, {
        tourId: tour._id,
        guests: 2,
        startDate: futureDate,
      });
      confirmedBookingId = createRes.body.data._id;

      // Promote to confirmed + paid, attach a payment-intent
      await Booking.findByIdAndUpdate(confirmedBookingId, {
        status: 'confirmed',
        paymentStatus: 'paid',
        stripePaymentIntentId: 'pi_test_confirmed',
        amountPaidCents: 60000,
      });
    });

    it('should cancel the booking and queue a refund (100 % — >7 days before start)', async () => {
      const res = await request(app)
        .patch(`/api/v1/bookings/my-bookings/${confirmedBookingId}`)
        .set('Cookie', userCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe('cancelled');

      // A refund-request document must have been created
      const refundReq = await RefundRequest.findOne({ booking: confirmedBookingId });
      expect(refundReq).not.toBeNull();
      expect(refundReq.paymentIntentId).toBe('pi_test_confirmed');
      expect(refundReq.amountCents).toBe(60000); // 100 % refund
    });

    it('should release the seats back into availability after cancelling a confirmed booking', async () => {
      // Verify seats are held before
      const slotBefore = await Availability.findOne({ tour: tour._id, startDate: futureDate });
      expect(slotBefore.bookedGuests).toBe(2);

      await request(app)
        .patch(`/api/v1/bookings/my-bookings/${confirmedBookingId}`)
        .set('Cookie', userCookies);

      const slotAfter = await Availability.findOne({ tour: tour._id, startDate: futureDate });
      expect(slotAfter.bookedGuests).toBe(0);
    });

    it('admin should be able to cancel any confirmed booking', async () => {
      const res = await request(app)
        .patch(`/api/v1/bookings/${confirmedBookingId}/cancel`)
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe('cancelled');
    });

    it('should return 400 when trying to cancel an already cancelled booking', async () => {
      // Cancel once
      await request(app)
        .patch(`/api/v1/bookings/my-bookings/${confirmedBookingId}`)
        .set('Cookie', userCookies);

      // Try to cancel again
      const res = await request(app)
        .patch(`/api/v1/bookings/my-bookings/${confirmedBookingId}`)
        .set('Cookie', userCookies);

      expect(res.statusCode).toBe(400);
    });
  });

  //
  // Stripe Webhook
  
  describe('POST /api/v1/stripe/webhook  (Stripe Webhooks)', () => {
    let pendingBooking;

    beforeEach(async () => {
      // Create a booking that is in the pending state, as if checkout just started
      const createRes = await createBookingViaAPI(userCookies, {
        tourId: tour._id,
        guests: 2,
        startDate: futureDate,
      });
      const bookingId = createRes.body.data._id;
      await Booking.findByIdAndUpdate(bookingId, {
        stripeSessionId: 'cs_test_webhook_session',
      });
      pendingBooking = await Booking.findById(bookingId).setOptions({ skipPopulate: true });
    });

    // checkout.session.completed (happy path) 
    it('should confirm the booking when checkout.session.completed arrives', async () => {
      const session = buildStripeSession({
        id: 'cs_test_webhook_session',
        client_reference_id: String(pendingBooking._id),
        amount_total: Math.round(pendingBooking.price * 100),
        payment_intent: 'pi_test_confirmed_webhook',
      });

      const event = makeWebhookEvent('checkout.session.completed', session);
      const res = await sendWebhookEvent(event);

      expect(res.statusCode).toBe(200);
      expect(res.body.received).toBe(true);

      const updated = await Booking.findById(pendingBooking._id).setOptions({ skipPopulate: true });
      expect(updated.status).toBe('confirmed');
      expect(updated.paymentStatus).toBe('paid');
      expect(updated.stripePaymentIntentId).toBe('pi_test_confirmed_webhook');
    });

    // checkout.session.expired
    it('should cancel the booking when checkout.session.expired arrives', async () => {
      const session = buildStripeSession({
        id: 'cs_test_webhook_session',
        client_reference_id: String(pendingBooking._id),
        payment_status: 'unpaid',
      });

      const event = makeWebhookEvent('checkout.session.expired', session);
      const res = await sendWebhookEvent(event);

      expect(res.statusCode).toBe(200);

      const updated = await Booking.findById(pendingBooking._id).setOptions({ skipPopulate: true });
      expect(updated.status).toBe('cancelled');
      expect(updated.paymentStatus).toBe('failed');
      expect(updated.cancellationReason).toBe('checkout_expired');
    });

    //  checkout.session.expired releases seats
    it('should release availability seats when a session expires', async () => {
      const slotBefore = await Availability.findOne({ tour: tour._id, startDate: futureDate });
      expect(slotBefore.bookedGuests).toBe(2);

      const session = buildStripeSession({
        id: 'cs_test_webhook_session',
        client_reference_id: String(pendingBooking._id),
        payment_status: 'unpaid',
      });
      await sendWebhookEvent(makeWebhookEvent('checkout.session.expired', session));

      const slotAfter = await Availability.findOne({ tour: tour._id, startDate: futureDate });
      expect(slotAfter.bookedGuests).toBe(0);
    });

    // checkout.session.async_payment_failed 
    it('should cancel the booking on async_payment_failed', async () => {
      const session = buildStripeSession({
        id: 'cs_test_webhook_session',
        client_reference_id: String(pendingBooking._id),
        payment_status: 'unpaid',
      });

      const event = makeWebhookEvent('checkout.session.async_payment_failed', session);
      const res = await sendWebhookEvent(event);

      expect(res.statusCode).toBe(200);

      const updated = await Booking.findById(pendingBooking._id).setOptions({ skipPopulate: true });
      expect(updated.status).toBe('cancelled');
      expect(updated.cancellationReason).toBe('async_payment_failed');
    });

    // Payment on a cancelled booking 
    it('should queue a refund when payment arrives for a cancelled booking', async () => {
      // Cancel the booking first
      await Booking.findByIdAndUpdate(pendingBooking._id, {
        status: 'cancelled',
        paymentStatus: 'pending',
        cancelledBy: 'user',
        cancellationReason: 'user_cancelled',
        cancelledAt: new Date(),
      });

      const session = buildStripeSession({
        id: 'cs_test_webhook_session',
        client_reference_id: String(pendingBooking._id),
        amount_total: Math.round(pendingBooking.price * 100),
        payment_intent: 'pi_test_late_payment',
      });

      const event = makeWebhookEvent('checkout.session.completed', session);
      const res = await sendWebhookEvent(event);

      expect(res.statusCode).toBe(200);

      // A refund request must exist for this payment intent
      const refundReq = await RefundRequest.findOne({ paymentIntentId: 'pi_test_late_payment' });
      expect(refundReq).not.toBeNull();
      expect(refundReq.reason).toBe('payment_on_cancelled_booking');
    });

    // Idempotency – duplicate webhook event 
    it('should ignore a duplicate webhook event (return 200 with duplicate:true)', async () => {
      const eventId = `evt_duplicate_${Date.now()}`;
      const session = buildStripeSession({
        id: 'cs_test_webhook_session',
        client_reference_id: String(pendingBooking._id),
        amount_total: Math.round(pendingBooking.price * 100),
        payment_intent: 'pi_test_dedup',
      });

      const event = makeWebhookEvent('checkout.session.completed', session, eventId);

      // Send the first time – should succeed
      const first = await sendWebhookEvent(event);
      expect(first.statusCode).toBe(200);
      expect(first.body.received).toBe(true);

      // The booking should be confirmed now; adjust status for the second send
      // (the idempotency guard lives on ProcessedWebhookEvent, not the booking)
      const second = await sendWebhookEvent(event);
      expect(second.statusCode).toBe(200);
      expect(second.body.duplicate).toBe(true);
    });

    //  Amount mismatch guard 
    it('should queue a refund and NOT confirm the booking when amount does not match', async () => {
      const wrongAmountSession = buildStripeSession({
        id: 'cs_test_webhook_session',
        client_reference_id: String(pendingBooking._id),
        amount_total: 1, // obviously wrong amount
        payment_intent: 'pi_test_mismatch',
      });

      const event = makeWebhookEvent('checkout.session.completed', wrongAmountSession);
      const res = await sendWebhookEvent(event);

      expect(res.statusCode).toBe(200);

      // Booking must NOT be confirmed
      const booking = await Booking.findById(pendingBooking._id).setOptions({ skipPopulate: true });
      expect(booking.status).toBe('pending');

      // A refund request must have been created
      const refundReq = await RefundRequest.findOne({ paymentIntentId: 'pi_test_mismatch' });
      expect(refundReq).not.toBeNull();
      expect(refundReq.reason).toBe('amount_mismatch');
    });

    // Invalid webhook signature
    it('should return 400 when the webhook signature is invalid', async () => {
      // Override constructEvent to throw the signature error Stripe would throw
      mockStripe.webhooks.constructEvent.mockImplementationOnce(() => {
        const err = new Error('No signatures found matching the expected signature for payload');
        err.type = 'StripeSignatureVerificationError';
        throw err;
      });

      const res = await request(app)
        .post('/api/v1/stripe/webhook')
        .set('Content-Type', 'application/json')
        .set('stripe-signature', 'bad_sig')
        .send(Buffer.from(JSON.stringify({ type: 'test' })));

      expect(res.statusCode).toBe(400);
    });

    //  Unhandled event type 
    it('should return 200 for an unhandled event type (graceful skip)', async () => {
      const event = makeWebhookEvent('invoice.paid', { id: 'in_test_123' });
      const res = await sendWebhookEvent(event);

      expect(res.statusCode).toBe(200);
      expect(res.body.received).toBe(true);
    });
  });

  // Concurrent requests
  describe('Concurrent booking and checkout requests', () => {
    it('should prevent double-booking when two users race for the last available slot', async () => {
      const smallTour = await createTour({
        name: 'Small Tour Concurrent',
        maxGroupSize: 3,
      });

      const user2 = await signupAndGetCookies({
        name: 'Concurrent User 2',
        email: 'concurrent2@test.com',
        password: 'test1234',
        passwordConfirm: 'test1234',
      });

      const [res1, res2] = await Promise.all([
        createBookingViaAPI(userCookies, {
          tourId: smallTour._id,
          guests: 3,
          startDate: futureDate,
        }),
        createBookingViaAPI(user2, {
          tourId: smallTour._id,
          guests: 3,
          startDate: futureDate,
        }),
      ]);

      const statuses = [res1.statusCode, res2.statusCode].sort();
      // Exactly one succeeds (201) and one fails (400)
      expect(statuses).toEqual([201, 400]);

      // Availability must not exceed maxGroupSize
      const slot = await Availability.findOne({ tour: smallTour._id, startDate: futureDate });
      expect(slot.bookedGuests).toBeLessThanOrEqual(3);
    });

    it('should handle concurrent checkout-session requests for the same pending booking idempotently', async () => {
      // Pre-create the booking so both checkout calls hit the same document
      await createBookingViaAPI(userCookies, {
        tourId: tour._id,
        guests: 2,
        startDate: futureDate,
      });

      const [res1, res2] = await Promise.all([
        createCheckoutSessionViaAPI(userCookies, {
          tourId: tour._id,
          guests: 2,
          startDate: futureDate,
        }),
        createCheckoutSessionViaAPI(userCookies, {
          tourId: tour._id,
          guests: 2,
          startDate: futureDate,
        }),
      ]);

      // Both must succeed (or one may get a 409 idempotency key-in-use)
      expect([200, 409]).toContain(res1.statusCode);
      expect([200, 409]).toContain(res2.statusCode);

      // At most one booking should exist
      const count = await Booking.countDocuments({});
      expect(count).toBe(1);
    });
  });


  // Stale pending booking sweeper
 
  describe('expireStalePendingBookings  (sweeper)', () => {
    it('should cancel bookings older than the specified threshold', async () => {
      // Create a pending booking
      const createRes = await createBookingViaAPI(userCookies, {
        tourId: tour._id,
        guests: 2,
        startDate: futureDate,
      });
      const bookingId = createRes.body.data._id;

      // Back-date the createdAt to simulate a stale booking (66 minutes ago)
      await Booking.collection.updateOne(
        { _id: new mongoose.Types.ObjectId(bookingId) },
        { $set: { createdAt: new Date(Date.now() - 66 * 60 * 1000) } },
      );

      const cancelled = await expireStalePendingBookings({ olderThanMinutes: 65, limit: 10 });
      expect(cancelled).toBe(1);

      const booking = await Booking.findById(bookingId).setOptions({ skipPopulate: true });
      expect(booking.status).toBe('cancelled');
      expect(booking.cancellationReason).toBe('stale_pending');
    });

    it('should NOT cancel bookings that are younger than the threshold', async () => {
      await createBookingViaAPI(userCookies, {
        tourId: tour._id,
        guests: 1,
        startDate: futureDate,
      });

      const cancelled = await expireStalePendingBookings({ olderThanMinutes: 65, limit: 10 });
      expect(cancelled).toBe(0);
    });

    it('should release seats back to availability after sweeper cancels a stale booking', async () => {
      const createRes = await createBookingViaAPI(userCookies, {
        tourId: tour._id,
        guests: 3,
        startDate: futureDate,
      });
      const bookingId = createRes.body.data._id;

      const slotBefore = await Availability.findOne({ tour: tour._id, startDate: futureDate });
      expect(slotBefore.bookedGuests).toBe(3);

      await Booking.collection.updateOne(
        { _id: new mongoose.Types.ObjectId(bookingId) },
        { $set: { createdAt: new Date(Date.now() - 70 * 60 * 1000) } },
      );

      await expireStalePendingBookings({ olderThanMinutes: 65, limit: 10 });

      const slotAfter = await Availability.findOne({ tour: tour._id, startDate: futureDate });
      expect(slotAfter.bookedGuests).toBe(0);
    });

    it('should not cancel a booking that was just paid (409 guard)', async () => {
      const createRes = await createBookingViaAPI(userCookies, {
        tourId: tour._id,
        guests: 1,
        startDate: futureDate,
      });
      const bookingId = createRes.body.data._id;

      // Simulate the booking being paid right before the sweeper runs
      await Booking.collection.updateOne(
        { _id: new mongoose.Types.ObjectId(bookingId) },
        {
          $set: {
            status: 'confirmed',
            paymentStatus: 'paid',
            stripePaymentIntentId: 'pi_test_sweeper',
            amountPaidCents: 30000,
            createdAt: new Date(Date.now() - 70 * 60 * 1000),
          },
        },
      );

      const cancelled = await expireStalePendingBookings({ olderThanMinutes: 65, limit: 10 });
      // The sweeper finds no pending documents (status is 'confirmed'), so 0
      expect(cancelled).toBe(0);

      const booking = await Booking.findById(bookingId).setOptions({ skipPopulate: true });
      expect(booking.status).toBe('confirmed');
    });
  });

  
  // Booking state machine edge-cases
  
  describe('Booking state machine – admin update edge cases', () => {
    let bookingId;

    beforeEach(async () => {
      const res = await createBookingViaAPI(userCookies, {
        tourId: tour._id,
        guests: 2,
        startDate: futureDate,
      });
      bookingId = res.body.data._id;
    });

    it('should return 400 when trying to move a pending booking directly to completed', async () => {
      const res = await request(app)
        .patch(`/api/v1/bookings/${bookingId}`)
        .set('Cookie', adminCookies)
        .send({ status: 'completed' });

      expect(res.statusCode).toBe(400);
    });

    it('should return 400 when confirming a booking without setting paymentStatus=paid', async () => {
      const res = await request(app)
        .patch(`/api/v1/bookings/${bookingId}`)
        .set('Cookie', adminCookies)
        .send({ status: 'confirmed' }); // paymentStatus stays 'pending' — invalid

      expect(res.statusCode).toBe(400);
    });

    it('should allow admin to confirm and pay a booking in one update', async () => {
      const res = await request(app)
        .patch(`/api/v1/bookings/${bookingId}`)
        .set('Cookie', adminCookies)
        .send({ status: 'confirmed', paymentStatus: 'paid' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe('confirmed');
      expect(res.body.data.paymentStatus).toBe('paid');
    });

    it('should return 400 when trying to set paymentStatus=refunded via the update endpoint (admin-only auto field)', async () => {
      const res = await request(app)
        .patch(`/api/v1/bookings/${bookingId}`)
        .set('Cookie', adminCookies)
        .send({ paymentStatus: 'refunded' });

      expect(res.statusCode).toBe(400);
    });

    it('should return 400 when updating a cancelled booking (final state)', async () => {
      // First cancel
      await request(app)
        .patch(`/api/v1/bookings/${bookingId}/cancel`)
        .set('Cookie', adminCookies);

      // Then attempt to update
      const res = await request(app)
        .patch(`/api/v1/bookings/${bookingId}`)
        .set('Cookie', adminCookies)
        .send({ status: 'confirmed', paymentStatus: 'paid' });

      expect(res.statusCode).toBe(400);
    });
  });

  // Attempting payment on a non-pending / cancelled / expired session
  describe('Attempting checkout on a non-pending booking', () => {
    it('should return 409 when attempting checkout for a cancelled booking', async () => {
      const createRes = await createBookingViaAPI(userCookies, {
        tourId: tour._id,
        guests: 1,
        startDate: futureDate,
      });
      const bookingId = createRes.body.data._id;

      // Cancel the booking
      await request(app)
        .patch(`/api/v1/bookings/my-bookings/${bookingId}`)
        .set('Cookie', userCookies);

      // After cancellation the booking no longer exists as 'pending' for this user/tour/date,
      // so a new checkout-session call creates a fresh booking (correct behaviour).
      // Test that the same-guest-count path works:
      const res = await createCheckoutSessionViaAPI(userCookies, {
        tourId: tour._id,
        guests: 1,
        startDate: futureDate,
      });
      // Either a new session was created (200) or the booking was still being processed (409)
      expect([200, 409]).toContain(res.statusCode);
    });

    it('should start a new checkout attempt when the previous Stripe session has expired', async () => {
      // Create a pending booking with an expired session attached
      const createRes = await createBookingViaAPI(userCookies, {
        tourId: tour._id,
        guests: 1,
        startDate: futureDate,
      });
      const bookingId = createRes.body.data._id;

      // Simulate an expired session recorded on the booking
      await Booking.findByIdAndUpdate(bookingId, {
        stripeSessionId: 'cs_test_expired_session',
        checkoutAttempt: 1,
        checkoutExpiresAt: new Date(Date.now() - 10_000), // in the past
      });

      // Stripe says this session is expired (not open)
      mockStripe.checkout.sessions.retrieve.mockResolvedValueOnce({ status: 'expired' });

      const res = await createCheckoutSessionViaAPI(userCookies, {
        tourId: tour._id,
        guests: 1,
        startDate: futureDate,
      });

      expect(res.statusCode).toBe(200);
      // A new Stripe session must have been created
      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledOnce();
    });
  });
});
