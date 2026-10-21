const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      default: null,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    allocatedAmount: {
      type: Number,
      required: true,
      min: [0, 'Allocated amount cannot be negative'],
    },
    fiscalYear: {
      type: String,
      default: '2026-2027',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Budget', budgetSchema);
