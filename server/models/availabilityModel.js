import mongoose from 'mongoose';

const availabilitySchema = new mongoose.Schema({
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  bookedGuests: {
    type: Number,
    default: 0,
    min: 0,
  },
});

availabilitySchema.index({ tour: 1, startDate: 1 }, { unique: true });

const Availability = mongoose.model('Availability', availabilitySchema);
export default Availability;
