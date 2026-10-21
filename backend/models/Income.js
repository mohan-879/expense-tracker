const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema(
  {
    incomeCode: {
      type: String,
      required: true,
      unique: true,
    },
    source: {
      type: String,
      required: [true, 'Income source is required'],
      enum: [
        'College Funding',
        'Sponsorship',
        'Membership Fees',
        'Event Registration',
        'Donations',
        'Other Income',
      ],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than zero'],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    description: {
      type: String,
      default: '',
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Card', 'Other'],
      default: 'Bank Transfer',
    },
    referenceNumber: {
      type: String,
      default: '',
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sponsor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sponsor',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Performance indexes
incomeSchema.index({ source: 1 });
incomeSchema.index({ date: -1 });
incomeSchema.index({ recordedBy: 1 });

module.exports = mongoose.model('Income', incomeSchema);
