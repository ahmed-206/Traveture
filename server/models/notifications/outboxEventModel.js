import mongoose from 'mongoose';

const outboxEventSchema = new mongoose.Schema(
  {
    eventId: { 
      type: String, 
      required: true 
    }, // deterministic key, see emitEvent
    type: {
      type: String,
      required: true,
      enum: [
        'BOOKING_CONFIRMED',
        'BOOKING_CANCELLED',
        'BOOKING_COMPLETED',
        'REFUND_SUCCEEDED',
      ],
    },
    aggregateId: { 
      type: mongoose.Schema.ObjectId, 
      required: true 
    },
    payload: { 
      type: mongoose.Schema.Types.Mixed, 
      required: true 
    },
    occurredAt: { 
      type: Date, 
      default: Date.now },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'dead'],
      default: 'pending',
    },
    attempts: { 
      type: Number, 
      default: 0, 
      min: 0 
    },
    nextAttemptAt: { 
      type: Date, 
      default: Date.now 
    },
    lockedBy: { 
      type: String, 
      default: null 
    },
    lockedUntil: { 
      type: Date, 
      default: null 
    },
    lastError: { 
      type: String, 
      default: null 
    },
    processedAt: { 
      type: Date, 
      default: null 
    },
    expiresAt: { 
      type: Date, 
      default: null 
    }, // set only when completed; null => TTL ignores it
  },
  { timestamps: true },
);

outboxEventSchema.index({ eventId: 1 }, { unique: true });
outboxEventSchema.index(
  { nextAttemptAt: 1 },
  { partialFilterExpression: { status: 'pending' } },
);
outboxEventSchema.index(
  { lockedUntil: 1 },
  { partialFilterExpression: { status: 'processing' } },
);
outboxEventSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OutboxEvent = mongoose.model('OutboxEvent', outboxEventSchema);

export default OutboxEvent;
