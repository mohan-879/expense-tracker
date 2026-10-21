const mongoose = require('mongoose');

const sponsorSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, 'Company / Sponsor name is required'],
      trim: true,
    },
    contactPerson: {
      type: String,
      required: [true, 'Contact person name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      default: '',
    },
    amount: {
      type: Number,
      required: [true, 'Sponsorship amount is required'],
      min: [0.01, 'Amount must be positive'],
    },
    tier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SponsorshipTier',
      required: true,
    },
    tierName: {
      type: String,
      required: true,
      enum: ['PLATINUM', 'GOLD', 'SILVER', 'SUPPORTING'],
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID'],
      default: 'PENDING',
    },
    paymentMethod: {
      type: String,
      default: '',
    },
    transactionReference: {
      type: String,
      default: '',
    },
    paymentDate: {
      type: Date,
      default: null,
    },
    paymentProofPath: {
      type: String,
      default: '',
    },
    logoPath: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Performance indexes
sponsorSchema.index({ paymentStatus: 1 });
sponsorSchema.index({ tierName: 1 });
sponsorSchema.index({ amount: -1 });
sponsorSchema.index({ companyName: 'text', contactPerson: 'text', email: 'text' });

module.exports = mongoose.model('Sponsor', sponsorSchema);
