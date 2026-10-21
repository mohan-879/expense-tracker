const Sponsor = require('../models/Sponsor');
const SponsorshipTier = require('../models/SponsorshipTier');
const SponsorBenefit = require('../models/SponsorBenefit');
const Income = require('../models/Income');
const Transaction = require('../models/Transaction');
const { calculateSponsorTier, getDefaultTierBenefits } = require('../utils/sponsorTierCalculator');
const { generateCode } = require('../utils/helpers');
const { logAuditAction } = require('./auditService');
const { sendNotification } = require('./notificationService');

/**
 * Create New Sponsor with Dynamic Tier & Default Benefit Checklist
 */
const createSponsor = async (creatorUser, data, logoPath = '') => {
  const { companyName, contactPerson, phone, email, address, amount, notes } = data;

  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    throw new Error('Valid positive sponsorship amount is required');
  }

  // Calculate dynamic tier
  const tierObj = await calculateSponsorTier(numAmount);
  const tierName = tierObj.name;

  const sponsor = await Sponsor.create({
    companyName,
    contactPerson,
    phone,
    email,
    address: address || '',
    amount: numAmount,
    tier: tierObj._id,
    tierName,
    paymentStatus: 'PENDING',
    logoPath: logoPath || '',
    notes: notes || '',
    createdBy: creatorUser._id,
  });

  // Generate default benefits checklist
  const defaultBenefits = getDefaultTierBenefits(tierName);
  for (const b of defaultBenefits) {
    await SponsorBenefit.create({
      sponsor: sponsor._id,
      benefitKey: b.key,
      benefitDescription: b.description,
      status: 'PENDING',
    });
  }

  // Audit log
  await logAuditAction({
    user: creatorUser._id,
    action: 'SPONSOR_CREATED',
    entityType: 'Sponsor',
    entityId: sponsor._id,
    description: `Added sponsor ${sponsor.companyName} (₹${numAmount}) -> Auto Tier: ${tierName}`,
  });

  return sponsor;
};

/**
 * Update Sponsor details & recalculate tier if amount changes
 */
const updateSponsor = async (sponsorId, user, data, logoPath = '') => {
  const sponsor = await Sponsor.findById(sponsorId);
  if (!sponsor) throw new Error('Sponsor not found');

  if (data.companyName) sponsor.companyName = data.companyName;
  if (data.contactPerson) sponsor.contactPerson = data.contactPerson;
  if (data.phone) sponsor.phone = data.phone;
  if (data.email) sponsor.email = data.email;
  if (data.address) sponsor.address = data.address;
  if (data.notes) sponsor.notes = data.notes;
  if (logoPath) sponsor.logoPath = logoPath;

  if (data.amount && Number(data.amount) !== sponsor.amount) {
    const newAmount = Number(data.amount);
    sponsor.amount = newAmount;

    // Recalculate tier
    const newTier = await calculateSponsorTier(newAmount);
    if (newTier.name !== sponsor.tierName) {
      sponsor.tierName = newTier.name;
      sponsor.tier = newTier._id;

      // Update benefits checklist for new tier if needed
      const defaultBenefits = getDefaultTierBenefits(newTier.name);
      for (const b of defaultBenefits) {
        const existing = await SponsorBenefit.findOne({ sponsor: sponsor._id, benefitKey: b.key });
        if (!existing) {
          await SponsorBenefit.create({
            sponsor: sponsor._id,
            benefitKey: b.key,
            benefitDescription: b.description,
            status: 'PENDING',
          });
        }
      }
    }
  }

  await sponsor.save();

  // Audit log
  await logAuditAction({
    user: user._id,
    action: 'SPONSOR_UPDATED',
    entityType: 'Sponsor',
    entityId: sponsor._id,
    description: `Updated sponsor ${sponsor.companyName}`,
  });

  return sponsor;
};

/**
 * Confirm / Mark Sponsor Payment as Paid
 */
const markSponsorPaid = async (sponsorId, user, paymentData, paymentProofPath = '') => {
  const sponsor = await Sponsor.findById(sponsorId);
  if (!sponsor) throw new Error('Sponsor not found');

  if (sponsor.paymentStatus === 'PAID') {
    throw new Error('Sponsor payment has already been confirmed');
  }

  sponsor.paymentStatus = 'PAID';
  sponsor.paymentMethod = paymentData.paymentMethod || 'Bank Transfer';
  sponsor.transactionReference = paymentData.transactionReference || `SPON-REF-${Date.now()}`;
  sponsor.paymentDate = paymentData.paymentDate || new Date();
  if (paymentProofPath) {
    sponsor.paymentProofPath = paymentProofPath;
  }
  await sponsor.save();

  // Create Income entry
  const incomeCode = generateCode('INC');
  const income = await Income.create({
    incomeCode,
    source: 'Sponsorship',
    amount: sponsor.amount,
    date: sponsor.paymentDate,
    description: `Sponsorship from ${sponsor.companyName} (${sponsor.tierName} Tier)`,
    paymentMethod: sponsor.paymentMethod,
    referenceNumber: sponsor.transactionReference,
    recordedBy: user._id,
    sponsor: sponsor._id,
  });

  // Create Transaction Ledger entry (CREDIT)
  const transactionCode = generateCode('TXN');
  await Transaction.create({
    transactionCode,
    transactionType: 'SPONSORSHIP',
    direction: 'CREDIT',
    amount: sponsor.amount,
    referenceId: String(sponsor._id),
    category: 'Sponsorship',
    description: `Sponsorship Received: ${sponsor.companyName} (${sponsor.tierName})`,
    paymentMethod: sponsor.paymentMethod,
    referenceNumber: sponsor.transactionReference,
    transactionDate: sponsor.paymentDate,
    createdBy: user._id,
  });

  // Audit log
  await logAuditAction({
    user: user._id,
    action: 'SPONSOR_PAYMENT_CONFIRMED',
    entityType: 'Sponsor',
    entityId: sponsor._id,
    description: `Confirmed sponsorship payment of ₹${sponsor.amount} from ${sponsor.companyName}`,
  });

  return { sponsor, income };
};

/**
 * Update Benefit Fulfillment Status
 */
const updateBenefitFulfillment = async (benefitId, user, status, notes = '') => {
  const benefit = await SponsorBenefit.findById(benefitId);
  if (!benefit) throw new Error('Sponsor benefit not found');

  benefit.status = status;
  if (status === 'COMPLETED') {
    benefit.completedBy = user._id;
    benefit.completedAt = new Date();
  }
  if (notes) benefit.notes = notes;
  await benefit.save();

  // Audit log
  await logAuditAction({
    user: user._id,
    action: 'BENEFIT_STATUS_UPDATED',
    entityType: 'SponsorBenefit',
    entityId: benefit._id,
    description: `Updated benefit '${benefit.benefitDescription}' status to ${status}`,
  });

  return benefit;
};

module.exports = {
  createSponsor,
  updateSponsor,
  markSponsorPaid,
  updateBenefitFulfillment,
};
