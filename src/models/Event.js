import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    venue: {
      type: String,
      required: true,
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    guests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    status: {
      type: String,
      enum: ['Open', 'Closed'],
      default: 'Open',
    },
    totalReceivedAmount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Event =
  mongoose.models.Event || mongoose.model('Event', eventSchema);
