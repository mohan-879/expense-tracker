const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus,
  approveUser,
  rejectUser,
  resetPassword,
  deleteUser,
  updateUserWallet,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.route('/')
  .get(authorize('ADMIN', 'FACULTY_COORDINATOR', 'TREASURER'), getUsers)
  .post(authorize('ADMIN', 'FACULTY_COORDINATOR'), createUser);

router.route('/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(authorize('ADMIN', 'FACULTY_COORDINATOR'), deleteUser);

router.patch('/:id/approve', authorize('ADMIN', 'FACULTY_COORDINATOR'), approveUser);
router.patch('/:id/reject', authorize('ADMIN', 'FACULTY_COORDINATOR'), rejectUser);
router.patch('/:id/status', authorize('ADMIN'), toggleUserStatus);
router.post('/:id/reset-password', authorize('ADMIN'), resetPassword);
router.post('/:id/wallet', authorize('ADMIN', 'FACULTY_COORDINATOR'), updateUserWallet);

module.exports = router;
