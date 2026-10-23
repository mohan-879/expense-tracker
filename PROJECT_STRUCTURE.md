# Project File Structure

> **Expense & Sponsorship Management System**  
> Full-stack web application with Node.js/Express backend and Next.js (App Router) frontend.

---

## 📁 High-Level Architecture

```
expense/
├── backend/          # Express.js REST API, MongoDB/Mongoose models, Auth & Business Logic
├── frontend/         # Next.js 14 App Router, Tailwind CSS, Atomic Design UI
├── README.md         # Project documentation and setup guide
├── DEVELOPMENT_PROGRESS.md # Development log & feature roadmap
└── UPDATES.md        # Detailed changelog and release updates
```

---

## 🌳 Complete Directory Tree

```
expense/
│
├── .gitignore
├── DEVELOPMENT_PROGRESS.md
├── README.md
├── UPDATES.md
├── vercel.json
│
├── backend/
│   ├── .env
│   ├── .env.example
│   ├── loadtest.js
│   ├── nodemon.json
│   ├── package.json
│   ├── package-lock.json
│   ├── server.js
│   │
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── auditController.js
│   │   ├── authController.js
│   │   ├── budgetController.js
│   │   ├── eventController.js
│   │   ├── expenseController.js
│   │   ├── incomeController.js
│   │   ├── notificationController.js
│   │   ├── reportController.js
│   │   ├── sponsorController.js
│   │   └── userController.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorHandler.js
│   │   ├── roleMiddleware.js
│   │   └── uploadMiddleware.js
│   │
│   ├── models/
│   │   ├── AuditLog.js
│   │   ├── Budget.js
│   │   ├── Event.js
│   │   ├── Expense.js
│   │   ├── Income.js
│   │   ├── Member.js
│   │   ├── Notification.js
│   │   ├── Reimbursement.js
│   │   ├── Sponsor.js
│   │   ├── SponsorBenefit.js
│   │   ├── SponsorshipTier.js
│   │   ├── Transaction.js
│   │   └── User.js
│   │
│   ├── routes/
│   │   ├── auditRoutes.js
│   │   ├── authRoutes.js
│   │   ├── budgetRoutes.js
│   │   ├── eventRoutes.js
│   │   ├── expenseRoutes.js
│   │   ├── incomeRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── reportRoutes.js
│   │   ├── sponsorRoutes.js
│   │   └── userRoutes.js
│   │
│   ├── seed/
│   │   └── seedData.js
│   │
│   ├── services/
│   │   ├── auditService.js
│   │   ├── authService.js
│   │   ├── brevoSmsService.js
│   │   ├── budgetService.js
│   │   ├── emailService.js
│   │   ├── expenseService.js
│   │   ├── notificationService.js
│   │   ├── reportService.js
│   │   └── sponsorService.js
│   │
│   ├── tests/
│   │   ├── auth.test.js
│   │   ├── sponsor.test.js
│   │   ├── test_db_admin_phone.js
│   │   └── test_sms.js
│   │
│   ├── uploads/
│   │   ├── payment_proofs/
│   │   ├── receipts/
│   │   └── sponsor_logos/
│   │
│   └── utils/
│       ├── helpers.js
│       └── sponsorTierCalculator.js
│
└── frontend/
    ├── next.config.js
    ├── package.json
    ├── package-lock.json
    ├── postcss.config.js
    ├── tailwind.config.js
    │
    ├── public/
    │   ├── logo.jpg
    │   ├── logo.png
    │   ├── panimalar_header.png
    │   ├── panimalar_logo.png
    │   └── panimalar_sidebar_banner.png
    │
    └── src/
        ├── app/
        │   ├── layout.js
        │   ├── page.js
        │   ├── globals.css
        │   ├── error.js
        │   ├── global-error.js
        │   ├── not-found.js
        │   │
        │   ├── (auth)/
        │   │   └── login/
        │   │       └── page.js
        │   │
        │   └── (dashboard)/
        │       ├── layout.js
        │       ├── dashboard/
        │       │   └── page.js
        │       ├── approval-queue/
        │       │   └── page.js
        │       ├── audit-logs/
        │       │   └── page.js
        │       ├── events/
        │       │   └── page.js
        │       ├── expenses/
        │       │   ├── page.js
        │       │   ├── new/
        │       │   │   └── page.js
        │       │   └── [id]/
        │       │       └── page.js
        │       ├── income/
        │       │   └── page.js
        │       ├── notifications/
        │       │   └── page.js
        │       ├── payment-queue/
        │       │   └── page.js
        │       ├── profile/
        │       │   └── page.js
        │       ├── sponsors/
        │       │   ├── page.js
        │       │   ├── new/
        │       │   │   └── page.js
        │       │   └── [id]/
        │       │       └── page.js
        │       ├── users/
        │       │   └── page.js
        │       └── verification-queue/
        │           └── page.js
        │
        ├── components/
        │   ├── atoms/
        │   │   ├── AmountText.js
        │   │   ├── Badge.js
        │   │   ├── Button.js
        │   │   ├── Input.js
        │   │   ├── Select.js
        │   │   └── Textarea.js
        │   │
        │   ├── molecules/
        │   │   ├── FileUploader.js
        │   │   ├── FormField.js
        │   │   ├── MetricCard.js
        │   │   ├── RoleBadge.js
        │   │   ├── SponsorTierBadge.js
        │   │   └── StatusBadge.js
        │   │
        │   └── organisms/
        │       ├── DashboardCharts.js
        │       ├── ExpenseTable.js
        │       ├── Navbar.js
        │       └── Sidebar.js
        │
        ├── context/
        │   └── AuthContext.js
        │
        ├── hooks/
        │   ├── index.js
        │   └── useAuth.js
        │
        ├── services/
        │   └── api.js
        │
        └── utils/
            └── exportHelper.js
```

---

## 🧩 Architectural Breakdown

### 🖥️ Backend Architecture (`/backend`)
- **Controllers (`controllers/`)**: Handles HTTP request parsing, input validation, and delegates business logic to services.
- **Middleware (`middleware/`)**: Authentication verification (`authMiddleware.js`), Role-based access control (`roleMiddleware.js`), Multer file uploads (`uploadMiddleware.js`), and centralized error handling.
- **Models (`models/`)**: Mongoose schemas for Users, Expenses, Incomes, Budgets, Events, Sponsors, Audit Logs, and Notifications.
- **Services (`services/`)**: Core domain workflows including SMS notifications (Brevo), email dispatch, expense calculations, audit logging, and financial reporting.
- **Routes (`routes/`)**: Express API route definitions matching each domain entity.
- **Uploads (`uploads/`)**: Physical storage directory for receipts, payment proof screenshots, and sponsor logo images.

### 🎨 Frontend Architecture (`/frontend`)
- **Next.js App Router (`src/app/`)**: Route groups separating authentication `(auth)` from authenticated layout pages `(dashboard)`.
- **Atomic Component Hierarchy (`src/components/`)**:
  - `atoms/`: Fundamental primitives (Buttons, Inputs, Selects, Badges).
  - `molecules/`: Compound inputs and status indicators (FormField, FileUploader, MetricCard).
  - `organisms/`: Complex UI blocks (Navbar, Sidebar, ExpenseTable, DashboardCharts).
- **Context & Hooks (`src/context/`, `src/hooks/`)**: Client-side authentication state and custom React hooks.
- **Services (`src/services/api.js`)**: Axios/Fetch client handling API base URL and authorization headers.
