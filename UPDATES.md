# DSClub Expense Tracker – System Updates & Changelog

This document maintains the complete development log and version history of the **DSClub Expense Tracker** (Panimalar Engineering College – Data Science Club) from inception to the latest release, as well as the procedure for logging future updates.

---

## 📌 Update Log Maintenance Protocol (For Future Updates)

Whenever new modifications, bug fixes, or features are introduced to this codebase, follow this standard structure to document them at the top of the **Version History** section:

```markdown
### [Version X.Y.Z] – YYYY-MM-DD
#### 🎯 Summary of Changes
- High-level overview of what was added, changed, or fixed.

#### 🛠️ Key Modifications & Components Affected
- **Frontend**: Specific files, pages, and UI components updated.
- **Backend**: Models, controllers, services, or routes modified.
- **Database / Schema**: Any schema, index, or field changes.

#### 🧪 Verification & Testing
- Commands executed and validation checks performed.
```

---

## 🕒 Comprehensive Version History

---

### [Version 1.3.6] – 2026-10-21 *(Latest Release)*

#### 🎯 Summary of Changes
- **Complete Site-Wide Removal of User Identity Chip & Role Badges from Navigation**:
  - Completely removed the user profile chip (`[S] System Administra... ADMIN`) from the global top navigation header (`Navbar.js`).
  - Removed the `Logged in as ... [ROLE]` badge block from the side drawer navigation (`Sidebar.js`), ensuring zero user identity chips or badges clutter the site layout across mobile and desktop.
  - Touched `DashboardLayout` and verified JavaScript syntax across all affected files to ensure seamless Next.js compilation.

