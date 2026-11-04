import { expireStalePendingBookings } from "./bookingService.js";
import { processOutboxBatch } from "./outboxWorker.js";
import { processPendingRefunds } from "./refundService.js";

const step = async (name, fn) => {
  try {
    return { ok: true, result: await fn() };
  } catch (err) {
    console.error(`[Maintenance] ${name} failed: ${err.message}`);
    return { ok: false, error: err.message };
  }
};


export const runBookingMaintenance = async () => {
  const summary = {
    staleBookingsReleased: await step('expireStalePendingBookings', () =>
      expireStalePendingBookings(),
    ),
    refundsRetried: await step('processPendingRefunds', () => processPendingRefunds()),
    outbox: await step('processOutboxBatch', () =>
      processOutboxBatch({ limit: 50, maxMs: 20_000 }),
    ),
    // Step 5 (not implemented yet): completeFinishedBookings()
  };
  console.log(`[Maintenance] ${JSON.stringify(summary)}`);
  return summary;
};