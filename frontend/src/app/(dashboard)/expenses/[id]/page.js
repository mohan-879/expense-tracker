'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import API from '../../../../services/api';
import StatusBadge from '../../../../components/molecules/StatusBadge';
import AmountText from '../../../../components/atoms/AmountText';
import Button from '../../../../components/atoms/Button';
import Input from '../../../../components/atoms/Input';
import Textarea from '../../../../components/atoms/Textarea';
import FormField from '../../../../components/molecules/FormField';
import FileUploader from '../../../../components/molecules/FileUploader';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  CreditCard,
  ShieldCheck,
  FileText,
  Calendar,
  User,
  Tag,
  AlertCircle,
} from 'lucide-react';

export default function ExpenseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();

  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  // Modals state
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);

  // Form states inside modals
  const [approvedAmount, setApprovedAmount] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [paymentData, setPaymentData] = useState({
    paymentMethod: 'UPI',
    transactionReference: '',
    paymentDate: new Date().toISOString().split('T')[0],
  });
  const [paymentProofFile, setPaymentProofFile] = useState(null);

  useEffect(() => {
    if (params.id) {
      fetchExpenseDetails();
    }
  }, [params.id]);

  const fetchExpenseDetails = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/expenses/${params.id}`);
      if (res.data.success) {
        setExpense(res.data.data);
        setApprovedAmount(res.data.data.amount);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await API.post(`/expenses/${expense._id}/approve`, {
        approvedAmount: Number(approvedAmount),
      });
      if (res.data.success) {
        setShowApproveModal(false);
        fetchExpenseDetails();
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
      const res = await API.post(`/expenses/${expense._id}/reject`, {
        rejectionReason,
      });
      if (res.data.success) {
        setShowRejectModal(false);
        fetchExpenseDetails();
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

      const res = await API.post(`/expenses/${expense._id}/pay`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setShowPayModal(false);
        fetchExpenseDetails();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifySubmit = async () => {
    if (!confirm('Are you sure you want to verify and close this expense transaction?')) return;
    setActionLoading(true);
    try {
      const res = await API.post(`/expenses/${expense._id}/verify`);
      if (res.data.success) {
        fetchExpenseDetails();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !expense) {
    return (
      <div className="p-12 text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-medium text-slate-600">Loading Expense Details...</p>
      </div>
    );
  }

  const role = user?.role;
  const currentUserId = user?._id;

  const canApprove =
    ['TREASURER', 'FACULTY_COORDINATOR', 'ADMIN'].includes(role) &&
    expense.status === 'PENDING_TREASURER' &&
    String(expense.user?._id || expense.user) !== String(currentUserId);

  const canPay =
    ['FINANCER', 'ADMIN'].includes(role) &&
    ['TREASURER_APPROVED', 'PAYMENT_PENDING'].includes(expense.status);

  const canVerify =
    ['FACULTY_COORDINATOR', 'ADMIN'].includes(role) &&
    expense.status === 'PAID';

  // Workflow timeline steps
  const steps = [
    { label: 'Submitted', done: true, key: 'SUBMITTED' },
    {
      label: 'Treasurer / Faculty Approval',
      done: ['TREASURER_APPROVED', 'PAYMENT_PENDING', 'PAID', 'VERIFIED'].includes(expense.status),
      rejected: expense.status === 'REJECTED',
      key: 'APPROVED',
    },
    {
      label: 'Financer Payment',
      done: ['PAID', 'VERIFIED'].includes(expense.status),
      key: 'PAID',
    },
    {
      label: 'Faculty Verification & Closed',
      done: expense.status === 'VERIFIED',
      key: 'VERIFIED',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Expenses
      </button>

      {/* Main Expense Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-extrabold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
              {expense.expenseCode}
            </span>
            <StatusBadge status={expense.status} />
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 mt-2">{expense.title}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Submitted by <span className="font-bold text-slate-800">{expense.user?.fullName}</span> ({expense.user?.email})
          </p>
        </div>

        <div className="flex items-center gap-3">
          {canApprove && (
            <>
              <Button variant="success" size="md" onClick={() => setShowApproveModal(true)}>
                <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
              </Button>
              <Button variant="danger" size="md" onClick={() => setShowRejectModal(true)}>
                <XCircle className="w-4 h-4 mr-1" /> Reject
              </Button>
            </>
          )}

          {canPay && (
            <Button variant="primary" size="md" onClick={() => setShowPayModal(true)}>
              <CreditCard className="w-4 h-4 mr-1" /> Process Payment
            </Button>
          )}

          {canVerify && (
            <Button variant="success" size="md" onClick={handleVerifySubmit} loading={actionLoading}>
              <ShieldCheck className="w-4 h-4 mr-1" /> Verify & Close
            </Button>
          )}
        </div>
      </div>

      {/* Expense Status Timeline Machine */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-4">
          Approval & Payment Workflow Progress
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border text-center ${
                step.rejected
                  ? 'bg-rose-50 border-rose-200 text-rose-700'
                  : step.done
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-center mb-1">
                {step.rejected ? (
                  <XCircle className="w-5 h-5 text-rose-600" />
                ) : step.done ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                )}
              </div>
              <p className="text-xs font-bold leading-tight">{step.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3">
              Expense Metadata
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-slate-400 font-semibold uppercase">Category</p>
                <p className="font-bold text-slate-800 mt-1">{expense.category}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold uppercase">Expense Date</p>
                <p className="font-bold text-slate-800 mt-1">{new Date(expense.expenseDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold uppercase">Original Payment Method</p>
                <p className="font-bold text-slate-800 mt-1">{expense.originalPaymentMethod}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold uppercase">Associated Event</p>
                <p className="font-bold text-slate-800 mt-1">{expense.event?.name || 'General Club Expense'}</p>
              </div>
            </div>

            {expense.description && (
              <div className="pt-2">
                <p className="text-xs text-slate-400 font-semibold uppercase">Description & Purpose</p>
                <p className="text-xs text-slate-700 mt-1 bg-slate-50 p-3 rounded-xl border border-slate-100">{expense.description}</p>
              </div>
            )}

            {expense.notes && (
              <div className="pt-2">
                <p className="text-xs text-slate-400 font-semibold uppercase">Notes</p>
                <p className="text-xs text-slate-700 mt-1">{expense.notes}</p>
              </div>
            )}
          </div>

          {/* Receipt Preview */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" /> Uploaded Receipt / Bill Document
            </h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 p-4 text-center">
              <a
                href={expense.receiptPath}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-xs"
              >
                View / Download Receipt Document
              </a>
            </div>
          </div>
        </div>

        {/* Right Financial & Approval Cards */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <p className="text-xs font-bold text-slate-400 uppercase">Amount Details</p>
            <div>
              <p className="text-xs text-slate-500">Requested Amount</p>
              <AmountText amount={expense.amount} size="lg" />
            </div>

            {expense.approvedAmount > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs text-emerald-600 font-semibold">Approved Amount</p>
                <AmountText amount={expense.approvedAmount} size="xl" type="credit" />
              </div>
            )}
          </div>

          {/* Rejection Info */}
          {expense.status === 'REJECTED' && (
            <div className="bg-rose-50 p-5 rounded-2xl border border-rose-200 text-xs text-rose-800 space-y-2">
              <p className="font-extrabold uppercase flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> Rejection Details
              </p>
              <p><span className="font-semibold">Reason:</span> {expense.rejectionReason}</p>
              {expense.rejectedBy && <p><span className="font-semibold">Rejected By:</span> {expense.rejectedBy.fullName}</p>}
            </div>
          )}

          {/* Payment Info */}
          {expense.paymentMethod && (
            <div className="bg-blue-50/60 p-5 rounded-2xl border border-blue-200 text-xs text-slate-800 space-y-2">
              <p className="font-extrabold uppercase text-blue-900 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-blue-600" /> Payment Details
              </p>
              <p><span className="font-semibold">Method:</span> {expense.paymentMethod}</p>
              <p><span className="font-semibold">Ref No:</span> {expense.transactionReference}</p>
              <p><span className="font-semibold">Paid Date:</span> {new Date(expense.paymentDate).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      </div>

      {/* APPROVE MODAL */}
      {showApproveModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-2xl border border-slate-200 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Approve Expense Request</h3>
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
                <Button variant="outline" type="button" onClick={() => setShowApproveModal(false)}>
                  Cancel
                </Button>
                <Button variant="success" type="submit" loading={actionLoading}>
                  Confirm Approval
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-2xl border border-slate-200 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Reject Expense Request</h3>
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <FormField label="Rejection Reason" required>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="State clear reason for rejecting..."
                  required
                />
              </FormField>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" type="button" onClick={() => setShowRejectModal(false)}>
                  Cancel
                </Button>
                <Button variant="danger" type="submit" loading={actionLoading}>
                  Confirm Rejection
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PAY MODAL */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-2xl border border-slate-200 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Process Reimbursement Payment</h3>
            <form onSubmit={handlePaySubmit} className="space-y-4">
              <FormField label="Payment Method" required>
                <Input
                  value={paymentData.paymentMethod}
                  onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                  placeholder="UPI / Bank Transfer / Cash"
                  required
                />
              </FormField>
              <FormField label="Transaction / Reference Number" required>
                <Input
                  value={paymentData.transactionReference}
                  onChange={(e) => setPaymentData({ ...paymentData, transactionReference: e.target.value })}
                  placeholder="e.g. UPI-REF-998811"
                  required
                />
              </FormField>
              <FormField label="Payment Date" required>
                <Input
                  type="date"
                  value={paymentData.paymentDate}
                  onChange={(e) => setPaymentData({ ...paymentData, paymentDate: e.target.value })}
                  required
                />
              </FormField>
              <FormField label="Payment Proof Screenshot (Optional)">
                <FileUploader onFileSelect={(file) => setPaymentProofFile(file)} />
              </FormField>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" type="button" onClick={() => setShowPayModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" loading={actionLoading}>
                  Mark as Paid
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
