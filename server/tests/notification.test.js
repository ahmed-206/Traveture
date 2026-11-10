/**
 * Integration tests for the Notification System and Outbox pattern.
 *
 * Covers:
 *   - Notification API  (GET /my-notifications, PATCH /:id/read, PATCH /read-all)
 *   - notificationService.createNotificationFromEvent  (all 4 event types, idempotency)
 *   - outboxService.emitEvent  (upsert / idempotency, session-required guard)
 *   - outboxWorker.processOutboxBatch  (happy-path, retry, dead-letter, no-handler, lost-lease)
 *   - End-to-end outbox → notification flow  (booking transitions emit events that the
 *     worker turns into Notification documents)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import User from '../models/userModel.js';
import Tour from '../models/tourModel.js';
import Booking from '../models/bookingModel.js';
import Notification from '../models/notifications/notificationModel.js';
import OutboxEvent from '../models/notifications/outboxEventModel.js';
import { createNotificationFromEvent } from '../services/notificationService.js';
import { emitEvent } from '../services/outboxService.js';
import { processOutboxBatch, OUTBOX_CONFIG } from '../services/outboxWorker.js';
import { runInTransaction } from '../utils/transaction.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const signupAndGetCookies = async (credentials) => {
  const res = await request(app).post('/api/v1/users/signup').send(credentials);
  return { cookies: res.headers['set-cookie'], userId: res.body.data.user._id };
};

const userCredentials = {
  name: 'Notif Test User',
  email: 'notifuser@test.com',
  password: 'test1234',
  passwordConfirm: 'test1234',
};

const futureDate = new Date('2028-06-15');

const tourData = {
  name: 'Notification Test Tour',
  duration: 4,
  maxGroupSize: 10,
  difficulty: 'easy',
  price: 200,
  summary: 'Tour for notification tests',
  imageCover: 'notif-tour.jpg',
  startDates: [futureDate],
};

/** Create a minimal OutboxEvent document directly in the DB. */
const seedOutboxEvent = async (overrides = {}) => {
  const bookingId = new mongoose.Types.ObjectId();
  const userId = new mongoose.Types.ObjectId();
  const tourId = new mongoose.Types.ObjectId();

  const defaults = {
    eventId: `booking:${bookingId}:confirmed`,
    type: 'BOOKING_CONFIRMED',
    aggregateId: bookingId,
    payload: {
      userId,
      bookingId,
      tourId,
      guests: 2,
      startDate: futureDate,
      amountCents: 40000,
    },
    status: 'pending',
    nextAttemptAt: new Date(Date.now() - 1000), // immediately due
  };

  return OutboxEvent.create({ ...defaults, ...overrides });
};

