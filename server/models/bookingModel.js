import mongoose from 'mongoose';

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
  },
  {
    timestamps: true,
  },
);

bookingSchema.pre(/^find/, async function () {
  this.populate({
    path: 'user',
    select: 'name email photo',
  }).populate({
    path: 'tour',
    select: 'name imageCover',
  });
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
