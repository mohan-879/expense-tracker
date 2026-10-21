'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import API from '../../../services/api';
import ExpenseTable from '../../../components/organisms/ExpenseTable';
import Button from '../../../components/atoms/Button';
import Input from '../../../components/atoms/Input';
import Select from '../../../components/atoms/Select';
import AmountText from '../../../components/atoms/AmountText';
import {
  PlusCircle,
  Search,
  Filter,
  Receipt,
  Clock,
  CheckCircle2,
  ShieldCheck,
  XCircle,
  CreditCard,
  Hourglass,
  X,
  Layers,
  Upload,
  AlertCircle,
  Send,
  Calendar,
  DollarSign,
  Tag,
  Phone,
  FileText,
  FileSpreadsheet,
} from 'lucide-react';
import { exportToStyledExcel, exportToStyledPDF } from '../../../utils/exportHelper';

export default function ExpensesPage() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [allExpenses, setAllExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Submit Expense Modal States
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [events, setEvents] = useState([]);
  const [receiptFile, setReceiptFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Refreshments',
    amount: '',
    description: '',
    expenseDate: new Date().toISOString().split('T')[0],
    eventId: '',
    paidBy: user?.fullName || '',
    originalPaymentMethod: 'UPI',
  });

  useEffect(() => {
    fetchExpenses();
    fetchEvents();

    // Check if opened with ?action=new or ?new=true
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('action') === 'new' || urlParams.get('new') === 'true') {
        setIsSubmitModalOpen(true);
      }
    }
  }, [statusFilter, categoryFilter]);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        paidBy: prev.paidBy || user.fullName || '',
      }));
    }
  }, [user]);

  const fetchEvents = async () => {
    try {
      const res = await API.get('/events?onlyActive=true');
      if (res.data?.success) {
        // Double-filter on client side to guarantee ended/inactive events are never showed
        const activeEvents = (res.data.data || []).filter(
          (e) => e.isActive !== false && e.status !== 'COMPLETED' && e.status !== 'CANCELLED'
        );
        setEvents(activeEvents);
      }
    } catch (err) {
      console.error('Failed to load events:', err);
    }
  };

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (search) params.search = search;

      // Fetch both complete list (for card metric counters) and status-filtered list (for displayed table)
      const [allRes, filteredRes] = await Promise.all([
        API.get('/expenses', { params: { category: categoryFilter, search } }),
        API.get('/expenses', { params }),
      ]);

      if (allRes.data?.success) {
        setAllExpenses(allRes.data.data);
      }
      if (filteredRes.data?.success) {
        setExpenses(filteredRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitExpense = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    if (!receiptFile) {
      setSubmitError('Please upload the bill or receipt document.');
      return;
    }

    if (!formData.title.trim()) {
      setSubmitError('Please provide an expense title.');
      return;
    }

    if (Number(formData.amount) <= 0) {
      setSubmitError('Expense amount must be greater than zero.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = new FormData();
      Object.keys(formData).forEach((key) => {
        payload.append(key, formData[key]);
      });
      payload.append('receipt', receiptFile);

      const res = await API.post('/expenses', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.success) {
        setSubmitSuccess('Expense reimbursement request submitted successfully! It will automatically deduct from your wallet.');
        setTimeout(() => {
          setIsSubmitModalOpen(false);
          setSubmitSuccess('');
          setReceiptFile(null);
          setFormData({
            title: '',
            category: 'Refreshments',
            amount: '',
            description: '',
            expenseDate: new Date().toISOString().split('T')[0],
            eventId: '',
            paidBy: user?.fullName || '',
            originalPaymentMethod: 'UPI',
          });
          fetchExpenses();
        }, 1200);
      }
    } catch (err) {
      setSubmitError(err.response?.data?.message || err.message || 'Failed to submit expense request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchExpenses();
  };

  const handleClearSearch = () => {
    setSearch('');
    fetchExpenses();
  };

  const categoryOptions = [
    'Transport',
    'Food',
    'Refreshments',
    'Water',
    'Jerseys',
    'T-Shirts',
    'Race Registration',
    'Medical / First Aid',
    'Equipment',
    'Venue',
    'Printing',
    'Banner',
    'Certificates',
    'Medals',
    'Marketing',
    'Accommodation',
    'Event Materials',
    'Miscellaneous',
  ];

  // Statistical calculations from allExpenses so card counters stay true during status filtering
  const totalCount = allExpenses.length;
  const pendingCount = allExpenses.filter((e) => e.status === 'PENDING_TREASURER').length;
  const approvedCount = allExpenses.filter((e) => ['TREASURER_APPROVED', 'PAYMENT_PENDING'].includes(e.status)).length;
  const paidCount = allExpenses.filter((e) => e.status === 'PAID').length;
  const verifiedCount = allExpenses.filter((e) => e.status === 'VERIFIED').length;
  const rejectedCount = allExpenses.filter((e) => e.status === 'REJECTED').length;
  const totalApprovedSum = allExpenses
    .filter((e) => ['TREASURER_APPROVED', 'PAID', 'VERIFIED'].includes(e.status))
    .reduce((acc, e) => acc + (e.approvedAmount || e.amount), 0);

  // Export to Excel (.xlsx) matching structured model format
  const exportToExcel = async () => {
    if (expenses.length === 0) {
      alert('No expense records available to export.');
      return;
    }

    try {
      const statusMap = {
        PENDING_TREASURER: 'Pending Approval',
        TREASURER_APPROVED: 'Approved (Pending Payment)',
        PAYMENT_PENDING: 'Payment Pending',
        REJECTED: 'Rejected',
        PAID: 'Paid (Pending Verification)',
        VERIFIED: 'Completed / Verified',
      };

      const headers = [
        '#',
        'Roll Number / ID',
        'Student Name',
        'Section',
        'Department',
        'Club Role',
        'Expense Title',
        'Category',
        'Claimed (INR)',
        'Approved (INR)',
        'Status',
        'Submitted At',
        'Completed At',
      ];

      const rows = expenses.map((exp, idx) => {
        const submittedDate = new Date(exp.expenseDate || exp.createdAt).toLocaleString('en-IN');
        const isCompleted = ['PAID', 'VERIFIED'].includes(exp.status);
        const completedDate = isCompleted
          ? new Date(exp.updatedAt || exp.paidAt || exp.createdAt).toLocaleString('en-IN')
          : '—';

        return [
          idx + 1,
          exp.user?.rollNo || exp.expenseCode || '-',
          exp.user?.fullName || exp.paidBy || '-',
          exp.user?.section || '-',
          exp.user?.department || 'AI&DS',
          exp.user?.clubRole || 'MEMBER',
          exp.title || '-',
          exp.category || '-',
          exp.amount || 0,
          exp.approvedAmount || exp.amount || 0,
          statusMap[exp.status] || exp.status,
          submittedDate,
          completedDate,
        ];
      });

      const totalClaimed = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
      const totalApproved = expenses.reduce((acc, e) => acc + (e.approvedAmount || e.amount || 0), 0);

      await exportToStyledExcel({
        filename: `Panimalar_Expense_Tracker_${new Date().toISOString().slice(0, 10)}.xlsx`,
        sheetName: 'Expense_Tracker',
        reportTitle: 'EXPENSE TRACKER',
        metaInfo: `Generated: ${new Date().toLocaleString('en-IN')} | Total Records: ${expenses.length} | Claimed: Rs. ${totalClaimed.toLocaleString('en-IN')} | Approved: Rs. ${totalApproved.toLocaleString('en-IN')}`,
        headers,
        rows,
        columnAlignments: [
          'center', // #
          'center', // Roll Number / ID
          'left',   // Student Name
          'center', // Section
          'center', // Department
          'center', // Club Role
          'left',   // Expense Title
          'left',   // Category
          'right',  // Claimed (INR)
          'right',  // Approved (INR)
          'center', // Status
          'center', // Submitted At
          'center', // Completed At
        ],
      });
    } catch (err) {
      console.error('Export Excel failed:', err);
      alert('Failed to export Excel: ' + (err.message || 'Unknown error'));
    }
  };

  // Export to PDF matching structured model format
  const exportToPDF = async () => {
    if (expenses.length === 0) {
      alert('No expense records available to export.');
      return;
    }

    try {
      const statusMap = {
        PENDING_TREASURER: 'Pending Approval',
        TREASURER_APPROVED: 'Approved',
        PAYMENT_PENDING: 'Payment Pending',
        REJECTED: 'Rejected',
        PAID: 'Paid',
        VERIFIED: 'Completed',
      };

      const headers = [
        '#',
        'Roll No / ID',
        'Student Name',
        'Sec',
        'Dept',
        'Title / Category',
        'Claimed',
        'Approved',
        'Status',
        'Submitted At',
        'Completed At',
      ];

      const rows = expenses.map((exp, idx) => {
        const submittedDate = new Date(exp.expenseDate || exp.createdAt).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: '2-digit',
        });
        const isCompleted = ['PAID', 'VERIFIED'].includes(exp.status);
        const completedDate = isCompleted
          ? new Date(exp.updatedAt || exp.paidAt || exp.createdAt).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: '2-digit',
            })
          : '—';

        return [
          idx + 1,
          exp.user?.rollNo || exp.expenseCode || '-',
          exp.user?.fullName || exp.paidBy || '-',
          exp.user?.section || '-',
          exp.user?.department || 'AI&DS',
          `${exp.title} (${exp.category})`,
          `Rs. ${(exp.amount || 0).toLocaleString('en-IN')}`,
          `Rs. ${(exp.approvedAmount || exp.amount || 0).toLocaleString('en-IN')}`,
          statusMap[exp.status] || exp.status,
          submittedDate,
          completedDate,
        ];
      });

      const totalClaimed = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
      const totalApproved = expenses.reduce((acc, e) => acc + (e.approvedAmount || e.amount || 0), 0);

      await exportToStyledPDF({
        filename: `Panimalar_Expense_Tracker_${new Date().toISOString().slice(0, 10)}.pdf`,
        reportTitle: 'EXPENSE TRACKER',
        metaInfo: `Generated: ${new Date().toLocaleString('en-IN')} | Records: ${expenses.length} | Total Claimed: Rs. ${totalClaimed.toLocaleString('en-IN')} | Total Approved: Rs. ${totalApproved.toLocaleString('en-IN')}`,
        headers,
        rows,
        orientation: 'landscape',
        columnStyles: {
          0: { halign: 'center', cellWidth: 10 },
          1: { halign: 'center', cellWidth: 28 },
          2: { halign: 'left' },
          3: { halign: 'center', cellWidth: 12 },
          4: { halign: 'center', cellWidth: 18 },
          5: { halign: 'left' },
          6: { halign: 'right', cellWidth: 24 },
          7: { halign: 'right', cellWidth: 24 },
          8: { halign: 'center', cellWidth: 24 },
          9: { halign: 'center', cellWidth: 22 },
          10: { halign: 'center', cellWidth: 22 },
        },
      });
    } catch (err) {
      console.error('Export PDF failed:', err);
      alert('Failed to export PDF: ' + (err.message || 'Unknown error'));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Receipt className="w-6 h-6 text-blue-600" /> Club Expense & Reimbursement Tracker
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit, track, approve, and verify club expense reimbursement requests. Click any card below to filter requests.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2.5">
          <Button
            type="button"
            onClick={() => {
              setSubmitError('');
              setSubmitSuccess('');
              setIsSubmitModalOpen(true);
            }}
            variant="primary"
            size="md"
            className="font-bold shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 mr-2" /> Submit New Expense
          </Button>

          <div className="flex items-center gap-2.5 ml-auto sm:ml-0">
            <button
              onClick={exportToExcel}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              title="Export full table to Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4" /> Export Excel
            </button>
            <button
              onClick={exportToPDF}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              title="Export formatted report to PDF"
            >
              <FileText className="w-4 h-4" /> Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stat & Status Filter Cards Container */}
      <div className="space-y-4">
        {/* Top 4 Quick Stat Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          {/* Card 1: Total Submitted / All Requests */}
          <button
            type="button"
            onClick={() => setStatusFilter('')}
            className={`p-3 sm:p-4.5 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer group ${
              statusFilter === ''
                ? 'bg-white border-blue-600 ring-2 ring-blue-600/30 shadow-md'
                : 'bg-white border-slate-200/80 hover:border-blue-300 hover:shadow-xs'
            }`}
          >
            <div>
              <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Submitted</p>
              <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                <p className="text-xl sm:text-2xl font-black text-slate-900">{totalCount}</p>
                {statusFilter === '' && (
                  <span className="text-[8px] sm:text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-blue-600 text-white uppercase">
                    Active
                  </span>
                )}
              </div>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform flex-shrink-0">
              <Receipt className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </button>

          {/* Card 2: Pending Review */}
          <button
            type="button"
            onClick={() => setStatusFilter('PENDING_TREASURER')}
            className={`p-3 sm:p-4.5 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer group ${
              statusFilter === 'PENDING_TREASURER'
                ? 'bg-white border-amber-500 ring-2 ring-amber-500/30 shadow-md'
                : 'bg-white border-slate-200/80 hover:border-amber-300 hover:shadow-xs'
            }`}
          >
            <div>
              <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Review</p>
              <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                <p className="text-xl sm:text-2xl font-black text-amber-600">{pendingCount}</p>
                {statusFilter === 'PENDING_TREASURER' && (
                  <span className="text-[8px] sm:text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-600 text-white uppercase">
                    Active
                  </span>
                )}
              </div>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform flex-shrink-0">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </button>

          {/* Card 3: Approved Value (Financial Stat Card) */}
          <div className="bg-white p-3 sm:p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Approved Value</p>
              <div className="mt-0.5 sm:mt-1">
                <AmountText amount={totalApprovedSum} size="md" type="credit" />
              </div>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold flex-shrink-0">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>

          {/* Card 4: Verified & Closed */}
          <button
            type="button"
            onClick={() => setStatusFilter('VERIFIED')}
            className={`p-3 sm:p-4.5 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer group ${
              statusFilter === 'VERIFIED'
                ? 'bg-white border-emerald-600 ring-2 ring-emerald-600/30 shadow-md'
                : 'bg-white border-slate-200/80 hover:border-emerald-300 hover:shadow-xs'
            }`}
          >
            <div>
              <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Verified & Closed</p>
              <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                <p className="text-xl sm:text-2xl font-black text-emerald-600">{verifiedCount}</p>
                {statusFilter === 'VERIFIED' && (
                  <span className="text-[8px] sm:text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-600 text-white uppercase">
                    Active
                  </span>
                )}
              </div>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform flex-shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </button>
        </div>

        {/* Status Request Filter Cards (Payment Queue, Awaiting Verification, Rejected) */}
        <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 sm:gap-4">
          {/* Payment Queue Box */}
          <button
            type="button"
            onClick={() => setStatusFilter('TREASURER_APPROVED')}
            className={`p-2.5 sm:p-4 rounded-2xl border text-left transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-1 cursor-pointer group ${
              statusFilter === 'TREASURER_APPROVED'
                ? 'bg-white border-indigo-600 ring-2 ring-indigo-600/30 shadow-md'
                : 'bg-white border-slate-200/80 hover:border-indigo-300 hover:shadow-xs'
            }`}
          >
            <div>
              <p className="text-[9px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">Payment Queue</p>
              <div className="flex items-center gap-1 mt-0.5">
                <p className="text-lg sm:text-2xl font-black text-indigo-600">{approvedCount}</p>
                {statusFilter === 'TREASURER_APPROVED' && (
                  <span className="text-[8px] font-extrabold px-1 rounded bg-indigo-600 text-white uppercase hidden sm:inline">
                    Active
                  </span>
                )}
              </div>
            </div>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform self-end sm:self-center">
              <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </button>

          {/* Awaiting Verification Box */}
          <button
            type="button"
            onClick={() => setStatusFilter('PAID')}
            className={`p-2.5 sm:p-4 rounded-2xl border text-left transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-1 cursor-pointer group ${
              statusFilter === 'PAID'
                ? 'bg-white border-teal-600 ring-2 ring-teal-600/30 shadow-md'
                : 'bg-white border-slate-200/80 hover:border-teal-300 hover:shadow-xs'
            }`}
          >
            <div>
              <p className="text-[9px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">Verification</p>
              <div className="flex items-center gap-1 mt-0.5">
                <p className="text-lg sm:text-2xl font-black text-teal-600">{paidCount}</p>
                {statusFilter === 'PAID' && (
                  <span className="text-[8px] font-extrabold px-1 rounded bg-teal-600 text-white uppercase hidden sm:inline">
                    Active
                  </span>
                )}
              </div>
            </div>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform self-end sm:self-center">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </button>

          {/* Rejected Box */}
          <button
            type="button"
            onClick={() => setStatusFilter('REJECTED')}
            className={`p-2.5 sm:p-4 rounded-2xl border text-left transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-1 cursor-pointer group ${
              statusFilter === 'REJECTED'
                ? 'bg-white border-rose-600 ring-2 ring-rose-600/30 shadow-md'
                : 'bg-white border-slate-200/80 hover:border-rose-300 hover:shadow-xs'
            }`}
          >
            <div>
              <p className="text-[9px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">Rejected</p>
              <div className="flex items-center gap-1 mt-0.5">
                <p className="text-lg sm:text-2xl font-black text-rose-600">{rejectedCount}</p>
                {statusFilter === 'REJECTED' && (
                  <span className="text-[8px] font-extrabold px-1 rounded bg-rose-600 text-white uppercase hidden sm:inline">
                    Active
                  </span>
                )}
              </div>
            </div>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform self-end sm:self-center">
              <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </button>
        </div>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, expense code (EXP-2026-...), or member name..."
            />
            {search && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Button type="submit" variant="secondary" size="md" className="font-bold">
            <Search className="w-4 h-4 mr-1" /> Search
          </Button>
        </form>

        <div className="w-full md:w-56">
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={categoryOptions}
            placeholder="All Categories"
          />
        </div>
      </div>

      {/* Expense Table */}
      <ExpenseTable
        expenses={expenses}
        role={user?.role}
        currentUserId={user?._id}
        loading={loading}
        onRefresh={fetchExpenses}
      />

      {/* IN-PAGE SUBMIT EXPENSE MODAL (Single-Click In-Page Action) */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4.5 bg-gradient-to-r from-blue-700 to-indigo-700 text-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight">Submit Expense Reimbursement</h3>
                  <p className="text-[11px] text-blue-100 font-medium">
                    Upload bill & submit for club approval and wallet deduction
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="p-1.5 text-blue-100 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitExpense} className="p-6 space-y-4 overflow-y-auto flex-1">
              {submitError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {submitSuccess && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{submitSuccess}</span>
                </div>
              )}

              {/* Member Wallet Info Banner */}
              {user?.role === 'MEMBER' && (
                <div className="p-3 bg-blue-50/90 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">💳</span>
                    <div>
                      <p className="font-bold">
                        Available Member Wallet Balance: ₹{(user?.walletBalance || 0).toLocaleString('en-IN')}
                      </p>
                      <p className="text-[11px] text-blue-700 font-medium">
                        If your bill is within this wallet balance, it is automatically approved and settled without sending a pending approval request.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Expense Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Expense Title <span className="text-rose-500">*</span>
                </label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  placeholder="e.g. Water bottles & Refreshments for Workshop"
                  required
                />
              </div>

              {/* Category & Amount in 2 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <Select
                    value={formData.category}
                    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                    options={categoryOptions}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Expense Amount (₹) <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleFormChange}
                    placeholder="e.g. 850.00"
                    min="1"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              {/* Date & Payment Method in 2 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Expense Date <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    type="date"
                    name="expenseDate"
                    value={formData.expenseDate}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Original Payment Method
                  </label>
                  <select
                    name="originalPaymentMethod"
                    value={formData.originalPaymentMethod}
                    onChange={handleFormChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="UPI">UPI (Google Pay, PhonePe, Paytm)</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Debit / Credit Card</option>
                    <option value="Net Banking">Net Banking</option>
                  </select>
                </div>
              </div>

              {/* Linked Event (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Linked Event <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <select
                  name="eventId"
                  value={formData.eventId}
                  onChange={handleFormChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">General Club Expense (No Event)</option>
                  {events
                    .filter((ev) => ev.isActive !== false && ev.status !== 'COMPLETED' && ev.status !== 'CANCELLED')
                    .map((ev) => (
                      <option key={ev._id} value={ev._id}>
                        {ev.name || ev.title} ({new Date(ev.startDate || ev.date || Date.now()).toLocaleDateString()})
                      </option>
                  ))}
                </select>
              </div>

              {/* Upload Bill / Receipt */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Upload Bill / Receipt Document <span className="text-rose-500">*</span>
                </label>
                <div className="relative border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-4 text-center transition-colors bg-slate-50/50">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => setReceiptFile(e.target.files[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="receipt-file-input"
                  />
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <Upload className="w-6 h-6 text-blue-600 mb-1" />
                    {receiptFile ? (
                      <p className="text-xs font-bold text-emerald-600 truncate max-w-xs">
                        Selected: {receiptFile.name} ({(receiptFile.size / 1024).toFixed(0)} KB)
                      </p>
                    ) : (
                      <>
                        <p className="text-xs font-bold text-slate-700">Click to choose or drag & drop receipt file</p>
                        <p className="text-[10px] text-slate-400">Supports JPG, PNG, PDF (Max 5MB)</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Description & Purpose (Single Description Field) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description & Purpose
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows={3}
                  placeholder="Provide context on why this item was purchased for the club (vendor name, invoice number, details)..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setIsSubmitModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={submitting}
                  className="font-bold shadow-md shadow-blue-500/20"
                >
                  {submitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <Send className="w-4 h-4" />
                      <span>Submit Request</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
