const { calculateSponsorTier } = require('../utils/sponsorTierCalculator');

describe('Dynamic Sponsor Tier Calculation Unit Tests', () => {
  test('Amount ₹10,000 should detect SUPPORTING tier', async () => {
    const tier = await calculateSponsorTier(10000);
    expect(tier.name).toBe('SUPPORTING');
  });

  test('Boundary Amount ₹24,999 should detect SUPPORTING tier', async () => {
    const tier = await calculateSponsorTier(24999);
    expect(tier.name).toBe('SUPPORTING');
  });

  test('Boundary Amount ₹25,000 should detect SILVER tier', async () => {
    const tier = await calculateSponsorTier(25000);
    expect(tier.name).toBe('SILVER');
  });

  test('Boundary Amount ₹49,999 should detect SILVER tier', async () => {
    const tier = await calculateSponsorTier(49999);
    expect(tier.name).toBe('SILVER');
  });

  test('Boundary Amount ₹50,000 should detect GOLD tier', async () => {
    const tier = await calculateSponsorTier(50000);
    expect(tier.name).toBe('GOLD');
  });

  test('Boundary Amount ₹99,999 should detect GOLD tier', async () => {
    const tier = await calculateSponsorTier(99999);
    expect(tier.name).toBe('GOLD');
  });

  test('Boundary Amount ₹100,000 should detect PLATINUM tier', async () => {
    const tier = await calculateSponsorTier(100000);
    expect(tier.name).toBe('PLATINUM');
  });

  test('Amount ₹250,000 should detect PLATINUM tier', async () => {
    const tier = await calculateSponsorTier(250000);
    expect(tier.name).toBe('PLATINUM');
  });
});