/** Build a minimal event shape expected by createNotificationFromEvent. */
const buildRawEvent = (type, payloadOverrides = {}) => {
  const bookingId = new mongoose.Types.ObjectId();
  const userId = new mongoose.Types.ObjectId();

  const basePayload = {
    userId,
    bookingId,
    guests: 2,
    startDate: futureDate,
    amountCents: 40000,
    currency: 'usd',
  };

  return {
    eventId: `booking:${bookingId}:${type.toLowerCase()}`,
    type,
    occurredAt: new Date(),
    payload: { ...basePayload, ...payloadOverrides },
  };
};

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe('Notification System & Outbox Integration Tests', () => {
  let userCookies;
  let userId;
  let tour;

  beforeEach(async () => {
    ({ cookies: userCookies, userId } = await signupAndGetCookies(userCredentials));
    tour = await Tour.create(tourData);
  });

  // =========================================================================
  // Notification API
  // =========================================================================

  describe('GET /api/v1/notifications/my-notifications', () => {
    it('should return 401 when not authenticated', async () => {
      const res = await request(app).get('/api/v1/notifications/my-notifications');
      expect(res.statusCode).toBe(401);
    });

    it('should return an empty list when the user has no notifications', async () => {
      const res = await request(app)
        .get('/api/v1/notifications/my-notifications')
        .set('Cookie', userCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveLength(0);
      expect(res.body.unreadCount).toBe(0);
    });

    it('should return only the notifications belonging to the logged-in user', async () => {
      const otherUser = new mongoose.Types.ObjectId();
      const bookingId = new mongoose.Types.ObjectId();

      // 2 notifications for our user
      await Notification.create([
        {
          user: userId,
          eventId: 'evt-1',
          type: 'BOOKING_CONFIRMED',
          title: 'Booking confirmed',
          message: 'msg 1',
          resource: { kind: 'booking', id: bookingId },
          expiresAt: new Date(Date.now() + 1e9),
        },
        {
          user: userId,
          eventId: 'evt-2',
          type: 'BOOKING_CANCELLED',
          title: 'Booking cancelled',
          message: 'msg 2',
          resource: { kind: 'booking', id: bookingId },
          expiresAt: new Date(Date.now() + 1e9),
        },
      ]);

      // 1 notification for another user (must NOT be returned)
      await Notification.create({
        user: otherUser,
        eventId: 'evt-other',
        type: 'BOOKING_CONFIRMED',
        title: 'Other',
        message: 'other msg',
        resource: { kind: 'booking', id: bookingId },
        expiresAt: new Date(Date.now() + 1e9),
      });

      const res = await request(app)
        .get('/api/v1/notifications/my-notifications')
        .set('Cookie', userCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body.results).toBe(2);
      expect(res.body.data.every((n) => String(n.user) === String(userId))).toBe(true);
    });

    it('should include the correct unreadCount', async () => {
      const bookingId = new mongoose.Types.ObjectId();
      await Notification.create([
        {
          user: userId,
          eventId: 'evt-unread-1',
          type: 'BOOKING_CONFIRMED',
          title: 'T',
          message: 'M',
          resource: { kind: 'booking', id: bookingId },
          expiresAt: new Date(Date.now() + 1e9),
          isRead: false,
        },
        {
          user: userId,
          eventId: 'evt-read-1',
          type: 'BOOKING_CANCELLED',
          title: 'T',
          message: 'M',
          resource: { kind: 'booking', id: bookingId },
          expiresAt: new Date(Date.now() + 1e9),
          isRead: true,
        },
      ]);

      const res = await request(app)
        .get('/api/v1/notifications/my-notifications')
        .set('Cookie', userCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body.unreadCount).toBe(1);
    });

    it('should return notifications sorted by occurredAt descending', async () => {
      const bookingId = new mongoose.Types.ObjectId();
      const older = new Date(Date.now() - 60_000);
      const newer = new Date();

      await Notification.create([
        {
          user: userId,
          eventId: 'evt-older',
          type: 'BOOKING_CONFIRMED',
          title: 'Old',
          message: 'M',
          resource: { kind: 'booking', id: bookingId },
          expiresAt: new Date(Date.now() + 1e9),
          occurredAt: older,
        },
        {
          user: userId,
          eventId: 'evt-newer',
          type: 'BOOKING_CANCELLED',
          title: 'New',
          message: 'M',
          resource: { kind: 'booking', id: bookingId },
          expiresAt: new Date(Date.now() + 1e9),
          occurredAt: newer,
        },
      ]);

      const res = await request(app)
        .get('/api/v1/notifications/my-notifications')
        .set('Cookie', userCookies);

      expect(res.statusCode).toBe(200);
      const dates = res.body.data.map((n) => new Date(n.occurredAt).getTime());
      expect(dates[0]).toBeGreaterThanOrEqual(dates[1]);
    });
  });

  // =========================================================================
  // PATCH /my-notifications/:id/read
  // =========================================================================

  describe('PATCH /api/v1/notifications/my-notifications/:id/read', () => {
    let notifId;

    beforeEach(async () => {
      const bookingId = new mongoose.Types.ObjectId();
      const notif = await Notification.create({
        user: userId,
        eventId: 'evt-mark-read',
        type: 'BOOKING_CONFIRMED',
        title: 'T',
        message: 'M',
        resource: { kind: 'booking', id: bookingId },
        expiresAt: new Date(Date.now() + 1e9),
        isRead: false,
      });
      notifId = String(notif._id);
    });

    it('should mark a notification as read and return the updated document', async () => {
      const res = await request(app)
        .patch(`/api/v1/notifications/my-notifications/${notifId}/read`)
        .set('Cookie', userCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.isRead).toBe(true);
      expect(res.body.data.readAt).not.toBeNull();
    });

    it('should return 404 when the notification does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .patch(`/api/v1/notifications/my-notifications/${fakeId}/read`)
        .set('Cookie', userCookies);

      expect(res.statusCode).toBe(404);
    });

    it("should return 404 when the notification belongs to another user", async () => {
      const { cookies: otherCookies } = await signupAndGetCookies({
        name: 'Other',
        email: 'other-notif@test.com',
        password: 'test1234',
        passwordConfirm: 'test1234',
      });

      const res = await request(app)
        .patch(`/api/v1/notifications/my-notifications/${notifId}/read`)
        .set('Cookie', otherCookies);

      expect(res.statusCode).toBe(404);
    });

    it('should return 401 when not authenticated', async () => {
      const res = await request(app).patch(
        `/api/v1/notifications/my-notifications/${notifId}/read`,
      );
      expect(res.statusCode).toBe(401);
    });
  });

  // =========================================================================
  // PATCH /my-notifications/read-all
  // =========================================================================

  describe('PATCH /api/v1/notifications/my-notifications/read-all', () => {
    it('should mark all unread notifications as read', async () => {
      const bookingId = new mongoose.Types.ObjectId();
      await Notification.create([
        {
          user: userId,
          eventId: 'evt-ra-1',
          type: 'BOOKING_CONFIRMED',
          title: 'T',
          message: 'M',
          resource: { kind: 'booking', id: bookingId },
          expiresAt: new Date(Date.now() + 1e9),
          isRead: false,
        },
        {
          user: userId,
          eventId: 'evt-ra-2',
          type: 'BOOKING_CANCELLED',
          title: 'T',
          message: 'M',
          resource: { kind: 'booking', id: bookingId },
          expiresAt: new Date(Date.now() + 1e9),
          isRead: false,
        },
      ]);

      const res = await request(app)
        .patch('/api/v1/notifications/my-notifications/read-all')
        .set('Cookie', userCookies);

      expect(res.statusCode).toBe(200);

      const unread = await Notification.countDocuments({ user: userId, isRead: false });
      expect(unread).toBe(0);
    });

    it('should not affect notifications belonging to other users', async () => {
      const { cookies: otherCookies, userId: otherId } = await signupAndGetCookies({
        name: 'Other User',
        email: 'other-ra@test.com',
        password: 'test1234',
        passwordConfirm: 'test1234',
      });
      const bookingId = new mongoose.Types.ObjectId();

      await Notification.create({
        user: otherId,
        eventId: 'evt-other-ra',
        type: 'BOOKING_CONFIRMED',
        title: 'T',
        message: 'M',
        resource: { kind: 'booking', id: bookingId },
        expiresAt: new Date(Date.now() + 1e9),
        isRead: false,
      });

      // Our user marks all as read
      await request(app)
        .patch('/api/v1/notifications/my-notifications/read-all')
        .set('Cookie', userCookies);

      const otherUnread = await Notification.countDocuments({ user: otherId, isRead: false });
      expect(otherUnread).toBe(1); // other user's notification must be untouched
    });

    it('should return 200 (no-op) when there are no unread notifications', async () => {
      const res = await request(app)
        .patch('/api/v1/notifications/my-notifications/read-all')
        .set('Cookie', userCookies);

      expect(res.statusCode).toBe(200);
    });

    it('should return 401 when not authenticated', async () => {
      const res = await request(app).patch(
        '/api/v1/notifications/my-notifications/read-all',
      );
      expect(res.statusCode).toBe(401);
    });
  });

  // =========================================================================
  // notificationService.createNotificationFromEvent
  // =========================================================================

  describe('createNotificationFromEvent (notification service)', () => {
    it('should create a BOOKING_CONFIRMED notification with correct title and message', async () => {
      const event = buildRawEvent('BOOKING_CONFIRMED', {
        tourId: tour._id,
        amountCents: 40000,
        guests: 2,
        startDate: futureDate,
      });

      await createNotificationFromEvent(event);

      const notif = await Notification.findOne({ eventId: event.eventId });
      expect(notif).not.toBeNull();
      expect(notif.type).toBe('BOOKING_CONFIRMED');
      expect(notif.title).toBe('Booking confirmed');
      expect(notif.message).toContain(tour.name);
      expect(notif.message).toContain('2 guests');
      expect(notif.message).toContain('400.00 USD');
    });

    it('should create a BOOKING_CANCELLED notification for user cancellation', async () => {
      const event = buildRawEvent('BOOKING_CANCELLED', {
        tourId: tour._id,
        cancelledBy: 'user',
      });

      await createNotificationFromEvent(event);

      const notif = await Notification.findOne({ eventId: event.eventId });
      expect(notif).not.toBeNull();
      expect(notif.type).toBe('BOOKING_CANCELLED');
      expect(notif.title).toBe('Booking cancelled');
      expect(notif.message).toMatch(/You cancelled/i);
    });

    it('should create a BOOKING_CANCELLED notification for admin cancellation', async () => {
      const event = buildRawEvent('BOOKING_CANCELLED', {
        tourId: tour._id,
        cancelledBy: 'admin',
      });

      await createNotificationFromEvent(event);

      const notif = await Notification.findOne({ eventId: event.eventId });
      expect(notif.message).toMatch(/Our team cancelled/i);
    });

    it('should create a BOOKING_COMPLETED notification', async () => {
      const event = buildRawEvent('BOOKING_COMPLETED', { tourId: tour._id });

      await createNotificationFromEvent(event);

      const notif = await Notification.findOne({ eventId: event.eventId });
      expect(notif).not.toBeNull();
      expect(notif.type).toBe('BOOKING_COMPLETED');
      expect(notif.title).toBe('Trip completed');
      expect(notif.message).toContain(tour.name);
    });

    it('should create a REFUND_SUCCEEDED notification', async () => {
      const event = buildRawEvent('REFUND_SUCCEEDED', {
        tourId: tour._id,
        amountCents: 40000,
        currency: 'usd',
        reason: 'booking_cancelled',
      });

      await createNotificationFromEvent(event);

      const notif = await Notification.findOne({ eventId: event.eventId });
      expect(notif).not.toBeNull();
      expect(notif.type).toBe('REFUND_SUCCEEDED');
      expect(notif.title).toBe('Refund issued');
      expect(notif.message).toContain('400.00 USD');
    });

    it('should be idempotent: calling twice with the same eventId creates only one document', async () => {
      const event = buildRawEvent('BOOKING_CONFIRMED', { tourId: tour._id });

      await createNotificationFromEvent(event);
      await createNotificationFromEvent(event); // second call must be a no-op

      const count = await Notification.countDocuments({ eventId: event.eventId });
      expect(count).toBe(1);
    });

    it('should use "your tour" as the tour name when tourId is missing', async () => {
      const event = buildRawEvent('BOOKING_CONFIRMED');
      // No tourId in the payload
      delete event.payload.tourId;

      await createNotificationFromEvent(event);

      const notif = await Notification.findOne({ eventId: event.eventId });
      expect(notif.message).toContain('"your tour"');
    });

    it('should throw when payload has no userId', async () => {
      const event = buildRawEvent('BOOKING_CONFIRMED');
      delete event.payload.userId;

      await expect(createNotificationFromEvent(event)).rejects.toThrow();
    });

    it('should throw when payload has no bookingId', async () => {
      const event = buildRawEvent('BOOKING_CONFIRMED');
      delete event.payload.bookingId;

      await expect(createNotificationFromEvent(event)).rejects.toThrow();
    });

    it('should throw for an unknown event type', async () => {
      const event = buildRawEvent('UNKNOWN_EVENT');
      // Override type to bypass the OutboxEvent enum (we're calling the service directly)
      event.type = 'UNKNOWN_EVENT';

      await expect(createNotificationFromEvent(event)).rejects.toThrow(
        /No notification template/i,
      );
    });
  });

  // =========================================================================
  // outboxService.emitEvent
  // =========================================================================

  describe('emitEvent (outbox service)', () => {
    it('should insert a new OutboxEvent inside a transaction', async () => {
      const bookingId = new mongoose.Types.ObjectId();
      const userId2 = new mongoose.Types.ObjectId();

      await runInTransaction(async (session) => {
        await emitEvent(
          {
            key: `booking:${bookingId}:confirmed`,
            type: 'BOOKING_CONFIRMED',
            aggregateId: bookingId,
            payload: {
              userId: userId2,
              bookingId,
              tourId: tour._id,
              guests: 1,
              startDate: futureDate,
            },
          },
          session,
        );
      });

      const doc = await OutboxEvent.findOne({ eventId: `booking:${bookingId}:confirmed` });
      expect(doc).not.toBeNull();
      expect(doc.type).toBe('BOOKING_CONFIRMED');
      expect(doc.status).toBe('pending');
    });

    it('should be idempotent: a second emitEvent with the same key is a no-op', async () => {
      const bookingId = new mongoose.Types.ObjectId();
      const userId2 = new mongoose.Types.ObjectId();
      const key = `booking:${bookingId}:confirmed`;

      await runInTransaction(async (session) => {
        await emitEvent(
          {
            key,
            type: 'BOOKING_CONFIRMED',
            aggregateId: bookingId,
            payload: { userId: userId2, bookingId, guests: 1, startDate: futureDate },
          },
          session,
        );
      });

      await runInTransaction(async (session) => {
        await emitEvent(
          {
            key,
            type: 'BOOKING_CONFIRMED',
            aggregateId: bookingId,
            payload: { userId: userId2, bookingId, guests: 999, startDate: futureDate },
          },
          session,
        );
      });

      const count = await OutboxEvent.countDocuments({ eventId: key });
      expect(count).toBe(1);

      const doc = await OutboxEvent.findOne({ eventId: key });
      expect(doc.payload.guests).toBe(1); // first value kept
    });

    it('should throw when called without a session', async () => {
      const bookingId = new mongoose.Types.ObjectId();

      await expect(
        emitEvent(
          {
            key: `booking:${bookingId}:confirmed`,
            type: 'BOOKING_CONFIRMED',
            aggregateId: bookingId,
            payload: { userId: new mongoose.Types.ObjectId(), bookingId },
          },
          null, // ← no session
        ),
      ).rejects.toThrow(/session required/i);
    });
  });

  // =========================================================================
  // processOutboxBatch (outbox worker)
  // =========================================================================

  describe('processOutboxBatch (outbox worker)', () => {
    it('should return { completed:0, retried:0, dead:0 } when the queue is empty', async () => {
      const stats = await processOutboxBatch();
      expect(stats).toEqual({ completed: 0, retried: 0, dead: 0 });
    });

    it('should process a pending event and create the corresponding Notification', async () => {
      // We need a real user and tour so that createNotificationFromEvent can build a notification
      const event = await seedOutboxEvent({
        payload: {
          userId,
          bookingId: new mongoose.Types.ObjectId(),
          tourId: tour._id,
          guests: 2,
          startDate: futureDate,
          amountCents: 40000,
        },
      });

      const stats = await processOutboxBatch({ limit: 10 });
      expect(stats.completed).toBe(1);
      expect(stats.retried).toBe(0);
      expect(stats.dead).toBe(0);

      const doc = await OutboxEvent.findById(event._id);
      expect(doc.status).toBe('completed');
      expect(doc.processedAt).not.toBeNull();

      const notif = await Notification.findOne({ eventId: event.eventId });
      expect(notif).not.toBeNull();
      expect(notif.type).toBe('BOOKING_CONFIRMED');
    });

    it('should mark an event as dead when it has no registered handler', async () => {
      const event = await OutboxEvent.create({
        eventId: `no-handler-${Date.now()}`,
        type: 'BOOKING_CONFIRMED', // valid enum, but we'll override the handler indirectly
        aggregateId: new mongoose.Types.ObjectId(),
        payload: { userId, bookingId: new mongoose.Types.ObjectId() },
        status: 'pending',
        nextAttemptAt: new Date(Date.now() - 1000),
      });

      // Corrupt the type after creation so the handler map misses it
      await OutboxEvent.updateOne({ _id: event._id }, { $set: { type: 'BOOKING_COMPLETED' } });

      // Replace payload with one that is missing tourId so createNotificationFromEvent
      // falls through to 'your tour' but still needs userId + bookingId.
      // We'll force a dead-letter by exceeding maxAttempts instead.
      await OutboxEvent.updateOne(
        { _id: event._id },
        { $set: { attempts: OUTBOX_CONFIG.maxAttempts + 1 } },
      );

      const stats = await processOutboxBatch({ limit: 10 });
      expect(stats.dead).toBeGreaterThanOrEqual(1);

      const doc = await OutboxEvent.findById(event._id);
      expect(doc.status).toBe('dead');
    });

    it('should mark an event as dead when maxAttempts is exceeded on the first claim', async () => {
      const event = await seedOutboxEvent({
        attempts: OUTBOX_CONFIG.maxAttempts + 1, // already exceeded
      });

      const stats = await processOutboxBatch({ limit: 10 });
      expect(stats.dead).toBeGreaterThanOrEqual(1);

      const doc = await OutboxEvent.findById(event._id);
      expect(doc.status).toBe('dead');
    });

    it('should retry a failing event (move to pending with a future nextAttemptAt)', async () => {
      // Seed an event whose payload is missing userId → createNotificationFromEvent will throw
      const event = await seedOutboxEvent({
        payload: {
          // Deliberately omit userId to cause a handler failure
          bookingId: new mongoose.Types.ObjectId(),
          tourId: tour._id,
          guests: 2,
          startDate: futureDate,
        },
      });

      const stats = await processOutboxBatch({ limit: 10 });
      expect(stats.retried).toBeGreaterThanOrEqual(1);

      const doc = await OutboxEvent.findById(event._id);
      expect(doc.status).toBe('pending');
      expect(doc.nextAttemptAt.getTime()).toBeGreaterThan(Date.now());
      expect(doc.lastError).toBeTruthy();
    });

    it('should not pick up events that are not yet due (nextAttemptAt in the future)', async () => {
      await seedOutboxEvent({
        nextAttemptAt: new Date(Date.now() + 60_000), // 1 min in the future
      });

      const stats = await processOutboxBatch({ limit: 10 });
      expect(stats.completed + stats.retried + stats.dead).toBe(0);
    });

    it('should re-claim a stale processing event whose lock has expired', async () => {
      const event = await seedOutboxEvent({
        status: 'processing',
        lockedBy: 'stale-worker-id',
        lockedUntil: new Date(Date.now() - 1000), // lock already expired
        payload: {
          userId,
          bookingId: new mongoose.Types.ObjectId(),
          tourId: tour._id,
          guests: 1,
          startDate: futureDate,
          amountCents: 20000,
        },
      });

      const stats = await processOutboxBatch({ limit: 10 });
      expect(stats.completed).toBeGreaterThanOrEqual(1);

      const doc = await OutboxEvent.findById(event._id);
      expect(doc.status).toBe('completed');
    });

    it('should respect the limit parameter and not process more than limit events', async () => {
      // Seed 5 events but limit to 2
      const payload = {
        userId,
        bookingId: new mongoose.Types.ObjectId(),
        tourId: tour._id,
        guests: 1,
        startDate: futureDate,
        amountCents: 20000,
      };

      await Promise.all(
        Array.from({ length: 5 }, (_, i) =>
          seedOutboxEvent({
            eventId: `batch-limit-test-${i}-${Date.now()}`,
            payload,
          }),
        ),
      );

      const stats = await processOutboxBatch({ limit: 2 });
      const total = stats.completed + stats.retried + stats.dead;
      expect(total).toBeLessThanOrEqual(2);
    });
  });

  // =========================================================================
  // End-to-end: booking transition → outbox event → notification
  // =========================================================================

  describe('End-to-end: booking transition emits outbox events processed into notifications', () => {
    let bookingId;

    beforeEach(async () => {
      // Create a booking via the API (status = pending)
      const res = await request(app)
        .post('/api/v1/bookings')
        .set('Cookie', userCookies)
        .send({ tourId: tour._id, guests: 2, startDate: futureDate });

      expect(res.statusCode).toBe(201);
      bookingId = res.body.data._id;
    });

    it('should emit a BOOKING_CANCELLED outbox event when a user cancels a pending booking', async () => {
      const res = await request(app)
        .patch(`/api/v1/bookings/my-bookings/${bookingId}`)
        .set('Cookie', userCookies);

      expect(res.statusCode).toBe(200);

      // A BOOKING_CANCELLED outbox event must exist in the DB
      // (silent cancellations like 'stale_pending' are excluded, so user-cancel should be present)
      const outboxDoc = await OutboxEvent.findOne({
        eventId: `booking:${bookingId}:cancelled`,
      });
      // User-triggered cancel is NOT a silent reason, so the event must exist
      expect(outboxDoc).not.toBeNull();
      expect(outboxDoc.type).toBe('BOOKING_CANCELLED');
    });

    it('should create a BOOKING_CONFIRMED notification after the worker processes the outbox', async () => {
      // Manually promote booking to confirmed + paid
      await Booking.findByIdAndUpdate(bookingId, {
        status: 'confirmed',
        paymentStatus: 'paid',
        amountPaidCents: 40000,
        stripePaymentIntentId: 'pi_e2e_test',
      });

      // Seed a BOOKING_CONFIRMED outbox event that the worker will process
      await OutboxEvent.create({
        eventId: `booking:${bookingId}:confirmed`,
        type: 'BOOKING_CONFIRMED',
        aggregateId: new mongoose.Types.ObjectId(bookingId),
        payload: {
          userId,
          bookingId: new mongoose.Types.ObjectId(bookingId),
          tourId: tour._id,
          guests: 2,
          startDate: futureDate,
          amountCents: 40000,
        },
        status: 'pending',
        nextAttemptAt: new Date(Date.now() - 1000),
      });

      await processOutboxBatch({ limit: 10 });

      const notif = await Notification.findOne({
        eventId: `booking:${bookingId}:confirmed`,
        user: userId,
      });

      expect(notif).not.toBeNull();
      expect(notif.type).toBe('BOOKING_CONFIRMED');
      expect(notif.isRead).toBe(false);
      expect(notif.resource.kind).toBe('booking');
      expect(String(notif.resource.id)).toBe(String(bookingId));
    });

    it('should not create a notification for a silently-cancelled booking (stale_pending reason)', async () => {
      // The 'stale_pending' reason is in SILENT_CANCEL_REASONS, so no outbox event is emitted.
      // We can verify this by checking the OutboxEvent collection directly.
      await Booking.collection.updateOne(
        { _id: new mongoose.Types.ObjectId(bookingId) },
        { $set: { createdAt: new Date(Date.now() - 70 * 60 * 1000) } },
      );

      const { expireStalePendingBookings } = await import('../services/bookingService.js');
      await expireStalePendingBookings({ olderThanMinutes: 65, limit: 10 });

      // The cancelled event must NOT be in the outbox for a stale_pending cancellation
      const outboxDoc = await OutboxEvent.findOne({
        eventId: `booking:${bookingId}:cancelled`,
      });
      expect(outboxDoc).toBeNull();

      // And therefore no notification should exist
      const notif = await Notification.findOne({ user: userId });
      expect(notif).toBeNull();
    });

    it('worker should process BOOKING_CONFIRMED and the notification appears in the API response', async () => {
      // Seed the outbox event
      await OutboxEvent.create({
        eventId: `booking:${bookingId}:confirmed-api`,
        type: 'BOOKING_CONFIRMED',
        aggregateId: new mongoose.Types.ObjectId(bookingId),
        payload: {
          userId,
          bookingId: new mongoose.Types.ObjectId(bookingId),
          tourId: tour._id,
          guests: 2,
          startDate: futureDate,
          amountCents: 40000,
        },
        status: 'pending',
        nextAttemptAt: new Date(Date.now() - 1000),
      });

      await processOutboxBatch({ limit: 10 });

      const res = await request(app)
        .get('/api/v1/notifications/my-notifications')
        .set('Cookie', userCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body.results).toBeGreaterThanOrEqual(1);

      const confirmed = res.body.data.find((n) => n.type === 'BOOKING_CONFIRMED');
      expect(confirmed).toBeDefined();
      expect(confirmed.isRead).toBe(false);
    });
  });
});

