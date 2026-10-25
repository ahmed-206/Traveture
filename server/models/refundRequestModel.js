import mongoose from 'mongoose';

const refundRequestSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.ObjectId,
      ref: 'Booking',
      required: true,
      index: true,
    },
  
    paymentIntentId: { type: String, required: true, unique: true },
    amountCents: { type: Number, required: true, min: 1 },
    currency: { type: String, default: 'usd' },
    reason: {
      type: String,
      enum: [
        'booking_cancelled',
        'duplicate_payment',
        'payment_on_cancelled_booking',
        'amount_mismatch',
      ],
      required: true,
    },
  
    isBookingPayment: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['pending', 'succeeded', 'needs_review'],
      default: 'pending',
    },
    
    attempts: { type: Number, default: 0 },
    stripeRefundId: { type: String, default: null },
    lastError: { type: String, default: null },
  },
  { timestamps: true },
);

refundRequestSchema.index({ status: 1, updatedAt: 1 });

const RefundRequest = mongoose.model('RefundRequest', refundRequestSchema);
export default RefundRequest;
