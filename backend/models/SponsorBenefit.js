const mongoose = require('mongoose');

const sponsorBenefitSchema = new mongoose.Schema(
  {
    sponsor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sponsor',
      required: true,
    },
    benefitKey: {
      type: String,
      required: true,
    },
    benefitDescription: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'NOT_APPLICABLE'],
      default: 'PENDING',
    },
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SponsorBenefit', sponsorBenefitSchema);
