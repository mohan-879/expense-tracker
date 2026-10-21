const Sponsor = require('../models/Sponsor');
const SponsorshipTier = require('../models/SponsorshipTier');
const SponsorBenefit = require('../models/SponsorBenefit');
const {
  createSponsor,
  updateSponsor,
  markSponsorPaid,
  updateBenefitFulfillment,
} = require('../services/sponsorService');
const { calculateSponsorTier } = require('../utils/sponsorTierCalculator');
const { successResponse, errorResponse } = require('../utils/helpers');

// @desc    Get all sponsors
// @route   GET /api/sponsors
// @access  Private
const getSponsors = async (req, res, next) => {
  try {
    const { tier, paymentStatus, search } = req.query;
    const query = {};

    if (tier) query.tierName = tier.toUpperCase();
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const sponsors = await Sponsor.find(query)
      .populate('tier')
      .populate('createdBy', 'fullName email')
      .sort({ amount: -1 })
      .lean();

    return successResponse(res, 200, 'Sponsors retrieved successfully', sponsors);
  } catch (error) {
    next(error);
  }
};

// @desc    Create sponsor
// @route   POST /api/sponsors
// @access  Private (Admin, Financer)
const handleCreateSponsor = async (req, res, next) => {
  try {
    const logoPath = req.file ? `/uploads/sponsor_logos/${req.file.filename}` : '';
    const sponsor = await createSponsor(req.user, req.body, logoPath);
    return successResponse(res, 201, 'Sponsor added successfully with dynamic tier', sponsor);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

// @desc    Get sponsor details & benefit checklist
// @route   GET /api/sponsors/:id
// @access  Private
const getSponsorById = async (req, res, next) => {
  try {
    const sponsor = await Sponsor.findById(req.params.id)
      .populate('tier')
      .populate('createdBy', 'fullName email');

    if (!sponsor) return errorResponse(res, 404, 'Sponsor not found');

    const benefits = await SponsorBenefit.find({ sponsor: sponsor._id }).populate('completedBy', 'fullName');

    // Calculate completion percentage
    const totalBenefits = benefits.length;
    const completedBenefits = benefits.filter((b) => b.status === 'COMPLETED').length;
    const completionPercentage = totalBenefits > 0 ? Math.round((completedBenefits / totalBenefits) * 100) : 0;

    return successResponse(res, 200, 'Sponsor details retrieved', {
      sponsor,
      benefits,
      completionPercentage,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update sponsor
// @route   PUT /api/sponsors/:id
// @access  Private (Admin, Financer)
const handleUpdateSponsor = async (req, res, next) => {
  try {
    const logoPath = req.file ? `/uploads/sponsor_logos/${req.file.filename}` : '';
    const sponsor = await updateSponsor(req.params.id, req.user, req.body, logoPath);
    return successResponse(res, 200, 'Sponsor updated successfully', sponsor);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

// @desc    Confirm sponsor payment
// @route   POST /api/sponsors/:id/pay
// @access  Private (Financer, Admin)
const handleMarkSponsorPaid = async (req, res, next) => {
  try {
    const paymentProofPath = req.file ? `/uploads/payment_proofs/${req.file.filename}` : '';
    const result = await markSponsorPaid(req.params.id, req.user, req.body, paymentProofPath);
    return successResponse(res, 200, 'Sponsor payment confirmed and credited to income ledger', result);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

// @desc    Update Benefit Fulfillment
// @route   PATCH /api/sponsors/benefits/:benefitId
// @access  Private (Admin, Faculty, Financer)
const handleUpdateBenefit = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    if (!status) return errorResponse(res, 400, 'Status is required');
    const benefit = await updateBenefitFulfillment(req.params.benefitId, req.user, status, notes);
    return successResponse(res, 200, 'Benefit fulfillment status updated', benefit);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

// @desc    Preview Dynamic Sponsor Tier based on amount (Frontend helper endpoint)
// @route   POST /api/sponsors/preview-tier
// @access  Private
const previewSponsorTier = async (req, res, next) => {
  try {
    const { amount } = req.body;
    if (!amount || isNaN(Number(amount))) {
      return errorResponse(res, 400, 'Valid numeric amount is required');
    }
    const tier = await calculateSponsorTier(Number(amount));
    return successResponse(res, 200, 'Detected Tier', tier);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

// @desc    Get Sponsorship Tiers Configuration
// @route   GET /api/sponsorship-tiers
// @access  Private
const getSponsorshipTiers = async (req, res, next) => {
  try {
    const tiers = await SponsorshipTier.find().sort({ minimumAmount: -1 });
    return successResponse(res, 200, 'Sponsorship tiers retrieved', tiers);
  } catch (error) {
    next(error);
  }
};

// @desc    Create/Update Sponsorship Tier Configuration (Admin)
// @route   POST /api/sponsorship-tiers
// @access  Private (Admin)
const updateSponsorshipTier = async (req, res, next) => {
  try {
    const { id, name, minimumAmount, maximumAmount, displayOrder, active } = req.body;

    let tier;
    if (id) {
      tier = await SponsorshipTier.findById(id);
      if (!tier) return errorResponse(res, 404, 'Tier configuration not found');
      if (minimumAmount !== undefined) tier.minimumAmount = Number(minimumAmount);
      if (maximumAmount !== undefined) tier.maximumAmount = Number(maximumAmount);
      if (displayOrder !== undefined) tier.displayOrder = Number(displayOrder);
      if (active !== undefined) tier.active = active;
      await tier.save();
    } else {
      tier = await SponsorshipTier.create({
        name,
        minimumAmount: Number(minimumAmount),
        maximumAmount: Number(maximumAmount),
        displayOrder: Number(displayOrder || 1),
        active: active !== undefined ? active : true,
      });
    }

    return successResponse(res, 200, 'Sponsorship tier range saved successfully', tier);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSponsors,
  handleCreateSponsor,
  getSponsorById,
  handleUpdateSponsor,
  handleMarkSponsorPaid,
  handleUpdateBenefit,
  previewSponsorTier,
  getSponsorshipTiers,
  updateSponsorshipTier,
};