#### 🛠️ Key Modifications & Components Affected
- **Frontend**:
  - [`frontend/src/components/organisms/Navbar.js`](file:///e:/expense/frontend/src/components/organisms/Navbar.js): Removed user avatar circle and name/role chip from the top header; updated notification container structure.
  - [`frontend/src/components/organisms/Sidebar.js`](file:///e:/expense/frontend/src/components/organisms/Sidebar.js): Removed "Logged in as" role badge from navigation drawer.
  - [`frontend/src/app/(dashboard)/layout.js`](file:///e:/expense/frontend/src/app/(dashboard)/layout.js): Refreshed layout references for immediate HMR updates.

#### 🧪 Verification & Testing
- Executed `node -c` on modified frontend components (`Navbar.js`, `Sidebar.js`, `layout.js`). All passed without syntax errors.

---

### [Version 1.3.5] – 2026-10-21

#### 🎯 Summary of Changes
- **Sponsor Tiers Single Row on Mobile (`/sponsors`)**:
  - Arranged all 4 corporate sponsorship tier cards (Platinum, Gold, Silver, Supporting) into a single, sleek horizontal row (`flex flex-row overflow-x-auto snap-x`) on mobile view, eliminating excessive vertical screen consumption.
  - Added Export to Excel (.xlsx) and PDF reports with college branding directly on the sponsors management page.
- **Faculty Login Actions Optimization (`/users`)**:
  - Removed `Edit` and `Delete` buttons for `FACULTY_COORDINATOR` logins across both mobile card views and desktop tables.
  - Made the `Add / Manage Wallet Funds` button prominent and full-width on mobile view so faculty coordinators can quickly tap and credit/debit member wallets without accidental taps or clutter.
- **Audit Ledger Mobile Screen Fitting (`/audit-logs`)**:
  - Implemented responsive mobile cards (`md:hidden`) with zero horizontal scroll for the central audit ledger, fitting 100% within mobile viewport dimensions.
  - Retained full table view for desktop (`hidden md:block`) and preserved 5-click inline amount adjustment.
  - Formatted summary metrics into a responsive 2x2 grid on mobile screens.
- **Guaranteed Export Reliability (Excel & PDF Across All Pages)**:
  - Standardized `async` / `await` execution with comprehensive `try...catch` error handling across Audit Logs, Expenses, Income, Users, and Sponsors.
  - Enhanced `exportHelper.js` with fallback module detection and safe function binding for `jspdf-autotable` and `xlsx-js-style`.

#### 🛠️ Key Modifications & Components Affected
- **Frontend**:
  - [`frontend/src/app/(dashboard)/sponsors/page.js`](file:///e:/expense/frontend/src/app/(dashboard)/sponsors/page.js): Single-row tier cards on mobile, added Excel/PDF exports.
  - [`frontend/src/app/(dashboard)/users/page.js`](file:///e:/expense/frontend/src/app/(dashboard)/users/page.js): Restricted Edit and Delete to Admin only; streamlined Wallet button for Faculty Coordinator; strengthened async exports.
  - [`frontend/src/app/(dashboard)/audit-logs/page.js`](file:///e:/expense/frontend/src/app/(dashboard)/audit-logs/page.js): Added mobile cards for screen-fitting audit ledger; 2x2 stats grid; strengthened async exports.
  - [`frontend/src/app/(dashboard)/expenses/page.js`](file:///e:/expense/frontend/src/app/(dashboard)/expenses/page.js): Strengthened async exports with error catching.
  - [`frontend/src/app/(dashboard)/income/page.js`](file:///e:/expense/frontend/src/app/(dashboard)/income/page.js): Strengthened async exports with error catching.
  - [`frontend/src/utils/exportHelper.js`](file:///e:/expense/frontend/src/utils/exportHelper.js): Dynamic import resolution & robust autoTable binding.

#### 🧪 Verification & Testing
- Validated AST parsing and syntax validity across all 6 modified files using Node and Next/Babel parsers.
- Executed unit tests for PDF and Excel generation.

---

### [Version 1.3.4] – 2026-10-21

#### 🎯 Summary of Changes
- **Header User Profile Chip Removal (Site-Wide)**:
  - Removed the top-right user profile pill (avatar initial icon, user full name, and role badge) from the global header navbar across all dashboard pages.
  - The header bar now cleanly preserves the institution branding, mobile navigation toggle, and interactive notification bell without header clutter.

#### 🛠️ Key Modifications & Components Affected
- **Frontend**:
  - [`frontend/src/components/organisms/Navbar.js`](file:///e:/expense/frontend/src/components/organisms/Navbar.js): Removed the user profile chip, avatar icon, name display, and role badge from the navbar header.

#### 🧪 Verification & Testing
- Validated AST parsing and component syntax validity with Babel parser.
- Confirmed the global `DashboardLayout` properly renders the streamlined header.

---

### [Version 1.3.3] – 2026-10-21

#### 🎯 Summary of Changes
- **Audit Page Streamlining (`/audit-logs`)**:
  - Removed the **`Activity & Security Trail`** tab button, security activity logs table, and redundant tab switcher from the Central Audit Page.
  - The Audit page now cleanly presents the unified **Financial Audit Ledger & Running Balance History** directly, with instant date/category filtering, summary metrics cards, running balance calculation, inline amount correction, and styled Excel/PDF exports.
  - Removed unnecessary background polling and fetching of `/audit-logs` endpoint on this view.

#### 🛠️ Key Modifications & Components Affected
- **Frontend**:
  - [`frontend/src/app/(dashboard)/audit-logs/page.js`](file:///e:/expense/frontend/src/app/(dashboard)/audit-logs/page.js): Removed `Activity & Security Trail` tab button, security logs table view, `logs` and `activeTab` states, and redundant API call to `/audit-logs`.

#### 🧪 Verification & Testing
- Verified AST parsing and syntax validity of `page.js` with Babel/Next parser.
- Validated state cleanup, export buttons display, filter card, and ledger table layout.

---

### [Version 1.3.2] – 2026-10-15

#### 🎯 Summary of Changes
- **Streamlined Submit Expense Modal (All Logins)**:
  - Removed the `Requester Mobile Number (For SMS Alerts)` input and SMS alert notice from the expense submission modal.
  - Streamlined description to a **single `Description & Purpose`** field (removed duplicate `Additional Notes` field) across all login accounts.
  - Cleaned up form layout pairing `Expense Date` and `Original Payment Method` into a balanced 2-column grid.
- **Site-Wide Mobile View Optimization (Zero Horizontal Scroll)**:
  - Ensured users **never have to scroll horizontally** on mobile screens across all pages.
  - Added responsive mobile card layouts (`md:hidden`) alongside widescreen tables (`hidden md:block`) across:
    - **Member Dashboard**: Recent expense requests display as responsive vertical cards.
    - **Income Ledger (`/income`)**: Converted into sleek mobile cards with source, amount, and reference details.
    - **Transactions Ledger (`/transactions`)**: Transformed into mobile transaction cards with color-coded direction and balance indicators.
    - **Sponsors (`/sponsors`)**: Responsive cards for mobile with corporate details, contribution badges, and checklist actions.
  - Fixed mobile header and layout viewport clipping (`max-w-full overflow-x-hidden`) in `layout.js`, `globals.css`, and `Navbar.js`.

#### 🛠️ Key Modifications & Components Affected
1. **Frontend – Expense Submission Modal**:
   - [`frontend/src/app/(dashboard)/expenses/page.js`](file:///e:/expense/frontend/src/app/%28dashboard%29/expenses/page.js): Removed phone input and additional notes; consolidated single description field.
2. **Frontend – Responsive Mobile Layouts**:
   - [`frontend/src/app/layout.js`](file:///e:/expense/frontend/src/app/layout.js): Exported standard viewport configuration and added root overflow constraints.
   - [`frontend/src/app/globals.css`](file:///e:/expense/frontend/src/app/globals.css): Enforced `max-width: 100vw; overflow-x: hidden;` on `html` and `body`.
   - [`frontend/src/app/(dashboard)/layout.js`](file:///e:/expense/frontend/src/app/%28dashboard%29/layout.js): Added `w-full max-w-full overflow-x-hidden` on main wrapper.
   - [`frontend/src/components/organisms/Navbar.js`](file:///e:/expense/frontend/src/components/organisms/Navbar.js): Prevented header overflow on small mobile viewports.
   - [`frontend/src/app/(dashboard)/dashboard/page.js`](file:///e:/expense/frontend/src/app/%28dashboard%29/dashboard/page.js): Added mobile cards for recent expenses.
   - [`frontend/src/app/(dashboard)/income/page.js`](file:///e:/expense/frontend/src/app/%28dashboard%29/income/page.js): Added mobile cards for income ledger.
   - [`frontend/src/app/(dashboard)/transactions/page.js`](file:///e:/expense/frontend/src/app/%28dashboard%29/transactions/page.js): Added mobile cards for transactions ledger.
   - [`frontend/src/app/(dashboard)/sponsors/page.js`](file:///e:/expense/frontend/src/app/%28dashboard%29/sponsors/page.js): Added mobile cards for sponsors list.

---

### [Version 1.3.1] – 2026-10-15

#### 🎯 Summary of Changes
- **Single Button Navigation in Sidebar**: Removed duplicate and competing navigation items (`Submit Expense` and `Approved Expenses`) from the sidebar. Replaced with a single clean **`My Expenses`** button for Members, completely eliminating duplicate active blue tab highlights.
- **Removed Duplicate Expense Submission Page**: Replaced the standalone separate `/expenses/new` page with an in-page, single-click **Submit Expense Modal** right inside the unified Expense Tracker (`/expenses`).
- **Single-Click Modal Submission**: Clicking `+ Submit New Expense` now instantly opens the submission form directly on the expenses page with zero page reloads or route jumping.
- **Automatic Route Forwarding**: Access to `/expenses/new` or clicking `Submit New Expense` from the Dashboard automatically opens the modal on `/expenses` via `action=new`.

#### 🛠️ Key Modifications & Components Affected
1. **Frontend – Sidebar Component**:
   - [`frontend/src/components/organisms/Sidebar.js`](file:///e:/expense/frontend/src/components/organisms/Sidebar.js):
     - Consolidated Member navigation to a single `{ label: 'My Expenses', href: '/expenses' }` item.
     - Removed duplicate `{ label: 'Approved Expenses' }` from Treasurer role.
     - Fixed active route matching to prevent multiple items highlighting simultaneously.
2. **Frontend – Expenses Management Page**:
   - [`frontend/src/app/(dashboard)/expenses/page.js`](file:///e:/expense/frontend/src/app/%28dashboard%29/expenses/page.js):
     - Added in-page interactive Submit Expense Modal with file upload, category select, event linking, and SMS phone input.
     - Made `+ Submit New Expense` open the modal with a single click.
     - Added auto-open handling when query parameter `action=new` is present.
3. **Frontend – New Expense Page & Dashboard**:
   - [`frontend/src/app/(dashboard)/expenses/new/page.js`](file:///e:/expense/frontend/src/app/%28dashboard%29/expenses/new/page.js): Replaced duplicate full-page form with an instantaneous redirect to `/expenses?action=new`.
   - [`frontend/src/app/(dashboard)/dashboard/page.js`](file:///e:/expense/frontend/src/app/%28dashboard%29/dashboard/page.js): Updated `+ Submit New Expense` button to open `/expenses?action=new`.

---

### [Version 1.3.0] – 2026-10-15

#### 🎯 Summary of Changes
- **Expense Page Clean-up**: Removed the dual `+ Expense` and `+ Income` buttons and tab switchers from the Expense Management Page (`/expenses`), restoring the streamlined single **`+ Submit New Expense`** button.
- **User Login Wallet System**: Added dedicated member and officer wallet balances (`walletBalance`, `totalWalletAllocated`) directly within user profiles.
- **Wallet Fund Management in Users & Approvals (`/users`)**: Empowered `ADMIN` and `FACULTY_COORDINATOR` to directly credit (`ADD`) or debit (`DEDUCT`) wallet funds for any user with transaction notes, audit logging, and automated notifications.
- **Automated Expense Deductions & Refunds**:
  - Whenever a member submits an out-of-pocket expense bill, the submitted amount is automatically deducted from their personal wallet balance.
  - If a submitted expense is rejected during the approval workflow, the expense amount is automatically refunded back to the member's wallet balance.
- **Role-Tailored Dashboards**:
  - **Member Dashboard**: Dedicated personal financial portal displaying strictly the member's available wallet balance, total allocated funds, personal total/pending/approved expenses, and recent submission history. Sensitive club-wide liquidity and sponsor records are hidden.
  - **Leadership Dashboard**: Continues to display comprehensive club-wide financial metrics, income/expense breakdown, sponsor tiers, and approval/payment queues for `ADMIN`, `FACULTY_COORDINATOR`, `FINANCER`, and `TREASURER`.
- **Password Visibility Toggle**: Integrated interactive view/hide eye toggles (`Eye` / `EyeOff`) across all password inputs:
  - User Sign-In password field on the login page (`/login`).
  - Forgot Password reset fields (New Password and Confirm Password) on `/login`.
  - Member Self-Registration password field on `/login`.
  - Add New User modal and Reset Password modal on the Users & Approvals page (`/users`).
- **Instant Root Route Redirect & Failsafe**: Replaced the hung loading spinner on `http://localhost:3000` with instant inspection of auth credentials, immediate `router.replace`, hard navigation fallback (`window.location.replace`), and a responsive redirect card with a direct link to prevent getting stuck on a blank screen.

#### 🛠️ Key Modifications & Components Affected
1. **Backend – User Model, Controller & Routes**:
   - [`backend/models/User.js`](file:///e:/expense/backend/models/User.js): Added `walletBalance` (default: 0, min: 0) and `totalWalletAllocated` (default: 0) to `userSchema`.
   - [`backend/controllers/userController.js`](file:///e:/expense/backend/controllers/userController.js): Implemented `updateUserWallet` to handle credit/debit operations, balance validation, audit log generation, and in-app notifications.
   - [`backend/routes/userRoutes.js`](file:///e:/expense/backend/routes/userRoutes.js): Added `POST /api/users/:id/wallet` route protected for `ADMIN` and `FACULTY_COORDINATOR`.
2. **Backend – Expense & Report Services**:
   - [`backend/services/expenseService.js`](file:///e:/expense/backend/services/expenseService.js):
     - Auto-deducted submitted amount from requester's `walletBalance` in `submitExpense`.
     - Auto-refunded expense amount back to user's `walletBalance` in `rejectExpense`.
   - [`backend/services/reportService.js`](file:///e:/expense/backend/services/reportService.js) & [`backend/controllers/reportController.js`](file:///e:/expense/backend/controllers/reportController.js):
     - Updated `getFinancialSummary(req.user)` to return member-specific financial overview when `user.role === 'MEMBER'`.
3. **Frontend – Dashboard Page**:
   - [`frontend/src/app/(dashboard)/dashboard/page.js`](file:///e:/expense/frontend/src/app/%28dashboard%29/dashboard/page.js): Added conditional view rendering: personal wallet cards, spending progress bar, and user expense history for `MEMBER` role; club financial overview for leadership roles.
4. **Frontend – Users & Approvals Page**:
   - [`frontend/src/app/(dashboard)/users/page.js`](file:///e:/expense/frontend/src/app/%28dashboard%29/users/page.js):
     - Added Wallet Balance column to user management table and mobile cards.
     - Added "Manage User Wallet" modal with `ADD` / `DEDUCT` actions and amount controls for Admin/Faculty.
     - Added password eye toggle buttons to Add User and Reset Password modals.
5. **Frontend – Login & Expense Pages**:
   - [`frontend/src/app/(dashboard)/expenses/page.js`](file:///e:/expense/frontend/src/app/%28dashboard%29/expenses/page.js): Restored single clean `+ Submit New Expense` button; removed dual income/expense tab switchers.
   - [`frontend/src/app/(auth)/login/page.js`](file:///e:/expense/frontend/src/app/%28auth%29/login/page.js): Added password visibility toggle buttons to Sign In, Forgot Password, and Register forms.

#### 🧪 Verification & Testing
- Node.js backend syntax verified on `User.js`, `userController.js`, `userRoutes.js`, `expenseService.js`, `reportService.js`, `reportController.js`.
- Next.js production build (`npm run build --prefix frontend`) verified with zero errors.

---

### [Version 1.2.0] – 2026-10-15

#### 🎯 Summary of Changes
- Made **Allocated Event Budget optional** when creating or modifying club events.
- Enabled **automatic tracking of paid event expenses**: as soon as an expense associated with an event is marked as `PAID` or `VERIFIED`, it is immediately added to that event's total expense (`spentAmount`).
- Enhanced the **Expense Management Page (`/expenses`)** with two prominent action buttons: **`+ Expense`** and **`+ Income`**, along with dedicated view-switching tab buttons between the Expense Tracker and Income Ledger.
- Integrated a full **Record Club Income Modal** directly inside `/expenses`.

#### 🛠️ Key Modifications & Components Affected
1. **Backend – Event Model & Controller**:
   - [`backend/models/Event.js`](file:///e:/expense/backend/models/Event.js): Modified `allocatedBudget` schema definition from `required: true` to `required: false, default: 0`.
   - [`backend/controllers/eventController.js`](file:///e:/expense/backend/controllers/eventController.js):
     - Updated `createEvent` and `updateEvent` to safely handle optional/empty budget inputs defaulting to ₹0.
     - Attached linked expenses in `getEvents` to provide instant visibility into expenses tied to each event.
2. **Backend – Budget Service & Income Routes**:
   - [`backend/services/budgetService.js`](file:///e:/expense/backend/services/budgetService.js):
     - Updated `expenseFilter` to `{ status: { $in: ['PAID', 'VERIFIED'] } }`, ensuring expenses paid in the payment queue automatically accumulate in the event's `spentAmount`.
     - Gracefully handled zero or unspecified budgets (`allocatedBudget === 0`), eliminating false "budget exceeded" warnings when budgets are flexible.
   - [`backend/routes/incomeRoutes.js`](file:///e:/expense/backend/routes/incomeRoutes.js): Authorized leadership roles (`ADMIN`, `FINANCER`, `TREASURER`, `FACULTY_COORDINATOR`) to create income entries directly.
3. **Frontend – Events Management Page**:
   - [`frontend/src/app/(dashboard)/events/page.js`](file:///e:/expense/frontend/src/app/%28dashboard%29/events/page.js):
     - Form field changed to `"Allocated Event Budget (₹) (Optional)"` with HTML5 `required` constraint removed.
     - Event cards updated to display `"Event Expense: ₹..."`, `"Optional (Not Set)"`, and dynamic spending percentage.
     - Added an auto-tracked preview list of all paid expenses linked to each event.
4. **Frontend – Expenses Management Page**:
   - [`frontend/src/app/(dashboard)/expenses/page.js`](file:///e:/expense/frontend/src/app/%28dashboard%29/expenses/page.js):
     - **Header Action Buttons**: Added `+ Expense` (blue, routes to `/expenses/new`) and `+ Income` (emerald green, opens income modal).
     - **View Switcher Tabs**: Added `[ Expense ]` and `[ Income ]` segmented buttons to toggle between the 7-card expense tracker and the income ledger on a single page.
     - **Embedded Income Modal**: Complete modal with validation for source, amount, date, payment method, transaction reference, and description.

#### 🧪 Verification & Testing
- Node.js backend syntax verified: `Event.js`, `eventController.js`, `budgetService.js`, `incomeRoutes.js`.
- Next.js production build (`npm run build --prefix frontend`) passed successfully with 0 errors across all 20 static and dynamic routes.

---

### [Version 1.1.0] – 2026-10-14

#### 🎯 Summary of Changes
- Integrated **Brevo (Sendinblue) SMS & Email Notification Services** for real-time mobile and email updates across the approval workflow.
- Implemented **Leadership Auto-Approval**: Expenses submitted by leadership members (`ADMIN`, `FACULTY_COORDINATOR`, `TREASURER`) automatically bypass the review queue and move directly to `TREASURER_APPROVED` for financer payment.
- Added requester mobile number collection during expense submission for SMS dispatch.

#### 🛠️ Key Modifications & Components Affected
1. **Backend – Notification Services**:
   - `backend/services/brevoSmsService.js`: Added Brevo transactional SMS dispatch via REST API (`https://api.brevo.com/v3/transactionalSMS/sms`). Dispatches alerts on submission, approval, payment, and closure.
   - `backend/services/emailService.js`: Added automated email notification dispatch for leadership and members.
2. **Backend – Expense Service**:
   - `backend/services/expenseService.js`:
     - Auto-approved status set to `TREASURER_APPROVED` for leadership submissions.
     - Automatic user mobile number persistence upon expense submission.
3. **Frontend – New Expense Submission**:
   - `frontend/src/app/(dashboard)/expenses/new/page.js`: Added phone number input with SMS alert notice and category selector grid.

---

### [Version 1.0.0] – 2026-10-12

#### 🎯 Initial Complete System Release (Phases 0 through 10)

#### 1. System Architecture & Tech Stack
- **Backend**: Node.js, Express.js REST API with JWT bearer authentication, bcryptjs encryption, and Multer file storage.
- **Database**: MongoDB with Mongoose ORM, full indexing, and relational references.
- **Frontend**: Next.js 14+ (App Router), Tailwind CSS, Lucide React icons, Recharts interactive data visualization.
- **Institutional Branding**: Panimalar Engineering College header styling with custom DS Club insignia.

#### 2. Core Functional Modules Implemented
- **Role-Based Access Control (RBAC)**:
  - `ADMIN`: System-wide access, user roles, audit logs, overall club budget, and master settings.
  - `FACULTY_COORDINATOR`: Final verification queue, expense approvals, and institutional oversight.
  - `FINANCER`: Payment queue processing, payment proof uploads, income recording, and sponsor settlements.
  - `TREASURER`: Review queue for reimbursement requests, budget tracking, and status handling.
  - `MEMBER`: Out-of-pocket expense reimbursement submissions, receipt uploads, personal history tracking.
- **5-Stage Reimbursement Pipeline**:
  `PENDING_TREASURER` ➔ `TREASURER_APPROVED` (Payment Pending) ➔ `PAID` ➔ `VERIFIED` (Closed in Ledger) or `REJECTED`.
- **Dynamic Sponsorship Tiering**:
  Automatic tier categorization based on contribution amount:
  - **Platinum**: ₹1,00,000+
  - **Gold**: ₹50,000 – ₹99,999.99
  - **Silver**: ₹25,000 – ₹49,999.99
  - **Supporting**: Below ₹25,000
- **Double-Entry Financial Ledger & Audit Trail**:
  - `Transaction` model recording all `CREDIT` (income, sponsorships) and `DEBIT` (verified expense reimbursements) transactions.
  - `AuditLog` model recording every administrative, approval, financial, and user action.

---

## 🔮 Future Updates & Planned Roadmap

The following enhancements are queued for upcoming iterations. When implementing any of these, record the changes under a new version heading in this document:

- [ ] **Export to Excel & PDF Reports**: Generate printable PDF expense vouchers and downloadable Excel financial sheets for college audit submission.
- [ ] **Multi-Receipt Attachments**: Support uploading multiple bill attachments or PDFs per reimbursement request.
- [ ] **Department & Academic Year Analytics**: Filter expenses and budgets by department (e.g., CSE, AI&DS, IT) and academic fiscal year.
- [ ] **Automated Monthly Email Summaries**: Scheduled monthly summary reports sent to Faculty Coordinators and Club Advisors.
