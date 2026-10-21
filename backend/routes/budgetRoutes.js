const express = require('express');
const router = express.Router();
const { getBudgets, setOverallBudget } = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.route('/')
  .get(getBudgets)
  .post(authorize('ADMIN'), setOverallBudget);

module.exports = router;
