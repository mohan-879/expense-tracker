const express = require('express');
const router = express.Router();
const {
  getEvents,
  createEvent,
  updateEvent,
  toggleEventStatus,
  deleteEvent,
} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.route('/')
  .get(getEvents)
  .post(authorize('ADMIN', 'FACULTY_COORDINATOR', 'TREASURER'), createEvent);

router.route('/:id')
  .put(authorize('ADMIN', 'FACULTY_COORDINATOR', 'TREASURER'), updateEvent)
  .delete(authorize('ADMIN', 'FACULTY_COORDINATOR', 'TREASURER'), deleteEvent);

router.patch('/:id/toggle-status', authorize('ADMIN', 'FACULTY_COORDINATOR', 'TREASURER'), toggleEventStatus);

module.exports = router;
