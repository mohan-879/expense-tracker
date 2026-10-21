'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import API from '../../services/api';
import StatusBadge from '../molecules/StatusBadge';
import AmountText from '../atoms/AmountText';
import Button from '../atoms/Button';
import Input from '../atoms/Input';
import Textarea from '../atoms/Textarea';
import FormField from '../molecules/FormField';
import FileUploader from '../molecules/FileUploader';
import {
  Eye,
  CheckCircle2,
  XCircle,
  CreditCard,
  ShieldCheck,
  Receipt,
  User,
  Calendar,
  Clock,
  Car,
  Utensils,
  Shirt,
  Trophy,
  HeartPulse,
  Package,
  Printer,
  Megaphone,
  Building,
  Tag,
} from 'lucide-react';

const categoryConfig = {
  Transport: { icon: Car, bg: 'bg-sky-50 text-sky-700 border-sky-200' },
  Food: { icon: Utensils, bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  Refreshments: { icon: Utensils, bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  Water: { icon: Utensils, bg: 'bg-teal-50 text-teal-700 border-teal-200' },
  Jerseys: { icon: Shirt, bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  'T-Shirts': { icon: Shirt, bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  'Race Registration': { icon: Trophy, bg: 'bg-purple-50 text-purple-700 border-purple-200' },
  'Medical / First Aid': { icon: HeartPulse, bg: 'bg-rose-50 text-rose-700 border-rose-200' },
  Equipment: { icon: Package, bg: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  Venue: { icon: Building, bg: 'bg-blue-50 text-blue-700 border-blue-200' },
  Printing: { icon: Printer, bg: 'bg-slate-100 text-slate-700 border-slate-200' },
  Banner: { icon: Printer, bg: 'bg-slate-100 text-slate-700 border-slate-200' },
  Certificates: { icon: Printer, bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  Medals: { icon: Trophy, bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  Marketing: { icon: Megaphone, bg: 'bg-pink-50 text-pink-700 border-pink-200' },
  Accommodation: { icon: Building, bg: 'bg-violet-50 text-violet-700 border-violet-200' },
  'Event Materials': { icon: Package, bg: 'bg-blue-50 text-blue-700 border-blue-200' },
  Miscellaneous: { icon: Tag, bg: 'bg-slate-100 text-slate-700 border-slate-200' },
};

export default function ExpenseTable({
  expenses = [],
  role = 'MEMBER',
  currentUserId = null,
  onRefresh,
  loading = false,
}) {
  const [selectedExp, setSelectedExp] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // 'APPROVE', 'REJECT', 'PAY', 'VERIFY'
  const [actionLoading, setActionLoading] = useState(false);

  // Form states inside modals
  const [approvedAmount, setApprovedAmount] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [paymentData, setPaymentData] = useState({
    paymentMethod: 'UPI',
    transactionReference: '',
    paymentDate: new Date().toISOString().split('T')[0],
  });
  const [paymentProofFile, setPaymentProofFile] = useState(null);

  const openApproveModal = (exp) => {
    setSelectedExp(exp);
    setApprovedAmount(exp.amount);
    setActiveModal('APPROVE');
  };

  const openRejectModal = (exp) => {
    setSelectedExp(exp);
    setRejectionReason('');
    setActiveModal('REJECT');
  };

  const openPayModal = (exp) => {
    setSelectedExp(exp);
    setPaymentData({
      paymentMethod: 'UPI',
      transactionReference: `TXN-${Date.now().toString().slice(-6)}`,
      paymentDate: new Date().toISOString().split('T')[0],
    });
    setPaymentProofFile(null);
    setActiveModal('PAY');
  };

  const handleApproveSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await API.post(`/expenses/${selectedExp._id}/approve`, {
        approvedAmount: Number(approvedAmount),
      });
      if (res.data.success) {
        setActiveModal(null);
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await API.post(`/expenses/${selectedExp._id}/reject`, {
        rejectionReason,
      });
      if (res.data.success) {
        setActiveModal(null);
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = new FormData();
      payload.append('paymentMethod', paymentData.paymentMethod);
      payload.append('transactionReference', paymentData.transactionReference);
      payload.append('paymentDate', paymentData.paymentDate);
      if (paymentProofFile) {
        payload.append('paymentProof', paymentProofFile);
      }

      const res = await API.post(`/expenses/${selectedExp._id}/pay`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setActiveModal(null);
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifySubmit = async (exp) => {
    if (!confirm(`Are you sure you want to verify and close expense ${exp.expenseCode}?`)) return;
    setActionLoading(true);
    try {
      const res = await API.post(`/expenses/${exp._id}/verify`);
      if (res.data.success) {
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center bg-white rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-bold text-slate-700">Loading Expense Records...</p>
        <p className="text-xs text-slate-400 mt-1">Fetching live financial reimbursement data</p>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="p-16 text-center bg-white rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Receipt className="w-7 h-7" />
        </div>
        <h4 className="text-base font-extrabold text-slate-800">No Expenses Found</h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          There are no expense reimbursement requests matching your current filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* ========================================================================= */}
      {/* MOBILE & TABLET VIEW: 3-COLUMN RESPONSIVE CARDS (ZERO HORIZONTAL SCROLL) */}
      {/* ========================================================================= */}
      <div className="md:hidden space-y-3">
        {expenses.map((exp) => {
          const catConf = categoryConfig[exp.category] || categoryConfig.Miscellaneous;
          const CatIcon = catConf.icon;

          const canApprove =
            ['TREASURER', 'FACULTY_COORDINATOR', 'ADMIN'].includes(role) &&
            exp.status === 'PENDING_TREASURER' &&
            String(exp.user?._id || exp.user) !== String(currentUserId);

          const canPay =
            ['FINANCER', 'ADMIN'].includes(role) &&
            ['TREASURER_APPROVED', 'PAYMENT_PENDING'].includes(exp.status);

          const canVerify =
            ['FACULTY_COORDINATOR', 'ADMIN'].includes(role) &&
            exp.status === 'PAID';

          return (
            <div
              key={exp._id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-3.5 hover:border-blue-300 transition-all"
            >
              {/* 3 COLUMNS GRID */}
              <div className="grid grid-cols-12 gap-2 items-center">
                
                {/* --------------------------------------------------------------- */}
                {/* COLUMN 1: NAME, CATEGORY BELOW, DATE & TIME ON SIDE            */}
                {/* --------------------------------------------------------------- */}
                <div className="col-span-5 flex flex-col justify-center min-w-0 pr-1">
                  {/* Name of Submitter */}
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 font-mono text-[10px] font-black flex items-center justify-center border border-blue-100 flex-shrink-0">
                      {exp.expenseCode?.split('-').pop() || 'EXP'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-extrabold text-slate-900 text-xs sm:text-sm truncate leading-tight">
                        {exp.user?.fullName || exp.paidBy || 'Member'}
                      </p>
                      <Link
                        href={`/expenses/${exp._id}`}
                        className="text-[11px] font-bold text-slate-600 hover:text-blue-600 truncate block leading-tight mt-0.5"
                      >
                        {exp.title}
                      </Link>
                    </div>
                  </div>

                  {/* Category Below Name */}
                  <div className="mt-1.5 flex items-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold border rounded-md ${catConf.bg} max-w-full truncate`}
                    >
                      <CatIcon className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{exp.category}</span>
                    </span>
                  </div>

                  {/* Date and Time on the Side/Below */}
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400 font-medium truncate">
                    <Calendar className="w-2.5 h-2.5 flex-shrink-0 text-slate-400" />
                    <span>
                      {new Date(exp.expenseDate || exp.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                    <span>•</span>
                    <Clock className="w-2.5 h-2.5 flex-shrink-0 text-slate-400" />
                    <span>
                      {new Date(exp.createdAt || exp.expenseDate).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {/* --------------------------------------------------------------- */}
                {/* COLUMN 2: AMOUNT WHAT THEY HAVE PAID & STATUS                   */}
                {/* --------------------------------------------------------------- */}
                <div className="col-span-3 flex flex-col justify-center items-center text-center px-1 border-x border-slate-100">
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block">
                    Paid Amount
                  </span>
                  <span className="text-sm sm:text-base font-black text-slate-900 leading-tight mt-0.5">
                    ₹{Number(exp.amount || 0).toLocaleString('en-IN')}
                  </span>
                  <div className="mt-1 flex justify-center scale-90 sm:scale-100 origin-center">
                    <StatusBadge status={exp.status} />
                  </div>
                </div>

                {/* --------------------------------------------------------------- */}
                {/* COLUMN 3: DETAIL BUTTON & ACCEPT OR IGNORE BUTTON               */}
                {/* --------------------------------------------------------------- */}
                <div className="col-span-4 flex flex-col gap-1.5 justify-center pl-1">
                  {/* Detail Button */}
                  <Link href={`/expenses/${exp._id}`} className="w-full">
                    <button
                      type="button"
                      className="w-full py-1.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>Detail</span>
                    </button>
                  </Link>

                  {/* Accept or Ignore Buttons */}
                  {canApprove && (
                    <>
                      <button
                        type="button"
                        onClick={() => openApproveModal(exp)}
                        className="w-full py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-xs transition-colors cursor-pointer"
                        title="Accept / Approve"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Accept</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openRejectModal(exp)}
                        className="w-full py-1.5 px-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-xs transition-colors cursor-pointer"
                        title="Ignore / Reject"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Ignore</span>
                      </button>
                    </>
                  )}

                  {/* Payment queue action */}
                  {canPay && (
                    <button
                      type="button"
                      onClick={() => openPayModal(exp)}
                      className="w-full py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-xs transition-colors cursor-pointer"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Pay</span>
                    </button>
                  )}

                  {/* Verification queue action */}
                  {canVerify && (
                    <button
                      type="button"
                      onClick={() => handleVerifySubmit(exp)}
                      className="w-full py-1.5 px-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-xs transition-colors cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verify</span>
                    </button>
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* DESKTOP VIEW: FULL WIDESCREEN TABLE                                       */}
      {/* ========================================================================= */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/90 border-b border-slate-200 text-[11px] uppercase text-slate-500 font-extrabold tracking-wider">
              <tr>
                <th className="px-6 py-4">Expense Request</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Paid Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.map((exp) => {
                const catConf = categoryConfig[exp.category] || categoryConfig.Miscellaneous;
                const CatIcon = catConf.icon;

                const canApprove =
                  ['TREASURER', 'FACULTY_COORDINATOR', 'ADMIN'].includes(role) &&
                  exp.status === 'PENDING_TREASURER' &&
                  String(exp.user?._id || exp.user) !== String(currentUserId);

                const canPay =
                  ['FINANCER', 'ADMIN'].includes(role) &&
                  ['TREASURER_APPROVED', 'PAYMENT_PENDING'].includes(exp.status);

                const canVerify =
                  ['FACULTY_COORDINATOR', 'ADMIN'].includes(role) &&
                  exp.status === 'PAID';

                return (
                  <tr key={exp._id} className="hover:bg-blue-50/30 transition-colors group">
                    {/* Title & Submitter */}
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-mono text-xs font-black border border-blue-100 flex-shrink-0 mt-0.5">
                          {exp.expenseCode?.split('-').pop() || 'EXP'}
                        </div>
                        <div>
                          <Link
                            href={`/expenses/${exp._id}`}
                            className="font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight line-clamp-1"
                          >
                            {exp.title}
                          </Link>
                          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                            <span className="flex items-center gap-1 font-medium">
                              <User className="w-3 h-3 text-slate-400" />
                              {exp.user?.fullName || exp.paidBy}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="font-mono text-[11px] text-slate-400">
                              {exp.expenseCode}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category Pill with Icon */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-extrabold border rounded-lg ${catConf.bg}`}
                      >
                        <CatIcon className="w-3.5 h-3.5" />
                        <span>{exp.category}</span>
                      </span>
                    </td>

                    {/* Date & Time */}
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(exp.expenseDate || exp.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {new Date(exp.createdAt || exp.expenseDate).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4">
                      <div>
                        <AmountText amount={exp.approvedAmount || exp.amount} size="md" />
                        {exp.approvedAmount > 0 && exp.approvedAmount !== exp.amount && (
                          <p className="text-[10px] text-slate-400 line-through">
                            Original: ₹{exp.amount}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4">
                      <StatusBadge status={exp.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/expenses/${exp._id}`}>
                          <Button variant="outline" size="sm" className="font-bold">
                            <Eye className="w-3.5 h-3.5 mr-1" /> Detail
                          </Button>
                        </Link>

                        {canApprove && (
                          <>
                            <Button
                              variant="success"
                              size="sm"
                              className="font-bold shadow-xs bg-emerald-600 hover:bg-emerald-700"
                              onClick={() => openApproveModal(exp)}
                              title="Accept / Approve"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Accept
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              className="font-bold shadow-xs bg-rose-600 hover:bg-rose-700"
                              onClick={() => openRejectModal(exp)}
                              title="Ignore / Reject"
                            >
                              <XCircle className="w-3.5 h-3.5 mr-1" /> Ignore
                            </Button>
                          </>
                        )}

                        {canPay && (
                          <Button
                            variant="primary"
                            size="sm"
                            className="font-bold shadow-xs"
                            onClick={() => openPayModal(exp)}
                          >
                            <CreditCard className="w-3.5 h-3.5 mr-1" /> Pay
                          </Button>
                        )}

                        {canVerify && (
                          <Button
                            variant="success"
                            size="sm"
                            className="font-bold shadow-xs"
                            onClick={() => handleVerifySubmit(exp)}
                          >
                            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Verify
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODALS: ACCEPT / IGNORE / PAY                                             */}
      {/* ========================================================================= */}

      {/* ACCEPT / APPROVE MODAL */}
      {activeModal === 'APPROVE' && selectedExp && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-2xl border border-slate-200 shadow-xl space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900">Accept Expense Request</h3>
            <p className="text-xs text-slate-500">
              Approve reimbursement request <span className="font-bold font-mono text-slate-800">{selectedExp.expenseCode}</span> for <span className="font-bold">{selectedExp.title}</span> submitted by <span className="font-bold">{selectedExp.user?.fullName || selectedExp.paidBy}</span>.
            </p>
            <form onSubmit={handleApproveSubmit} className="space-y-4">
              <FormField label="Approved Amount (₹)" required>
                <Input
                  type="number"
                  value={approvedAmount}
                  onChange={(e) => setApprovedAmount(e.target.value)}
                  min="0.01"
                  step="0.01"
                  required
                />
              </FormField>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" type="button" onClick={() => setActiveModal(null)}>
                  Cancel
                </Button>
                <Button variant="success" type="submit" loading={actionLoading} className="font-bold bg-emerald-600 hover:bg-emerald-700">
                  Confirm & Accept
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IGNORE / REJECT MODAL */}
      {activeModal === 'REJECT' && selectedExp && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-2xl border border-slate-200 shadow-xl space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900">Ignore / Reject Expense Request</h3>
            <p className="text-xs text-slate-500">
              Ignore reimbursement request <span className="font-bold font-mono text-slate-800">{selectedExp.expenseCode}</span>.
            </p>
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <FormField label="Reason for Ignoring / Rejecting" required>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="State clear reason for declining..."
                  required
                />
              </FormField>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" type="button" onClick={() => setActiveModal(null)}>
                  Cancel
                </Button>
                <Button variant="danger" type="submit" loading={actionLoading} className="font-bold bg-rose-600 hover:bg-rose-700">
                  Confirm & Ignore
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PAY MODAL */}
      {activeModal === 'PAY' && selectedExp && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-2xl border border-slate-200 shadow-xl space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900">Record Payout</h3>
            <p className="text-xs text-slate-500">
              Paying <span className="font-bold">₹{selectedExp.approvedAmount || selectedExp.amount}</span> for {selectedExp.expenseCode}.
            </p>
            <form onSubmit={handlePaySubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Payment Method" required>
                  <select
                    className="w-full text-xs font-semibold p-2.5 border border-slate-200 rounded-xl"
                    value={paymentData.paymentMethod}
                    onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                  >
                    <option value="UPI">UPI</option>
                    <option value="CASH">Cash</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CHEQUE">Cheque</option>
                  </select>
                </FormField>

                <FormField label="Payment Date" required>
                  <Input
                    type="date"
                    value={paymentData.paymentDate}
                    onChange={(e) => setPaymentData({ ...paymentData, paymentDate: e.target.value })}
                    required
                  />
                </FormField>
              </div>

              <FormField label="Transaction / UTR Reference" required>
                <Input
                  value={paymentData.transactionReference}
                  onChange={(e) => setPaymentData({ ...paymentData, transactionReference: e.target.value })}
                  placeholder="e.g. UPI Ref / Bank UTR Number"
                  required
                />
              </FormField>

              <FormField label="Payment Proof Screenshot (Optional)">
                <FileUploader
                  onFileSelect={(file) => setPaymentProofFile(file)}
                  accept="image/*,.pdf"
                />
              </FormField>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" type="button" onClick={() => setActiveModal(null)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" loading={actionLoading} className="font-bold">
                  Confirm Payout
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
