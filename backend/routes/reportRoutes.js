const express = require('express');
const router = express.Router();
const { getDashboardSummary, getTransactions, updateTransactionAmount, getFilteredReports } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getFilteredReports);
router.get('/filter', getFilteredReports);
router.get('/financial-summary', getDashboardSummary);
router.get('/summary', getDashboardSummary);
router.get('/transactions', getTransactions);
router.patch('/transactions/:id', updateTransactionAmount);

module.exports = router;

