'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useAuth } from '../../../context/AuthContext';
import API from '../../../services/api';
import MetricCard from '../../../components/molecules/MetricCard';
import Button from '../../../components/atoms/Button';
import AmountText from '../../../components/atoms/AmountText';
import StatusBadge from '../../../components/molecules/StatusBadge';
import {
  Wallet,
  DollarSign,
  Receipt,
  Clock,
  CheckCircle2,
  Award,
  Calendar,
  PlusCircle,
  AlertTriangle,
  CreditCard,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

const DashboardCharts = dynamic(
  () => import('../../../components/organisms/DashboardCharts'),
  {
    ssr: false,
    loading: () => (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
        <div className="h-72 bg-white rounded-2xl border border-slate-200/80 flex items-center justify-center text-xs text-slate-400">
          Loading charts...
        </div>
        <div className="h-72 bg-white rounded-2xl border border-slate-200/80 flex items-center justify-center text-xs text-slate-400">
          Loading charts...
        </div>
      </div>
    ),
  }
);

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const resSummary = await API.get('/reports/financial-summary');

      if (resSummary.data?.success) {
        setSummary(resSummary.data.data);
      } else {
        setError(resSummary.data?.message || 'Failed to load dashboard metrics');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Unable to load dashboard data. Please check your connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-medium text-slate-600">Loading Dashboard...</p>
      </div>
    );
  }

  if (error && !summary) {
    return (
      <div className="p-8 max-w-lg mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm text-center space-y-4 my-8">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Dashboard Unavailable</h3>
        <p className="text-xs text-slate-600 leading-relaxed">{error}</p>
        <Button
          variant="primary"
          size="sm"
          onClick={fetchDashboardData}
          className="font-bold inline-flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </Button>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  const role = user?.role || 'MEMBER';
  const isMember = role === 'MEMBER' || summary.isMember;
  const budget = summary.budgetSummary || {};

  // =========================================================================
  // 1. MEMBER PERSONAL DASHBOARD VIEW
  // =========================================================================
  if (isMember) {
    const recentExpenses = summary.recentExpenses || [];

    return (
      <div className="space-y-3.5 sm:space-y-5">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <span className="px-2 py-0.5 text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 rounded-md uppercase">
              MEMBER PERSONAL DASHBOARD
            </span>
            <h1 className="text-base sm:text-xl font-black text-slate-900 mt-1 sm:mt-1.5">
              Welcome, {user?.fullName || 'Club Member'}!
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              Track your allocated club wallet balance, upload out-of-pocket expenses, and monitor approval status.
            </p>
          </div>

          <div>
            <Link href="/expenses?action=new">
              <Button variant="primary" size="sm" className="font-bold shadow-md shadow-blue-500/20 text-xs py-1.5 px-3">
                <PlusCircle className="w-3.5 h-3.5 mr-1.5" /> Submit New Expense
              </Button>
            </Link>
          </div>
        </div>

        {/* Member Wallet Info Banner */}
        <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-50/95 to-indigo-50/95 border border-blue-200 rounded-2xl text-[11px] sm:text-xs text-blue-900 flex items-center justify-between gap-2.5 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="text-xl sm:text-2xl">💳</span>
            <div>
              <p className="font-extrabold text-xs sm:text-sm text-blue-950">Automated Member Wallet System</p>
              <p className="text-[11px] sm:text-xs text-blue-800 mt-0.5 leading-relaxed">
                Faculty Coordinators allocate advance funds directly into your wallet. When you record a club expense that comes under your wallet balance, <strong>no approval request is sent</strong> — it is automatically approved and deducted from your balance.
              </p>
            </div>
          </div>
        </div>

        {/* Member Personal Financial Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3.5">
          <MetricCard
            title="My Wallet Balance"
            amount={summary.walletBalance || 0}
            icon={Wallet}
            color="emerald"
            subtitle="Available remaining funds"
          />

          <MetricCard
            title="Faculty Given (Allocated)"
            amount={summary.totalWalletAllocated || 0}
            icon={DollarSign}
            color="blue"
            subtitle="Total advance given by Faculty"
          />

          <MetricCard
            title="Total Amount Spent"
            amount={summary.walletSpent || 0}
            icon={Receipt}
            color="purple"
            subtitle="Deducted for verified expenses"
          />

          <MetricCard
            title="Times Paid"
            count={summary.timesPaid || 0}
            isCurrency={false}
            icon={CheckCircle2}
            color="indigo"
            subtitle="Paid transactions from wallet"
          />
        </div>

        {/* Member's Personal Expense Submissions */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">My Recent Expense Requests</h3>
              <p className="text-xs text-slate-500 mt-0.5">Your submitted bills and reimbursement track</p>
            </div>
            <Link
              href="/expenses?myRequests=true"
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              View All My Expenses <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentExpenses.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              You have not submitted any expenses yet. Click "Submit New Expense" above to add your first bill!
            </div>
          ) : (
            <>
              {/* Mobile View Cards (Zero Horizontal Scroll) */}
              <div className="md:hidden divide-y divide-slate-100 p-3 space-y-3">
                {recentExpenses.map((exp) => (
                  <div key={exp._id} className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="font-mono text-[10px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                          {exp.expenseCode}
                        </span>
                        <h4 className="font-bold text-xs text-slate-900 mt-1 truncate">{exp.title}</h4>
                        <p className="text-[10px] text-slate-500">{exp.category} • {new Date(exp.expenseDate || exp.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <AmountText amount={exp.amount} size="sm" type="debit" />
                        <div className="mt-1">
                          <StatusBadge status={exp.status} />
                        </div>
                      </div>
                    </div>
                    {exp.receiptPath && (
                      <div className="pt-2 border-t border-slate-200/60 flex justify-end">
                        <a
                          href={exp.receiptPath.startsWith('http') ? exp.receiptPath : `http://localhost:5000${exp.receiptPath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-[11px] font-bold text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" /> View Bill
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Expense Code</th>
                      <th className="px-6 py-4">Title & Category</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentExpenses.map((exp) => (
                      <tr key={exp._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-slate-900 text-xs">
                          {exp.expenseCode}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900 leading-tight">{exp.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{exp.category}</p>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-slate-600">
                          {new Date(exp.expenseDate || exp.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <AmountText amount={exp.amount} size="sm" type="debit" />
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={exp.status} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          {exp.receiptPath ? (
                            <a
                              href={exp.receiptPath.startsWith('http') ? exp.receiptPath : `http://localhost:5000${exp.receiptPath}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-xs font-bold text-blue-600 hover:text-blue-800"
                            >
                              <ExternalLink className="w-3.5 h-3.5 mr-1" /> View Bill
                            </a>
                          ) : (
                            <span className="text-xs text-slate-400">None</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. LEADERSHIP (FACULTY, ADMIN, FINANCER, TREASURER) CLUB DASHBOARD VIEW
  // =========================================================================
  return (
    <div className="space-y-3.5 sm:space-y-5">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200 rounded-md uppercase tracking-wide">
              {role} DASHBOARD
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Panimalar DS Club</span>
          </div>
          <h1 className="text-base sm:text-xl font-black text-slate-900 mt-1 sm:mt-1.5 tracking-tight">
            DSCLUB EXPENSE TRACKER
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 max-w-2xl">
            Real-time financial oversight, member wallet budgets, corporate sponsorships, and club operations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {['TREASURER', 'FACULTY_COORDINATOR', 'ADMIN'].includes(role) && (
            <Link href="/approval-queue">
              <Button variant="warning" size="sm" className="font-bold relative shadow-xs text-xs py-1.5 px-3">
                <Clock className="w-3.5 h-3.5 mr-1.5" />
                <span>Approval Queue</span>
                {summary.pendingApprovalCount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-700 text-white shadow-xs">
                    {summary.pendingApprovalCount}
                  </span>
                )}
              </Button>
            </Link>
          )}

          {['FINANCER', 'ADMIN'].includes(role) && (
            <Link href="/payment-queue">
              <Button variant="primary" size="sm" className="font-bold relative shadow-xs text-xs py-1.5 px-3">
                <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                <span>Payment Queue</span>
                {summary.pendingPaymentCount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-blue-800 text-white shadow-xs">
                    {summary.pendingPaymentCount}
                  </span>
                )}
              </Button>
            </Link>
          )}

          <Link href="/expenses?action=new">
            <Button variant="outline" size="sm" className="font-bold shadow-2xs text-xs py-1.5 px-3">
              <PlusCircle className="w-3.5 h-3.5 mr-1.5 text-blue-600" /> New Expense
            </Button>
          </Link>
        </div>
      </div>

      {/* Budget Warning Banner if Exceeded or Limit Reached */}
      {budget.warningStatus && budget.warningStatus !== 'NORMAL' && (
        <div
          className={`p-3 sm:p-4 rounded-xl border flex items-center justify-between ${
            budget.warningStatus === 'EXCEEDED'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <div>
              <p className="text-[10px] sm:text-xs font-bold uppercase">{budget.warningStatus} ALERT</p>
              <p className="text-xs font-medium">{budget.warningMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Financial Metrics Cards (Structured 3x2 Grid - 2 in a row on mobile, reduced equal row/col gap) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3.5">
        <MetricCard
          title="Available Club Balance"
          amount={summary.availableBalance}
          icon={Wallet}
          color="emerald"
          subtitle={
            summary.totalAllocatedWallets > 0
              ? `₹${Number(summary.totalAllocatedWallets).toLocaleString('en-IN')} member wallets deducted`
              : 'Net verified liquidity'
          }
        />

        <MetricCard
          title="Total Club Income"
          amount={summary.totalIncome}
          icon={DollarSign}
          color="blue"
          subtitle="Grants & Corporate Sponsorships"
        />

        <MetricCard
          title="Total Verified Expenses"
          amount={summary.totalExpenses}
          icon={Receipt}
          color="indigo"
          subtitle="Audited & verified club expenditures"
        />

        <MetricCard
          title="Pending Reimbursements"
          amount={summary.pendingReimbursementAmount}
          icon={Clock}
          color="amber"
          subtitle={
            summary.pendingApprovalCount > 0
              ? `${summary.pendingApprovalCount} requests awaiting approval`
              : 'Awaiting payment/approval'
          }
        />

        <MetricCard
          title="Sponsorship Received"
          amount={summary.totalSponsorshipReceived}
          icon={Award}
          color="purple"
          subtitle={`${summary.activeSponsorsCount || 0} Active Corporate Sponsors`}
        />

        <MetricCard
          title="Upcoming Club Events"
          count={summary.upcomingEventsCount}
          isCurrency={false}
          icon={Calendar}
          color="cyan"
          subtitle="Scheduled club events"
        />
      </div>

      {/* Interactive Charts Section (Directly below boxes) */}
      <DashboardCharts
        monthlySpending={summary.monthlySpending}
        categoryBreakdown={summary.categoryBreakdown}
        sponsorshipByTier={summary.sponsorshipByTier}
      />

      {/* ========================================================================= */}
      {/* 3. FACULTY MEMBER WALLET ALLOCATIONS TABLE (TREASURER, FACULTY, ADMIN)    */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden space-y-0">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                Faculty Member Wallet Allocations & Track
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 rounded-md uppercase">
                {role} VIEW
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Advances given by faculty to each club member, actual amount spent, live wallet balance, and times paid.
            </p>
          </div>

          <Link href="/users">
            <Button variant="outline" size="sm" className="font-bold text-xs">
              Manage in Users & Approvals <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>

        {(!summary.memberWallets || summary.memberWallets.length === 0) ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No member wallet allocations found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[10px] text-slate-500 font-bold tracking-wider">
                <tr>
                  <th className="px-4 py-3.5 text-center">#</th>
                  <th className="px-4 py-3.5">Roll Number / ID</th>
                  <th className="px-5 py-3.5">Student / Member Name</th>
                  <th className="px-4 py-3.5 text-center">Section</th>
                  <th className="px-4 py-3.5">Department</th>
                  <th className="px-5 py-3.5 text-right">Faculty Given (INR)</th>
                  <th className="px-5 py-3.5 text-right">Amount Spent (INR)</th>
                  <th className="px-5 py-3.5 text-right">Wallet Balance (INR)</th>
                  <th className="px-4 py-3.5 text-center">Times Paid</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {summary.memberWallets.map((m, idx) => (
                  <tr key={m._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 text-center font-bold text-slate-400 text-xs">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-blue-700 text-xs whitespace-nowrap">
                      {m.rollNo || '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-extrabold text-slate-900 text-xs">{m.fullName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{m.email}</p>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {m.section || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 font-medium">
                      {m.department}
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-blue-700">
                      ₹{Number(m.facultyGiven || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-rose-600">
                      ₹{Number(m.spentAmount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="font-mono font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 whitespace-nowrap">
                        ₹{Number(m.walletBalance || 0).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {m.timesPaid || 0} times
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {m.approvalStatus || 'APPROVED'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
