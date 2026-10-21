# ClubFund – College Club Expense, Reimbursement & Sponsorship Management System

**ClubFund** is a production-style financial management portal built for college clubs. It provides complete transparency and strict workflow controls for club member expenses, bill/receipt uploads, multi-stage approvals, financer payment processing, faculty coordinator verifications, event budgeting, corporate sponsorships with dynamic tiering, central double-entry transaction ledgers, and audit logs.

> 📋 **Latest Changes & Version History**: Detailed log of all past, present, and future updates is maintained in [UPDATES.md](file:///E:/expense/UPDATES.md).

---

## Technology Stack

- **Backend**: Node.js, Express.js REST API, JWT Authentication, bcryptjs, Multer file upload
- **Database**: MongoDB with Mongoose ORM
- **Frontend**: Next.js 14 (React Framework, App Router), Tailwind CSS, Lucide Icons, Recharts
- **Storage**: Local file uploads (`/backend/uploads/receipts`, `/backend/uploads/payment_proofs`, `/backend/uploads/sponsor_logos`)

---

## User Roles & Permissions

1. **ADMIN**: Complete system control. User management, password resets, role assignment, budgets, sponsors, events, audit logs.
2. **FACULTY_COORDINATOR**: Verification queue review, expense approvals, overall budget monitoring, report oversight.
3. **FINANCER**: Payment processing queue, payment proof uploads, income recording, sponsor payment confirmations.
4. **TREASURER**: Reimbursement request approval/rejection queue, bill reviews, expense history.
5. **MEMBER**: Expense submission, bill/receipt upload, reimbursement status tracking, personal history.

---

## Expense Reimbursement Workflow

```
MEMBER Submits Expense + Bill
        ↓
PENDING_TREASURER
        ↓
TREASURER / FACULTY / ADMIN Reviews → Approve or Reject (Store reason)
        ↓
TREASURER_APPROVED (PAYMENT_PENDING)
        ↓
FINANCER Processes Payment → Enters Ref No + Payment Proof
        ↓
PAID
        ↓
FACULTY COORDINATOR Verifies & Closes Transaction
        ↓
VERIFIED (Debits Ledger & Updates Budget)
```

> **Security Rule**: Members cannot approve their own expense requests.

---

## Automatic Sponsorship Tier System

Sponsorship tiers are automatically calculated based on database range rules (`SponsorshipTier` collection):

- **PLATINUM**: ₹1,00,000 and above (Exclusive Title, 5-min Keynote, 5 VIP Passes, Full Page Ad, etc.)
- **GOLD**: ₹50,000 – ₹99,999.99 (3-min Talk, 3 VIP Passes, Half Page Ad, etc.)
- **SILVER**: ₹25,000 – ₹49,999.99 (Event Video, 1 VIP Pass, Quarter Page Ad, etc.)
- **SUPPORTING**: Below ₹25,000 (Customizable acknowledgement & sponsor wall logo)

---

## Quick Start Guide for Windows (VS Code)

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Server running locally on `mongodb://127.0.0.1:27017/clubfund` (or MongoDB Atlas URI in `.env`)

---

### Step 1: Backend Setup & Database Seeding

Open Command Prompt / PowerShell in VS Code:

```powershell
# Navigate to backend
cd backend

# Install dependencies
npm install

# Seed default database roles, tiers, initial users, and demo data
npm run seed

# Run backend automated unit tests
npm test

# Start Express server in development mode
npm run dev
```

The backend server will start on **`http://localhost:5000`**.

---

### Step 2: Frontend Setup & Next.js Application

Open a **second** terminal window:

```powershell
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start Next.js development server
npm run dev
```

Open your browser and navigate to **`http://localhost:3000`**.

---

## Demo Test User Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@clubfund.edu` | `admin123` |
| **Faculty Coordinator** | `faculty@clubfund.edu` | `faculty1` |
| **Financer** | `financer@clubfund.edu` | `finance1` |
| **Treasurer** | `treasurer@clubfund.edu` | `treas123` |
| **Member (Arun)** | `arun@clubfund.edu` | `member12` |

---

## Key Backend REST API Endpoints

- `POST /api/auth/login` - User Authentication & JWT generation
- `GET /api/expenses` - Retrieve expenses (filtered by status, user, role)
- `POST /api/expenses` - Submit new expense reimbursement with receipt
- `POST /api/expenses/:id/approve` - Approve expense (Treasurer/Faculty/Admin)
- `POST /api/expenses/:id/reject` - Reject expense with reason
- `POST /api/expenses/:id/pay` - Process payment with reference & screenshot (Financer)
- `POST /api/expenses/:id/verify` - Faculty verification & ledger debit
- `POST /api/sponsors` - Register sponsor & dynamic tier auto-detection
- `POST /api/sponsors/preview-tier` - Real-time tier preview endpoint
- `GET /api/reports/financial-summary` - Comprehensive dashboard financial metrics
- `GET /api/transactions` - Central transaction ledger

---

## Project Directory Structure

```
ClubFund/
├── backend/
│   ├── server.js
│   ├── config/db.js
│   ├── models/ (User, Member, Expense, Sponsor, Event, Budget, etc.)
│   ├── controllers/ (auth, expense, sponsor, income, event, budget, etc.)
│   ├── services/ (expenseService, sponsorService, reportService, etc.)
│   ├── middleware/ (authMiddleware, roleMiddleware, uploadMiddleware)
│   ├── seed/seedData.js
│   ├── uploads/ (receipts, payment_proofs, sponsor_logos)
│   └── tests/ (Jest test suites)
├── frontend/
│   ├── package.json
│   ├── next.config.js
│   └── src/
│       ├── app/ (App Router pages)
│       ├── components/ (atoms, molecules, organisms)
│       ├── context/AuthContext.js
│       └── services/api.js
├── DEVELOPMENT_PROGRESS.md
└── README.md
```
