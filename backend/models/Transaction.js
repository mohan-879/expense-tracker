const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    transactionCode: {
      type: String,
      required: true,
      unique: true,
    },
    transactionType: {
      type: String,
      enum: ['INCOME', 'EXPENSE', 'REIMBURSEMENT', 'SPONSORSHIP'],
      required: true,
    },
    direction: {
      type: String,
      enum: ['CREDIT', 'DEBIT'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    category: {
      type: String,
      default: '',
    },
    referenceId: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      default: 'Bank Transfer',
    },
    referenceNumber: {
      type: String,
      default: '',
    },
    transactionDate: {
      type: Date,
      default: Date.now,
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

// Performance indexes for fast transaction ledger queries
transactionSchema.index({ transactionDate: 1, createdAt: 1 });
transactionSchema.index({ transactionType: 1 });
transactionSchema.index({ direction: 1 });
transactionSchema.index({ createdBy: 1 });
transactionSchema.index({ description: 'text', transactionCode: 'text', category: 'text' });

module.exports = mongoose.model('Transaction', transactionSchema);
