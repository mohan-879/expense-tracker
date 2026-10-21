'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import API from '../../../../services/api';
import Button from '../../../../components/atoms/Button';
import Input from '../../../../components/atoms/Input';
import Textarea from '../../../../components/atoms/Textarea';
import FormField from '../../../../components/molecules/FormField';
import FileUploader from '../../../../components/molecules/FileUploader';
import SponsorTierBadge from '../../../../components/molecules/SponsorTierBadge';
import { ArrowLeft, Sparkles, Send, AlertCircle } from 'lucide-react';

export default function AddSponsorPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    amount: '',
    notes: '',
  });

  const [logoFile, setLogoFile] = useState(null);
  const [detectedTier, setDetectedTier] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Live Auto-Detection of Sponsor Tier as Amount changes
  useEffect(() => {
    const amountNum = Number(formData.amount);
    if (!isNaN(amountNum) && amountNum > 0) {
      previewTier(amountNum);
    } else {
      setDetectedTier(null);
    }
  }, [formData.amount]);

  const previewTier = async (amt) => {
    try {
      const res = await API.post('/sponsors/preview-tier', { amount: amt });
      if (res.data.success) {
        setDetectedTier(res.data.data.name);
      }
    } catch (err) {
      // Local fallback calculation
      if (amt >= 100000) setDetectedTier('PLATINUM');
      else if (amt >= 50000) setDetectedTier('GOLD');
      else if (amt >= 25000) setDetectedTier('SILVER');
      else setDetectedTier('SUPPORTING');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (Number(formData.amount) <= 0) {
      setError('Sponsorship amount must be positive');
      return;
    }

    setLoading(true);

    try {
      const payload = new FormData();
      Object.keys(formData).forEach((key) => {
        payload.append(key, formData[key]);
      });
      if (logoFile) payload.append('logo', logoFile);

      const res = await API.post('/sponsors', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        router.push(`/sponsors/${res.data.data._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to add sponsor');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Sponsors
      </button>

      <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs">
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Add Corporate Sponsor
        </h1>
        <p className="text-xs text-slate-500 mt-0.5 mb-6">
          Enter sponsor contribution amount to trigger automated tier classification and benefit checklist generation.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-xs text-rose-700 font-semibold">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormField label="Company / Sponsor Name" required>
            <Input
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="e.g. Cybertronium Technologies"
              required
            />
          </FormField>

          {/* Amount & Real-time Live Tier Detector */}
          <div className="p-5 bg-gradient-to-r from-blue-50/70 to-indigo-50/70 border border-blue-200/80 rounded-2xl space-y-3">
            <FormField label="Sponsorship Amount (₹)" required helpText="Enters sponsorship contribution value">
              <Input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="100000"
                min="0.01"
                step="0.01"
                required
              />
            </FormField>

            {detectedTier && (
              <div className="flex items-center justify-between pt-2 border-t border-blue-200/60 text-xs">
                <span className="font-bold text-blue-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" /> Live Backend Detected Tier Preview:
                </span>
                <SponsorTierBadge tier={detectedTier} />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField label="Contact Person Name" required>
              <Input
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                placeholder="e.g. Vikram Seth"
                required
              />
            </FormField>

            <FormField label="Phone Number" required>
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 9988776655"
                required
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField label="Corporate Email" required>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="sponsorship@company.com"
                required
              />
            </FormField>

            <FormField label="Company Logo (Optional)">
              <FileUploader
                label="Upload Company Logo"
                onFileSelect={(file) => setLogoFile(file)}
              />
            </FormField>
          </div>

          <FormField label="Office Address">
            <Input
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Tech Park, Bangalore..."
            />
          </FormField>

          <FormField label="Notes / Event Association">
            <Textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Special notes e.g. Title sponsor for Annual TechFest..."
              rows={2}
            />
          </FormField>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={loading} className="font-bold shadow-md shadow-blue-500/20">
              <Send className="w-4 h-4 mr-2" /> Register Sponsor
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
