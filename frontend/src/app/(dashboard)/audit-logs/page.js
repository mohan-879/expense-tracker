'use client';

import React, { useState, useEffect, useMemo } from 'react';
import API from '../../../services/api';
import AmountText from '../../../components/atoms/AmountText';
import Button from '../../../components/atoms/Button';
import Input from '../../../components/atoms/Input';
import Select from '../../../components/atoms/Select';
import FormField from '../../../components/molecules/FormField';
import {
  RotateCcw,
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
  FileSpreadsheet,
  FileText,
  Check,
  X,
  Edit3,
  Sparkles,
} from 'lucide-react';
import { exportToStyledExcel, exportToStyledPDF } from '../../../utils/exportHelper';

export default function AuditLogsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loadingTx, setLoadingTx] = useState(true);

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    category: '',
  });

  // 5-click edit state
  const [clickCounts, setClickCounts] = useState({});
  const [editingTxId, setEditingTxId] = useState(null);
  const [editAmountValue, setEditAmountValue] = useState('');
  const [savingTxId, setSavingTxId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const categoryOptions = [
    { value: 'Expense', label: 'Expense (All Expense Types)' },
    { value: 'Income', label: 'Income (All Income Types)' },
    { value: 'Transport', label: 'Transport' },
    { value: 'Food', label: 'Food' },
    { value: 'Refreshments', label: 'Refreshments' },
    { value: 'Water', label: 'Water' },
    { value: 'Jerseys', label: 'Jerseys' },
    { value: 'T-Shirts', label: 'T-Shirts' },
    { value: 'Race Registration', label: 'Race Registration' },
    { value: 'Medical / First Aid', label: 'Medical / First Aid' },
    { value: 'Equipment', label: 'Equipment' },
    { value: 'Venue', label: 'Venue' },
    { value: 'Printing', label: 'Printing' },
    { value: 'Banner', label: 'Banner' },
    { value: 'Certificates', label: 'Certificates' },
    { value: 'Medals', label: 'Medals' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Accommodation', label: 'Accommodation' },
    { value: 'Event Materials', label: 'Event Materials' },
    { value: 'Sponsorship', label: 'Sponsorship' },
    { value: 'Miscellaneous', label: 'Miscellaneous' },
  ];

  useEffect(() => {
    fetchTransactions(filters);
  }, []);

  useEffect(() => {
    fetchTransactions(filters);
  }, [filters.startDate, filters.endDate, filters.category]);

  const fetchTransactions = async (appliedFilters = filters) => {
    try {
      setLoadingTx(true);
      const params = {};
      if (appliedFilters.startDate) params.startDate = appliedFilters.startDate;
      if (appliedFilters.endDate) params.endDate = appliedFilters.endDate;
      if (appliedFilters.category) params.category = appliedFilters.category;

      const res = await API.get('/reports/transactions', { params });
      if (res.data.success) {
        setTransactions(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch transactions for audit ledger:', err);
    } finally {
      setLoadingTx(false);
    }
  };

  const handleResetFilters = () => {
    setFilters({ startDate: '', endDate: '', category: '' });
  };

  // 5-Click secret handler
  const handleAmountClick = (tx) => {
    if (editingTxId === tx._id) return;

    const currentCount = (clickCounts[tx._id] || 0) + 1;
    setClickCounts((prev) => ({ ...prev, [tx._id]: currentCount }));

    if (currentCount >= 5) {
      setEditingTxId(tx._id);
      setEditAmountValue(String(tx.amount));
      setClickCounts((prev) => ({ ...prev, [tx._id]: 0 }));
    } else if (currentCount >= 3) {
      setToastMessage(`Click ${5 - currentCount} more time${5 - currentCount === 1 ? '' : 's'} to edit amount`);
      setTimeout(() => setToastMessage(null), 1500);
    }
  };

  const handleCancelEdit = () => {
    setEditingTxId(null);
    setEditAmountValue('');
  };

  const handleSaveAmount = async (txId) => {
    const numAmount = Number(editAmountValue);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid positive amount.');
      return;
    }

    try {
      setSavingTxId(txId);
      const res = await API.patch(`/reports/transactions/${txId}`, { amount: numAmount });
      if (res.data.success) {
        setEditingTxId(null);
        setToastMessage(`Amount updated to ₹${numAmount.toLocaleString('en-IN')}. Ledger & balances recalculated.`);
        fetchTransactions(filters);
        setTimeout(() => setToastMessage(null), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update transaction amount');
    } finally {
      setSavingTxId(null);
    }
  };

  // Export to Excel (.xlsx) matching structured model format
  const exportToExcel = async () => {
    if (transactions.length === 0) {
      alert('No transactions available to export.');
      return;
    }

    try {
      const headers = [
        '#',
        'Transaction ID',
        'Transaction Title',
        'Category',
        'Direction',
        'Payment Method',
        'Reference No',
        'Amount (INR)',
        'Balance After (INR)',
        'Recorded By',
        'Transaction Date & Time',
      ];

      const rows = transactions.map((tx, idx) => [
        idx + 1,
        tx.transactionCode || 'TXN',
        tx.description || '-',
        tx.category || (tx.direction === 'CREDIT' ? 'Income' : 'Expense'),
        tx.direction === 'CREDIT' ? 'CREDIT (INCOME)' : 'DEBIT (SPEND)',
        tx.paymentMethod || 'Bank Transfer',
        tx.referenceNumber || '-',
        tx.amount || 0,
        tx.runningBalance ?? 0,
        tx.createdBy?.fullName || 'System',
        new Date(tx.transactionDate || tx.createdAt).toLocaleString('en-IN'),
      ]);

      await exportToStyledExcel({
        filename: `Panimalar_Audit_Ledger_${new Date().toISOString().slice(0, 10)}.xlsx`,
        sheetName: 'Audit_Transactions',
        reportTitle: 'EXPENSE TRACKER',
        metaInfo: `Central Financial Audit Ledger | Total Transactions: ${transactions.length} | Exported: ${new Date().toLocaleString('en-IN')}`,
        headers,
        rows,
        columnAlignments: ['center', 'center', 'left', 'center', 'center', 'center', 'center', 'right', 'right', 'left', 'center'],
      });
    } catch (err) {
      console.error('Export Excel failed:', err);
      alert('Failed to export Excel: ' + (err.message || 'Unknown error'));
    }
  };

  // Export to PDF matching structured model format
  const exportToPDF = async () => {
    if (transactions.length === 0) {
      alert('No transactions available to export.');
      return;
    }

    try {
      const headers = [
        '#',
        'Txn ID',
        'Description',
        'Category',
        'Type',
        'Amount',
        'Balance After',
        'Recorded By',
        'Date & Time',
      ];

      const rows = transactions.map((tx, idx) => {
        const dateObj = new Date(tx.transactionDate || tx.createdAt);
        const dateStr = dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' });
        const timeStr = dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

        return [
          idx + 1,
          tx.transactionCode,
          tx.description,
          tx.category || (tx.direction === 'CREDIT' ? 'Income' : 'Expense'),
          tx.direction === 'CREDIT' ? 'INCOME' : 'SPEND',
          `${tx.direction === 'CREDIT' ? '+' : '-'}Rs.${(tx.amount || 0).toLocaleString('en-IN')}`,
          `Rs.${(tx.runningBalance ?? 0).toLocaleString('en-IN')}`,
          tx.createdBy?.fullName || 'System',
          `${dateStr} ${timeStr}`,
        ];
      });

      await exportToStyledPDF({
        filename: `Panimalar_Audit_Ledger_${new Date().toISOString().slice(0, 10)}.pdf`,
        reportTitle: 'EXPENSE TRACKER',
        metaInfo: `Central Financial Audit Ledger | Records: ${transactions.length} | Exported: ${new Date().toLocaleString('en-IN')}`,
        headers,
        rows,
        orientation: 'landscape',
        columnStyles: {
          0: { halign: 'center', cellWidth: 10 },
          1: { halign: 'center', cellWidth: 26 },
          2: { halign: 'left' },
          3: { halign: 'center', cellWidth: 24 },
          4: { halign: 'center', cellWidth: 18 },
          5: { halign: 'right', cellWidth: 26 },
          6: { halign: 'right', cellWidth: 26 },
          7: { halign: 'left', cellWidth: 28 },
          8: { halign: 'center', cellWidth: 26 },
        },
      });
    } catch (err) {
      console.error('Export PDF failed:', err);
      alert('Failed to export PDF: ' + (err.message || 'Unknown error'));
    }
  };

  // Compute live summary statistics
  const summary = useMemo(() => {
    let creditTotal = 0;
    let debitTotal = 0;

    transactions.forEach((tx) => {
      if (tx.direction === 'CREDIT') {
        creditTotal += tx.amount || 0;
      } else {
        debitTotal += tx.amount || 0;
      }
    });

    return {
      count: transactions.length,
      creditTotal,
      debitTotal,
      net: creditTotal - debitTotal,
    };
  }, [transactions]);

  const hasActiveFilters = Boolean(filters.startDate || filters.endDate || filters.category);

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Page Title & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            System Audit Trail & Transaction Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable audit log recording every sensitive operation, approval, and transaction.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={exportToExcel}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            title="Export full table to Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export Excel
          </button>
          <button
            onClick={exportToPDF}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            title="Export formatted report to PDF"
          >
            <FileText className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      {/* Instant Filter Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <FormField label="START DATE">
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            />
          </FormField>

          <FormField label="END DATE">
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            />
          </FormField>

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <FormField label="CATEGORY">
                <Select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  options={categoryOptions}
                  placeholder="All Categories"
                  placeholderDisabled={false}
                />
              </FormField>
            </div>

            {hasActiveFilters && (
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={handleResetFilters}
                className="font-semibold text-slate-600 hover:text-slate-900 h-10 px-3 flex items-center gap-1.5"
                title="Reset All Filters"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline text-xs">Reset</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Records</p>
            <p className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5">{summary.count}</p>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs sm:text-sm">
            #
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Inflow</p>
            <div className="mt-0.5">
              <AmountText amount={summary.creditTotal} size="sm" type="credit" />
            </div>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Outflow</p>
            <div className="mt-0.5">
              <AmountText amount={summary.debitTotal} size="sm" type="debit" />
            </div>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <ArrowDownRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Net Balance</p>
            <div className="mt-0.5">
              <AmountText
                amount={summary.net}
                size="sm"
                type={summary.net >= 0 ? 'credit' : 'debit'}
              />
            </div>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
      </div>

      {/* Audit Transaction Ledger Table Card (Fits 100% of Screen on Mobile) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between font-bold text-slate-900 text-sm">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-blue-600" />
            <span className="text-xs sm:text-sm">Audit Transaction Ledger & Running Balance</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400 hidden md:inline">
              Tip: Click amount 5 times to edit
            </span>
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
              {transactions.length} record{transactions.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>

        {loadingTx ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading audit transaction ledger...</div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No transactions match the selected filter criteria.
          </div>
        ) : (
          <>
            {/* Mobile View Cards (Zero Horizontal Scroll - Screen Fitting) */}
            <div className="md:hidden divide-y divide-slate-100 p-3 space-y-3">
              {transactions.map((tx) => {
                const isCredit = tx.direction === 'CREDIT';
                const dateObj = new Date(tx.transactionDate || tx.createdAt);
                const formattedDate = dateObj.toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                });
                const formattedTime = dateObj.toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                });
                const isEditing = editingTxId === tx._id;

                return (
                  <div key={tx._id} className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 space-y-2.5">
                    {/* Header: Code + Direction + Category */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                        {tx.transactionCode}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-extrabold rounded-md uppercase ${
                          isCredit
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {isCredit ? 'INCOME' : 'SPEND'} ({tx.direction})
                      </span>
                    </div>

                    {/* Title & Details */}
                    <div>
                      <p className="font-bold text-xs text-slate-900 leading-snug">{tx.description}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        <span className="font-semibold text-slate-700">{tx.category || (isCredit ? 'Income' : 'Expense')}</span>
                        {tx.paymentMethod ? ` • ${tx.paymentMethod}` : ''}
                        {tx.referenceNumber ? ` • Ref: ${tx.referenceNumber}` : ''}
                        {tx.createdBy?.fullName ? ` • By: ${tx.createdBy.fullName}` : ''}
                      </p>
                    </div>

                    {/* Date & Time */}
                    <p className="text-[10px] text-slate-400 font-mono">
                      {formattedDate} at {formattedTime}
                    </p>

                    {/* Financial Figures Container: Amount & Running Balance */}
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 flex items-center justify-between">
                      {/* Amount with 5-click edit */}
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight block">
                          Amount (Paid / Came)
                        </span>
                        {isEditing ? (
                          <div className="inline-flex items-center gap-1 mt-1 bg-blue-50 p-1 rounded-md border border-blue-200">
                            <span className="text-xs font-bold text-slate-600">₹</span>
                            <input
                              type="number"
                              value={editAmountValue}
                              onChange={(e) => setEditAmountValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveAmount(tx._id);
                                if (e.key === 'Escape') handleCancelEdit();
                              }}
                              className="w-20 px-1.5 py-0.5 text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded focus:outline-none"
                              autoFocus
                              min="0.01"
                              step="any"
                            />
                            <button
                              onClick={() => handleSaveAmount(tx._id)}
                              disabled={savingTxId === tx._id}
                              className="p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded cursor-pointer"
                              title="Save amount"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="p-1 bg-slate-300 hover:bg-slate-400 text-slate-700 rounded cursor-pointer"
                              title="Cancel"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAmountClick(tx)}
                            className="group inline-flex items-center gap-1 cursor-pointer select-none mt-0.5"
                            title="Click 5 times to edit amount"
                          >
                            <span
                              className={`text-sm font-extrabold ${
                                isCredit ? 'text-emerald-600' : 'text-rose-600'
                              }`}
                            >
                              {isCredit ? '+' : '-'}₹{(tx.amount || 0).toLocaleString('en-IN')}
                            </span>
                            <Edit3 className="w-3 h-3 text-slate-300" />
                          </button>
                        )}
                      </div>

                      {/* Balance After Transaction */}
                      <div className="text-right">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight block">
                          Balance After Txn
                        </span>
                        <span
                          className={`text-sm font-black mt-0.5 block ${
                            (tx.runningBalance ?? 0) >= 0 ? 'text-slate-900' : 'text-rose-600'
                          }`}
                        >
                          ₹{(tx.runningBalance ?? 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop View: Full Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold tracking-wider">
                  <tr>
                    <th className="px-5 py-4">Transaction ID</th>
                    <th className="px-5 py-4">Transaction Title</th>
                    <th className="px-5 py-4">Spend / Income</th>
                    <th className="px-5 py-4">Category</th>
                    <th className="px-5 py-4">Date & Time</th>
                    <th className="px-5 py-4 text-right">Amount (Paid / Came)</th>
                    <th className="px-5 py-4 text-right">Balance After Transaction</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((tx) => {
                    const isCredit = tx.direction === 'CREDIT';
                    const dateObj = new Date(tx.transactionDate || tx.createdAt);
                    const formattedDate = dateObj.toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    });
                    const formattedTime = dateObj.toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    });

                    const isEditing = editingTxId === tx._id;

                    return (
                      <tr key={tx._id} className="hover:bg-slate-50/80 transition-colors">
                        {/* 1. Transaction ID */}
                        <td className="px-5 py-4 font-mono font-bold text-slate-900 text-xs whitespace-nowrap">
                          <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md border border-slate-200 inline-block font-mono">
                            {tx.transactionCode}
                          </span>
                        </td>

                        {/* 2. Transaction Title & Description */}
                        <td className="px-5 py-4 min-w-[220px]">
                          <p className="font-bold text-slate-900 leading-snug">{tx.description}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Method: <span className="font-medium text-slate-600">{tx.paymentMethod || 'Bank Transfer'}</span>
                            {tx.referenceNumber ? ` • Ref: ${tx.referenceNumber}` : ''}
                            {tx.createdBy?.fullName ? ` • By: ${tx.createdBy.fullName}` : ''}
                          </p>
                        </td>

                        {/* 3. Spend / Income */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-extrabold rounded-md uppercase ${
                              isCredit
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {isCredit ? 'INCOME' : 'SPEND'} ({tx.direction})
                          </span>
                        </td>

                        {/* 4. Category */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="inline-block px-2.5 py-1 text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100 rounded-md">
                            {tx.category || (isCredit ? 'Income' : 'General Expense')}
                          </span>
                        </td>

                        {/* 5. Date & Time */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <p className="text-xs font-semibold text-slate-800">{formattedDate}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{formattedTime}</p>
                        </td>

                        {/* 6. Amount Paid or Came (with 5-click edit feature) */}
                        <td className="px-5 py-4 text-right whitespace-nowrap">
                          {isEditing ? (
                            <div className="inline-flex items-center gap-1.5 bg-blue-50 p-1.5 rounded-lg border border-blue-200">
                              <span className="text-xs font-bold text-slate-600">₹</span>
                              <input
                                type="number"
                                value={editAmountValue}
                                onChange={(e) => setEditAmountValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveAmount(tx._id);
                                  if (e.key === 'Escape') handleCancelEdit();
                                }}
                                className="w-24 px-2 py-1 text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                autoFocus
                                min="0.01"
                                step="any"
                              />
                              <button
                                onClick={() => handleSaveAmount(tx._id)}
                                disabled={savingTxId === tx._id}
                                className="p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded cursor-pointer transition-colors"
                                title="Save amount"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="p-1 bg-slate-300 hover:bg-slate-400 text-slate-700 rounded cursor-pointer transition-colors"
                                title="Cancel"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleAmountClick(tx)}
                              className="group inline-flex items-center gap-1 cursor-pointer select-none"
                              title="Click 5 times to edit amount"
                            >
                              <span
                                className={`text-sm font-extrabold transition-transform group-hover:scale-105 ${
                                  isCredit ? 'text-emerald-600' : 'text-rose-600'
                                }`}
                              >
                                {isCredit ? '+' : '-'}₹{(tx.amount || 0).toLocaleString('en-IN')}
                              </span>
                              <Edit3 className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                          )}
                        </td>

                        {/* 7. Balance After Transaction */}
                        <td className="px-5 py-4 text-right whitespace-nowrap">
                          <div className="inline-flex flex-col items-end bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/80">
                            <span
                              className={`text-sm font-black leading-tight ${
                                (tx.runningBalance ?? 0) >= 0 ? 'text-slate-900' : 'text-rose-600'
                              }`}
                            >
                              ₹{(tx.runningBalance ?? 0).toLocaleString('en-IN')}
                            </span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                              Balance After Txn
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
