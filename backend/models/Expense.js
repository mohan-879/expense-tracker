const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    expenseCode: {
      type: String,
      required: true,
      unique: true,
    },
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Expense title is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Transport',
        'Food',
        'Refreshments',
        'Water',
        'Jerseys',
        'T-Shirts',
        'Race Registration',
        'Medical / First Aid',
        'Equipment',
        'Venue',
        'Printing',
        'Banner',
        'Certificates',
        'Medals',
        'Marketing',
        'Accommodation',
        'Event Materials',
        'Miscellaneous',
      ],
    },
    description: {
      type: String,
      default: '',
    },
    expenseDate: {
      type: Date,
      required: [true, 'Expense date is required'],
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      default: null,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than zero'],
    },
    paidBy: {
      type: String,
      required: true,
      trim: true,
    },
    originalPaymentMethod: {
      type: String,
      enum: ['Cash', 'UPI', 'Bank Transfer', 'Card', 'Cheque', 'Other'],
      default: 'UPI',
    },
    receiptPath: {
      type: String,
      required: [true, 'Receipt image or document is required'],
    },
    notes: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: [
        'PENDING_TREASURER',
        'TREASURER_APPROVED',
        'REJECTED',
        'PAYMENT_PENDING',
        'PAID',
        'VERIFIED',
      ],
      default: 'PENDING_TREASURER',
    },
    // Approval information
    approvedAmount: {
      type: Number,
      default: 0,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    // Rejection information
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    rejectedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    // Payment information
    paidByFinancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
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
    // Verification information
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Performance indexes for fast GET queries
expenseSchema.index({ status: 1, createdAt: -1 });
expenseSchema.index({ user: 1, status: 1 });
expenseSchema.index({ event: 1, status: 1 });
expenseSchema.index({ category: 1 });
expenseSchema.index({ expenseDate: -1 });
expenseSchema.index({ createdAt: -1 });
expenseSchema.index({ title: 'text', expenseCode: 'text', paidBy: 'text' });

module.exports = mongoose.model('Expense', expenseSchema);
