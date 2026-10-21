const SponsorshipTier = require('../models/SponsorshipTier');

/**
 * Calculate dynamic sponsor tier based on amount and DB sponsorship_tiers configuration
 */
const calculateSponsorTier = async (amount) => {
  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount < 0) {
    throw new Error('Invalid sponsorship amount');
  }

  // Fallback if Mongoose is disconnected or querying fails
  if (!SponsorshipTier.db || SponsorshipTier.db.readyState !== 1) {
    if (numAmount >= 100000) return { name: 'PLATINUM', minimumAmount: 100000, _id: null };
    if (numAmount >= 50000) return { name: 'GOLD', minimumAmount: 50000, _id: null };
    if (numAmount >= 25000) return { name: 'SILVER', minimumAmount: 25000, _id: null };
    return { name: 'SUPPORTING', minimumAmount: 0, _id: null };
  }

  try {
    // Fetch active tiers sorted by display order
    const tiers = await SponsorshipTier.find({ active: true }).sort({ minimumAmount: -1 });

    if (!tiers || tiers.length === 0) {
      if (numAmount >= 100000) return { name: 'PLATINUM', _id: null };
      if (numAmount >= 50000) return { name: 'GOLD', _id: null };
      if (numAmount >= 25000) return { name: 'SILVER', _id: null };
      return { name: 'SUPPORTING', _id: null };
    }

    for (const tier of tiers) {
      if (numAmount >= tier.minimumAmount && numAmount <= tier.maximumAmount) {
        return tier;
      }
    }

    return tiers[tiers.length - 1];
  } catch (err) {
    if (numAmount >= 100000) return { name: 'PLATINUM', _id: null };
    if (numAmount >= 50000) return { name: 'GOLD', _id: null };
    if (numAmount >= 25000) return { name: 'SILVER', _id: null };
    return { name: 'SUPPORTING', _id: null };
  }
};

/**
 * Get default benefits list for a tier name
 */
const getDefaultTierBenefits = (tierName) => {
  const tName = String(tierName).toUpperCase();

  switch (tName) {
    case 'PLATINUM':
      return [
        { key: 'EXCLUSIVE_TITLE', description: 'Exclusive Title Sponsorship' },
        { key: 'KEYNOTE_SPEECH', description: '5-minute keynote during Opening Ceremony' },
        { key: 'EVENT_VIDEO', description: 'Inclusion in Event Video' },
        { key: 'LANYARD_LOGO', description: 'Logo on Lanyards' },
        { key: 'VIP_PASSES', description: '5 VIP Passes' },
        { key: 'SOCIAL_MEDIA', description: 'Social Media Campaign: 5 dedicated posts + mentions' },
        { key: 'PROGRAM_AD', description: 'Full Page Event Program Advertisement' },
        { key: 'MERCHANDISE_BRANDING', description: 'Branding on Merchandise (T-Shirts, Badges, Banners)' },
        { key: 'WORKSHOP_SLOT', description: '45-minute Expert Session / Workshop' },
        { key: 'RECRUITMENT_ACCESS', description: 'Full participant database recruitment access' },
        { key: 'WEBSITE_PLACEMENT', description: 'Website & Brochure Logo Placement (Premium / Top Tier)' },
      ];

    case 'GOLD':
      return [
        { key: 'SPEECH_TALK', description: '3-minute talk during session' },
        { key: 'EVENT_VIDEO', description: 'Inclusion in Event Video' },
        { key: 'LANYARD_LOGO', description: 'Logo on Lanyards' },
        { key: 'VIP_PASSES', description: '3 VIP Passes' },
        { key: 'SOCIAL_MEDIA', description: 'Social Media Campaign: 3 mentions across platforms' },
        { key: 'PROGRAM_AD', description: 'Half Page Event Program Advertisement' },
        { key: 'BRANDING', description: 'Branding on Banners & Certificates' },
        { key: 'WORKSHOP_SLOT', description: '30-minute Interaction Session' },
        { key: 'RECRUITMENT_ACCESS', description: 'Shortlisted team access where permitted' },
        { key: 'WEBSITE_PLACEMENT', description: 'Website & Brochure Logo Placement (Mid-tier)' },
      ];

    case 'SILVER':
      return [
        { key: 'EVENT_VIDEO', description: 'Inclusion in Event Video' },
        { key: 'VIP_PASSES', description: '1 VIP Pass' },
        { key: 'SOCIAL_MEDIA', description: 'Social Media Campaign: 1 mention' },
        { key: 'PROGRAM_AD', description: 'Quarter Page Event Program Advertisement' },
        { key: 'WEBSITE_PLACEMENT', description: 'Website & Brochure Logo Placement (Standard)' },
      ];

    case 'SUPPORTING':
    default:
      return [
        { key: 'ACKNOWLEDGEMENT', description: 'Customizable basic acknowledgement benefits' },
        { key: 'WEBSITE_PLACEMENT', description: 'Logo placement on sponsor wall' },
      ];
  }
};

module.exports = {
  calculateSponsorTier,
  getDefaultTierBenefits,
};
