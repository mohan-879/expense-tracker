const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Member = require('../models/Member');
const SponsorshipTier = require('../models/SponsorshipTier');
const Event = require('../models/Event');
const Budget = require('../models/Budget');
const Sponsor = require('../models/Sponsor');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Transaction = require('../models/Transaction');
const SponsorBenefit = require('../models/SponsorBenefit');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const { calculateSponsorTier, getDefaultTierBenefits } = require('../utils/sponsorTierCalculator');
const { generateCode } = require('../utils/helpers');

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/clubfund';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing collections
    await User.deleteMany({});
    await Member.deleteMany({});
    await SponsorshipTier.deleteMany({});
    await Event.deleteMany({});
    await Budget.deleteMany({});
    await Sponsor.deleteMany({});
    await Expense.deleteMany({});
    await Income.deleteMany({});
    await Transaction.deleteMany({});
    await SponsorBenefit.deleteMany({});
    await AuditLog.deleteMany({});
    await Notification.deleteMany({});
    console.log('Cleared existing collections.');

    // 1. Seed Sponsorship Tiers
    const tiers = await SponsorshipTier.create([
      { name: 'PLATINUM', minimumAmount: 100000, maximumAmount: 999999999, displayOrder: 1, active: true },
      { name: 'GOLD', minimumAmount: 50000, maximumAmount: 99999.99, displayOrder: 2, active: true },
      { name: 'SILVER', minimumAmount: 25000, maximumAmount: 49999.99, displayOrder: 3, active: true },
      { name: 'SUPPORTING', minimumAmount: 0, maximumAmount: 24999.99, displayOrder: 4, active: true },
    ]);
    console.log('Seeded Sponsorship Tiers.');

    // 2. Seed Users
    const admin = await User.create({
      username: 'admin',
      email: 'admin@clubfund.edu',
      password: 'admin123',
      fullName: 'System Administrator',
      role: 'ADMIN',
      phone: '9087516907',
      department: 'Computer Science',
    });

    const faculty = await User.create({
      username: 'faculty',
      email: 'faculty@clubfund.edu',
      password: 'faculty1',
      fullName: 'Dr. Ramesh Sharma (Faculty Coordinator)',
      role: 'FACULTY_COORDINATOR',
      phone: '+91 9876543211',
      department: 'Student Affairs',
    });

    const financer = await User.create({
      username: 'financer',
      email: 'financer@clubfund.edu',
      password: 'finance1',
      fullName: 'Priya Verma (Financer)',
      role: 'FINANCER',
      phone: '+91 9876543212',
      department: 'Finance Division',
    });

    const treasurer = await User.create({
      username: 'treasurer',
      email: 'treasurer@clubfund.edu',
      password: 'treas123',
      fullName: 'Rahul Mehta (Treasurer)',
      role: 'TREASURER',
      phone: '+91 9876543213',
      department: 'Electronics',
    });

    const memberUser = await User.create({
      username: 'arun',
      email: 'arun@clubfund.edu',
      password: 'member12',
      fullName: 'Arun Kumar (Club Member)',
      role: 'MEMBER',
      phone: '+91 9876543214',
      department: 'Computer Science',
      year: '3rd Year',
    });

    const memberDoc = await Member.create({
      user: memberUser._id,
      studentId: 'CS2023-0104',
      designation: 'Event Coordinator',
    });
    console.log('Seeded 5 Role-based Users & Member record.');

    // 3. Seed Events & Budgets
    const event1 = await Event.create({
      name: 'TechFest 2026',
      description: 'Annual College Technology Symposium and Hackathon',
      startDate: new Date('2026-11-10'),
      endDate: new Date('2026-11-12'),
      venue: 'Main Auditorium & CS Block',
      allocatedBudget: 50000,
      status: 'UPCOMING',
      createdBy: admin._id,
    });

    const event2 = await Event.create({
      name: '5K Charity Run',
      description: 'Community Fitness Run & Awareness Campaign',
      startDate: new Date('2026-10-15'),
      endDate: new Date('2026-10-15'),
      venue: 'College Sports Ground',
      allocatedBudget: 20000,
      status: 'ACTIVE',
      createdBy: admin._id,
    });

    await Budget.create({
      event: null,
      title: 'Overall Club Annual Budget 2026-2027',
      allocatedAmount: 150000,
      fiscalYear: '2026-2027',
    });

    await Budget.create({
      event: event1._id,
      title: 'TechFest 2026 Event Budget',
      allocatedAmount: 50000,
    });

    await Budget.create({
      event: event2._id,
      title: '5K Charity Run Event Budget',
      allocatedAmount: 20000,
    });
    console.log('Seeded Events & Budgets.');

    // 4. Seed Income
    const inc1 = await Income.create({
      incomeCode: generateCode('INC'),
      source: 'College Funding',
      amount: 100000,
      date: new Date('2026-09-01'),
      description: 'Annual Student Activity Fund Allocation',
      paymentMethod: 'Bank Transfer',
      referenceNumber: 'GOV-GRANT-2026',
      recordedBy: financer._id,
    });

    await Transaction.create({
      transactionCode: generateCode('TXN'),
      transactionType: 'INCOME',
      direction: 'CREDIT',
      amount: 100000,
      referenceId: String(inc1._id),
      description: 'Income: Annual Student Activity Fund Allocation',
      paymentMethod: 'Bank Transfer',
      referenceNumber: 'GOV-GRANT-2026',
      transactionDate: inc1.date,
      createdBy: financer._id,
    });

    // 5. Seed Sponsor (Cybertronium ₹100,000 -> PLATINUM)
    const platTier = tiers.find((t) => t.name === 'PLATINUM');
    const sponsor = await Sponsor.create({
      companyName: 'Cybertronium Technologies',
      contactPerson: 'Vikram Seth',
      phone: '+91 9988776655',
      email: 'sponsorship@cybertronium.com',
      address: 'Tech Park Phase 2, Bangalore',
      amount: 100000,
      tier: platTier._id,
      tierName: 'PLATINUM',
      paymentStatus: 'PAID',
      paymentMethod: 'Bank Transfer',
      transactionReference: 'NEFT-889922001',
      paymentDate: new Date('2026-09-15'),
      logoPath: '/uploads/sponsor_logos/default_sponsor.png',
      notes: 'Title Sponsor for TechFest 2026',
      createdBy: admin._id,
    });

    // Create Sponsor Benefits
    const defaultBenefits = getDefaultTierBenefits('PLATINUM');
    for (let i = 0; i < defaultBenefits.length; i++) {
      const b = defaultBenefits[i];
      await SponsorBenefit.create({
        sponsor: sponsor._id,
        benefitKey: b.key,
        benefitDescription: b.description,
        status: i < 5 ? 'COMPLETED' : 'PENDING',
        completedBy: i < 5 ? admin._id : null,
        completedAt: i < 5 ? new Date() : null,
      });
    }

    // Record Sponsor Income & Transaction
    const incSponsor = await Income.create({
      incomeCode: generateCode('INC'),
      source: 'Sponsorship',
      amount: 100000,
      date: sponsor.paymentDate,
      description: 'Title Sponsorship - Cybertronium Technologies (PLATINUM)',
      paymentMethod: sponsor.paymentMethod,
      referenceNumber: sponsor.transactionReference,
      recordedBy: financer._id,
      sponsor: sponsor._id,
    });

    await Transaction.create({
      transactionCode: generateCode('TXN'),
      transactionType: 'SPONSORSHIP',
      direction: 'CREDIT',
      amount: 100000,
      referenceId: String(sponsor._id),
      description: 'Sponsorship Received: Cybertronium Technologies (PLATINUM)',
      paymentMethod: sponsor.paymentMethod,
      referenceNumber: sponsor.transactionReference,
      transactionDate: sponsor.paymentDate,
      createdBy: financer._id,
    });

    console.log('Seeded Sponsor Cybertronium (PLATINUM) with Benefits & Income.');

    // 6. Seed Sample Expenses (with workflow states)
    // Expense 1: Verified
    const exp1 = await Expense.create({
      expenseCode: 'EXP-2026-0001',
      member: memberDoc._id,
      user: memberUser._id,
      title: 'Water bottles for Sunday Charity Run',
      category: 'Refreshments',
      description: '20 cases of mineral water for participants',
      expenseDate: new Date('2026-09-20'),
      event: event2._id,
      amount: 1250,
      paidBy: 'Arun Kumar',
      originalPaymentMethod: 'UPI',
      receiptPath: '/uploads/receipts/default_receipt.png',
      notes: 'Purchased from Local Mart',
      status: 'VERIFIED',
      approvedAmount: 1250,
      approvedBy: treasurer._id,
      approvedAt: new Date('2026-09-21'),
      paidByFinancer: financer._id,
      paymentMethod: 'UPI',
      transactionReference: 'UPI-REF-998811',
      paymentDate: new Date('2026-09-22'),
      verifiedBy: faculty._id,
      verifiedAt: new Date('2026-09-23'),
    });

    await Transaction.create({
      transactionCode: generateCode('TXN'),
      transactionType: 'EXPENSE',
      direction: 'DEBIT',
      amount: 1250,
      referenceId: String(exp1._id),
      description: `Expense Reimbursement: Water bottles for Sunday Charity Run (EXP-2026-0001)`,
      paymentMethod: 'UPI',
      referenceNumber: 'UPI-REF-998811',
      transactionDate: exp1.verifiedAt,
      createdBy: faculty._id,
    });

    // Expense 2: Pending Treasurer
    await Expense.create({
      expenseCode: 'EXP-2026-0002',
      member: memberDoc._id,
      user: memberUser._id,
      title: 'Banners and Posters Printing',
      category: 'Printing',
      description: 'Vinyl banners for campus promotional stands',
      expenseDate: new Date('2026-10-02'),
      event: event1._id,
      amount: 3400,
      paidBy: 'Arun Kumar',
      originalPaymentMethod: 'Cash',
      receiptPath: '/uploads/receipts/default_receipt.png',
      notes: 'Urgent promotional printing',
      status: 'PENDING_TREASURER',
    });

    console.log('Seeded Sample Expenses & Ledger Transactions.');

    // 7. Seed Initial Notifications & Audit Logs
    await Notification.create({
      user: memberUser._id,
      title: 'Welcome to ClubFund',
      message: 'Your club member account is active. You can now submit expense reimbursement requests.',
      type: 'GENERAL',
    });

    await AuditLog.create({
      user: admin._id,
      action: 'SYSTEM_SEEDED',
      entityType: 'System',
      description: 'Initialized ClubFund database with default roles, tiers, users, and seed data.',
    });

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedDB();
