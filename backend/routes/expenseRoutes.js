const express = require('express');
const router = express.Router();
const {
  createExpense,
  getExpenses,
  getExpenseById,
  handleApproveExpense,
  handleRejectExpense,
  handlePayExpense,
  handleVerifyExpense,
} = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { uploadReceipt, uploadPaymentProof } = require('../middleware/uploadMiddleware');

router.use(protect);

router.route('/')
  .get(getExpenses)
  .post(uploadReceipt, createExpense);

router.get('/:id', getExpenseById);

// Approve / Reject (Treasurer, Faculty Coordinator, Admin)
router.post(
  '/:id/approve',
  authorize('TREASURER', 'FACULTY_COORDINATOR', 'ADMIN'),
  handleApproveExpense
);

router.post(
  '/:id/reject',
  authorize('TREASURER', 'FACULTY_COORDINATOR', 'ADMIN'),
  handleRejectExpense
);

// Payment (Financer, Admin)
router.post(
  '/:id/pay',
  authorize('FINANCER', 'ADMIN'),
  uploadPaymentProof,
  handlePayExpense
);

// Verification (Faculty Coordinator, Admin)
router.post(
  '/:id/verify',
  authorize('FACULTY_COORDINATOR', 'ADMIN'),
  handleVerifyExpense
);

module.exports = router;
