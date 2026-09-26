import mongoose from 'mongoose';

const processedWebhookEventSchema = new mongoose.Schema({
  eventId: { type: String, required: true, unique: true },
  eventType: { type: String, required: true },
  processedAt: { type: Date, default: Date.now },
});

// TTL index ا يمسح السجلات القديمة تلقائيًا بعد 30 يوم
processedWebhookEventSchema.index(
  { processedAt: 1 },
  { expireAfterSeconds: 30 * 24 * 60 * 60 },
);

const ProcessedWebhookEvent = mongoose.model(
  'ProcessedWebhookEvent',
  processedWebhookEventSchema,
);

export default ProcessedWebhookEvent;