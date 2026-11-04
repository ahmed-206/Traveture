import crypto from "crypto";
import OutboxEvent from "../models/notifications/outboxEventModel.js";
import { createNotificationFromEvent } from "./notificationService.js";

export const OUTBOX_CONFIG = {
  lockMs: 60_000, 
  maxAttempts: 8, 
  baseBackoffMs: 30_000, 
  maxBackoffMs: 60 * 60_000, 
  completedRetentionMs: 30 * 24 * 60 * 60 * 1000, 
};

const HANDLERS = {
  BOOKING_CONFIRMED: createNotificationFromEvent,
  BOOKING_CANCELLED: createNotificationFromEvent,
  BOOKING_COMPLETED: createNotificationFromEvent,
  REFUND_SUCCEEDED: createNotificationFromEvent,
};


const claimNext = (workerId) => {

  const now = new Date();

  return OutboxEvent.findOneAndUpdate(
    {
      $or: [
        { status: "pending", nextAttemptAt: { $lte: now } },
        { status: "processing", lockedUntil: { $lt: now } },
      ],
    },
    {
      $set: {
        status: "processing",
        lockedBy: workerId,
        lockedUntil: new Date(now.getTime() + OUTBOX_CONFIG.lockMs),
      },
      $inc: { attempts: 1 },
    },
    { sort: { nextAttemptAt: 1 }, new: true },
  );
};


const fence = (event, workerId) => ({
  _id: event._id,
  status: "processing",
  lockedBy: workerId,
});

const backoffMs = (attempts) => {
  const exp = Math.min(
    OUTBOX_CONFIG.baseBackoffMs * 2 ** (attempts - 1),
    OUTBOX_CONFIG.maxBackoffMs,
  );
  return Math.round(exp * (0.5 + Math.random() / 2)); // jitter
};

const markCompleted = (event, workerId) =>
  OutboxEvent.updateOne(fence(event, workerId), {
    $set: {
      status: "completed",
      processedAt: new Date(),
      expiresAt: new Date(Date.now() + OUTBOX_CONFIG.completedRetentionMs),
      lockedBy: null,
      lockedUntil: null,
      lastError: null,
    },
  });
const markDead = (event, workerId, reason) =>
  OutboxEvent.updateOne(fence(event, workerId), {
    $set: {
      status: "dead",
      lockedBy: null,
      lockedUntil: null,
      lastError: reason,
    },
  });
const markRetry = (event, workerId, err) =>
  OutboxEvent.updateOne(fence(event, workerId), {
    $set: {
      status: "pending",
      nextAttemptAt: new Date(Date.now() + backoffMs(event.attempts)),
      lockedBy: null,
      lockedUntil: null,
      lastError: String(err?.message ?? err).slice(0, 500),
    },
  });

export const processOutboxBatch = async ({
  limit = 10,
  maxMs = 8_000,
} = {}) => {
  const workerId = crypto.randomUUID();
  const startedAt = Date.now();

  const stats = { completed: 0, retried: 0, dead: 0 };

  while (
    stats.completed + stats.retried + stats.dead < limit &&
    Date.now() - startedAt < maxMs
  ) {
    const event = await claimNext(workerId);
    if (!event) break;

    if (event.attempts > OUTBOX_CONFIG.maxAttempts) {
      await markDead(
        event,
        workerId,
        "Exceeded max attempts (worker kept crashing)",
      );
      stats.dead += 1;
      continue;
    }

    const handler = HANDLERS[event.type];
    if (!handler) {
      await markDead(
        event,
        workerId,
        `No handler for event type ${event.type}`,
      );
      stats.dead += 1;
      continue;
    }

    try {
      await handler(event);
      const res = await markCompleted(event, workerId);
      // عدد المستندات التي تم تعديلها بالفعل.
      if (res.modifiedCount === 0) {
        console.warn(
          `[Outbox] Lease lost for ${event.eventId}; another worker owns it now`,
        );
      }
      stats.completed += 1;
    } catch (err) {
      if (event.attempts >= OUTBOX_CONFIG.maxAttempts) {
        await markDead(
          event,
          workerId,
          String(err?.message ?? err).slice(0, 500),
        );
        console.error(
          `[Outbox] DEAD ${event.eventId} after ${event.attempts} attempts: ${err.message}`,
        );
        stats.dead += 1;
      } else {
        await markRetry(event, workerId, err);
        console.warn(
          `[Outbox] Retry ${event.eventId} (attempt ${event.attempts}): ${err.message}`,
        );
        stats.retried += 1;
      }
    }
  }
  return stats;
};


export const drainOutboxSafely = async () => {
  try {
    return await processOutboxBatch({ limit: 5, maxMs: 2_000 });
  } catch (err) {
    console.error(`[Outbox] Drain failed: ${err.message}`);
    return null;
  }
};
