import mongoose from 'mongoose';

const ContributionSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required:   true,
  },
  guest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed'],
    default: 'Pending',
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

export const Contribution =
  mongoose.models.Contribution ||
  mongoose.model('Contribution', ContributionSchema);
