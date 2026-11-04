import OutboxEvent from '../models/notifications/outboxEventModel.js';

export const emitEvent = async (
  { key, type, aggregateId, payload },
  session,
) => {
  if (!session) {
    throw new Error(
      'emitEvent must be called inside the business transaction (session required)',
    );
  }
  await OutboxEvent.updateOne(
    { eventId: key },
    { $setOnInsert: { type, aggregateId, payload, occurredAt: new Date() } },
    { upsert: true, session },
  );
};
