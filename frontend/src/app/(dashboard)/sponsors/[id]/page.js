'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import API from '../../../../services/api';
import SponsorTierBadge from '../../../../components/molecules/SponsorTierBadge';
import AmountText from '../../../../components/atoms/AmountText';
import Button from '../../../../components/atoms/Button';
import Input from '../../../../components/atoms/Input';
import FormField from '../../../../components/molecules/FormField';
import FileUploader from '../../../../components/molecules/FileUploader';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock,
  CreditCard,
  CheckSquare,
  Square,
  AlertCircle,
} from 'lucide-react';

export default function SponsorDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();

  const [sponsor, setSponsor] = useState(null);
  const [benefits, setBenefits] = useState([]);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showPayModal, setShowPayModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    paymentMethod: 'Bank Transfer',
    transactionReference: '',
    paymentDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (params.id) {
      fetchSponsorDetails();
    }
  }, [params.id]);

  const fetchSponsorDetails = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/sponsors/${params.id}`);
      if (res.data.success) {
        setSponsor(res.data.data.sponsor);
        setBenefits(res.data.data.benefits || []);
        setCompletionPercentage(res.data.data.completionPercentage || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBenefitStatus = async (benefitId, currentStatus) => {
    const nextStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      const res = await API.patch(`/sponsors/benefits/${benefitId}`, {
        status: nextStatus,
      });
      if (res.data.success) {
        fetchSponsorDetails();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post(`/sponsors/${sponsor._id}/pay`, paymentData);
      if (res.data.success) {
        setShowPayModal(false);
        fetchSponsorDetails();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  if (loading || !sponsor) {
    return (
      <div className="p-12 text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-medium text-slate-600">Loading Sponsor Details...</p>
      </div>
    );
  }

  const role = user?.role;
  const isPaid = sponsor.paymentStatus === 'PAID';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Sponsors
      </button>

      {/* Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl border border-blue-200 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-extrabold text-slate-900">{sponsor.companyName}</h1>
              <SponsorTierBadge tier={sponsor.tierName} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Contact: <span className="font-semibold text-slate-700">{sponsor.contactPerson}</span> ({sponsor.email} | {sponsor.phone})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isPaid && ['FINANCER', 'ADMIN'].includes(role) && (
            <Button variant="primary" size="md" onClick={() => setShowPayModal(true)}>
              <CreditCard className="w-4 h-4 mr-1" /> Confirm Payment & Credit Income
            </Button>
          )}

          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Sponsorship Amount</p>
            <AmountText amount={sponsor.amount} size="lg" />
          </div>
        </div>
      </div>

      {/* Benefit Fulfillment Checklist Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Sponsorship Benefit Fulfillment Checklist
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Automatically generated checklist based on <span className="font-bold text-slate-800">{sponsor.tierName}</span> tier rules.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-700">Completion:</span>
            <span className="text-sm font-extrabold text-blue-600">{completionPercentage}%</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-blue-600 h-full transition-all duration-500 rounded-full"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        {/* Checklist Items */}
        <div className="space-y-2.5 pt-2">
          {benefits.map((benefit) => {
            const isCompleted = benefit.status === 'COMPLETED';

            return (
              <div
                key={benefit._id}
                onClick={() => handleToggleBenefitStatus(benefit._id, benefit.status)}
                className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isCompleted
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                    : 'bg-white border-slate-200 hover:border-blue-400 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isCompleted ? (
                    <CheckSquare className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  )}
                  <span className={`text-xs font-semibold ${isCompleted ? 'line-through text-emerald-800' : ''}`}>
                    {benefit.benefitDescription}
                  </span>
                </div>

                {isCompleted && benefit.completedBy && (
                  <span className="text-[10px] text-emerald-700 font-medium">
                    ✓ Verified by {benefit.completedBy.fullName}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* CONFIRM PAYMENT MODAL */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-2xl border border-slate-200 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Confirm Sponsor Payment</h3>
            <p className="text-xs text-slate-500">
              Confirming payment will automatically add <AmountText amount={sponsor.amount} size="sm" /> to club income and credit the ledger.
            </p>
            <form onSubmit={handleConfirmPayment} className="space-y-4">
              <FormField label="Payment Method" required>
                <Input
                  value={paymentData.paymentMethod}
                  onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                  placeholder="Bank Transfer / Cheque / UPI"
                  required
                />
              </FormField>

              <FormField label="Transaction / NEFT Reference Number" required>
                <Input
                  value={paymentData.transactionReference}
                  onChange={(e) => setPaymentData({ ...paymentData, transactionReference: e.target.value })}
                  placeholder="e.g. NEFT-889922001"
                  required
                />
              </FormField>

              <FormField label="Payment Received Date" required>
                <Input
                  type="date"
                  value={paymentData.paymentDate}
                  onChange={(e) => setPaymentData({ ...paymentData, paymentDate: e.target.value })}
                  required
                />
              </FormField>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" type="button" onClick={() => setShowPayModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Confirm Payment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
