const express = require('express');
const router = express.Router();
const {
  getSponsors,
  handleCreateSponsor,
  getSponsorById,
  handleUpdateSponsor,
  handleMarkSponsorPaid,
  handleUpdateBenefit,
  previewSponsorTier,
  getSponsorshipTiers,
  updateSponsorshipTier,
} = require('../controllers/sponsorController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { uploadSponsorLogo, uploadPaymentProof } = require('../middleware/uploadMiddleware');

router.use(protect);

router.post('/preview-tier', previewSponsorTier);

router.route('/tiers')
  .get(getSponsorshipTiers)
  .post(authorize('ADMIN'), updateSponsorshipTier);

router.route('/')
  .get(getSponsors)
  .post(authorize('ADMIN', 'FINANCER', 'FACULTY_COORDINATOR', 'TREASURER'), uploadSponsorLogo, handleCreateSponsor);

router.route('/:id')
  .get(getSponsorById)
  .put(authorize('ADMIN', 'FINANCER', 'FACULTY_COORDINATOR', 'TREASURER'), uploadSponsorLogo, handleUpdateSponsor);

router.post(
  '/:id/pay',
  authorize('FINANCER', 'ADMIN'),
  uploadPaymentProof,
  handleMarkSponsorPaid
);

router.patch(
  '/benefits/:benefitId',
  authorize('ADMIN', 'FACULTY_COORDINATOR', 'FINANCER', 'TREASURER'),
  handleUpdateBenefit
);

module.exports = router;
