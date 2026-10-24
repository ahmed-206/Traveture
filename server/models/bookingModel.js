import mongoose from 'mongoose';

export const NO_POPULATE = { skipPopulate: true };

const bookingSchema = new mongoose.Schema(
  {
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Booking must belong to a tour'],
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Booking must belong to a user'],
    },

    price: {
      type: Number,
      required: [true, 'Booking must have a price'],
      min: 0,
    },

    guests: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },

    startDate: {
      type: Date,
      required: [true, 'Booking must specify a start date'],
    },

    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },

    stripeSessionId: { type: String, default: null },
    stripePaymentIntentId: { type: String, default: null },
    amountPaidCents: { type: Number, default: null, min: 0 },
    refundedAmountCents: { type: Number, default: 0, min: 0 },

    checkoutAttempt: { type: Number, default: 0 },
    checkoutExpiresAt: { type: Date, default: null },

    cancelledAt: { type: Date, default: null },
    cancelledBy: {
      type: String,
      enum: ['user', 'admin', 'system', null],
      default: null,
    },
    cancellationReason: { type: String, default: null },
  },
  {
    timestamps: true,
  },
);

bookingSchema.pre(/^find/, async function () {
  if (this.getOptions().skipPopulate) return;
  this.populate({
    path: 'user',
    select: 'name email photo',
  }).populate({
    path: 'tour',
    select: 'name imageCover',
  });
});

bookingSchema.index(
  { user: 1, tour: 1, startDate: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'pending' },
  },
);

bookingSchema.index(
  { stripeSessionId: 1 },
  {
    unique: true,
    partialFilterExpression: { stripeSessionId: { $type: 'string' } },
  },
);
bookingSchema.index(
  { stripePaymentIntentId: 1 },
  {
    unique: true,
    partialFilterExpression: { stripePaymentIntentId: { $type: 'string' } },
  },
);

bookingSchema.index({ status: 1, createdAt: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
