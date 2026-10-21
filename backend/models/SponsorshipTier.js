const mongoose = require('mongoose');

const sponsorshipTierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    minimumAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    maximumAmount: {
      type: Number,
      required: true,
      default: 999999999, // default infinity ceiling for top tier
    },
    displayOrder: {
      type: Number,
      default: 1,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SponsorshipTier', sponsorshipTierSchema);
