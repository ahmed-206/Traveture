import mongoose from 'mongoose';

export const NOTIFICATION_TTL_MS = 90 * 24 * 60 * 60 * 1000; // keep for 90 days

const notificationSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.ObjectId, 
      ref: 'User', 
      required: true 
    },

  
    eventId: { type: String, required: true },

    type: {
      type: String,
      enum: ['BOOKING_CONFIRMED', 'BOOKING_CANCELLED', 'BOOKING_COMPLETED', 'REFUND_SUCCEEDED'],
      required: true,
    },

    // Ready-made English text
    title: { type: String, required: true },
    message: { type: String, required: true },
    // ... plus the raw values so the client can render/translate its own text
    params: { type: mongoose.Schema.Types.Mixed, default: {} },

    resource: {
      kind: { type: String, enum: ['booking'], required: true },
      id: { type: mongoose.Schema.ObjectId, required: true },
    },

   
    occurredAt: { type: Date, default: Date.now },

    isRead: { type: Boolean, default: false },
    readAt: { type: Date, default: null },

    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + NOTIFICATION_TTL_MS),
    },
  },
  { timestamps: true },
);

notificationSchema.index({ user: 1, eventId: 1 }, { unique: true });
// list, newest first, cursor pagination on (occurredAt, _id)
notificationSchema.index({ user: 1, occurredAt: -1, _id: -1 });
// unread badge: tiny index that only contains unread rows
notificationSchema.index({ user: 1 }, { partialFilterExpression: { isRead: false } });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
