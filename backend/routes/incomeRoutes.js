const express = require('express');
const router = express.Router();
const { getIncomeList, createIncome } = require('../controllers/incomeController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.route('/')
  .get(getIncomeList)
  .post(authorize('ADMIN', 'FINANCER', 'TREASURER', 'FACULTY_COORDINATOR'), createIncome);

module.exports = router;
