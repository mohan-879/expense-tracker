'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import API from '../../../services/api';
import SponsorTierBadge from '../../../components/molecules/SponsorTierBadge';
import AmountText from '../../../components/atoms/AmountText';
import Button from '../../../components/atoms/Button';
import { Award, PlusCircle, Building2, CheckCircle2, Clock, Eye, FileSpreadsheet, FileText } from 'lucide-react';
import { exportToStyledExcel, exportToStyledPDF } from '../../../utils/exportHelper';

export default function SponsorsPage() {
  const { user } = useAuth();
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSponsors();
  }, []);

  const fetchSponsors = async () => {
    try {
      setLoading(true);
      const res = await API.get('/sponsors');
      if (res.data.success) {
        setSponsors(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const tierCounts = {
    PLATINUM: sponsors.filter((s) => s.tierName === 'PLATINUM').length,
    GOLD: sponsors.filter((s) => s.tierName === 'GOLD').length,
    SILVER: sponsors.filter((s) => s.tierName === 'SILVER').length,
    SUPPORTING: sponsors.filter((s) => s.tierName === 'SUPPORTING').length,
  };

  const exportToExcel = async () => {
    if (sponsors.length === 0) {
      alert('No sponsor records available to export.');
      return;
    }
    try {
      const headers = ['#', 'Company / Sponsor', 'Tier', 'Amount (INR)', 'Payment Status', 'Contact Person', 'Email', 'Phone', 'Created Date'];
      const rows = sponsors.map((sp, idx) => [
        idx + 1,
        sp.name,
        sp.tierName,
        sp.amount || 0,
        sp.paymentStatus || 'PENDING',
        sp.contactPerson || '-',
        sp.email || '-',
        sp.phone || '-',
        new Date(sp.createdAt).toLocaleDateString('en-IN'),
      ]);
      await exportToStyledExcel({
        filename: `Panimalar_Sponsors_${new Date().toISOString().slice(0, 10)}.xlsx`,
        sheetName: 'Corporate_Sponsors',
        reportTitle: 'EXPENSE TRACKER - CORPORATE SPONSORS',
        metaInfo: `Corporate Sponsorship Roster | Total Sponsors: ${sponsors.length} | Exported: ${new Date().toLocaleString('en-IN')}`,
        headers,
        rows,
        columnAlignments: ['center', 'left', 'center', 'right', 'center', 'left', 'left', 'center', 'center'],
      });
    } catch (err) {
      console.error('Export Excel failed:', err);
      alert('Failed to export Excel: ' + (err.message || 'Unknown error'));
    }
  };

  const exportToPDF = async () => {
    if (sponsors.length === 0) {
      alert('No sponsor records available to export.');
      return;
    }
    try {
      const headers = ['#', 'Sponsor Name', 'Tier', 'Amount', 'Status', 'Contact', 'Phone', 'Date'];
      const rows = sponsors.map((sp, idx) => [
        idx + 1,
        sp.name,
        sp.tierName,
        `Rs. ${(sp.amount || 0).toLocaleString('en-IN')}`,
        sp.paymentStatus || 'PENDING',
        sp.contactPerson || '-',
        sp.phone || '-',
        new Date(sp.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }),
      ]);
      await exportToStyledPDF({
        filename: `Panimalar_Sponsors_${new Date().toISOString().slice(0, 10)}.pdf`,
        reportTitle: 'EXPENSE TRACKER - CORPORATE SPONSORS',
        metaInfo: `Corporate Sponsorship Roster | Total Sponsors: ${sponsors.length} | Exported: ${new Date().toLocaleString('en-IN')}`,
        headers,
        rows,
        orientation: 'landscape',
      });
    } catch (err) {
      console.error('Export PDF failed:', err);
      alert('Failed to export PDF: ' + (err.message || 'Unknown error'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Sponsor Management & Tier Classification
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage sponsors, automated sponsorship tiers, payment confirmations, and benefit fulfillment.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2.5">
          {['ADMIN', 'FINANCER', 'FACULTY_COORDINATOR', 'TREASURER'].includes(user?.role?.toUpperCase?.()) && (
            <Link href="/sponsors/new">
              <Button variant="primary" size="md" className="font-bold shadow-md shadow-blue-500/20 w-full sm:w-auto">
                <PlusCircle className="w-4 h-4 mr-2" /> Add New Sponsor
              </Button>
            </Link>
          )}

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={exportToExcel}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              title="Export to Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4" /> Export Excel
            </button>
            <button
              onClick={exportToPDF}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              title="Export to PDF"
            >
              <FileText className="w-4 h-4" /> Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Corporate Sponsorship Tier Proposal Cards - All in One Row on Mobile */}
      <div className="flex flex-row overflow-x-auto gap-2.5 pb-2 -mx-1 px-1 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-4 sm:overflow-visible snap-x scrollbar-thin">
        <div className="flex-1 shrink-0 min-w-[170px] sm:min-w-0 snap-start p-3.5 sm:p-5 bg-gradient-to-br from-purple-50 to-white border border-purple-200 rounded-2xl shadow-xs">
          <div className="flex flex-col justify-between h-full space-y-2">
            <div className="flex items-center justify-between gap-1">
              <SponsorTierBadge tier="PLATINUM" />
              <span className="text-[10px] sm:text-xs font-bold text-purple-700 whitespace-nowrap">
                {tierCounts.PLATINUM} Enrolled
              </span>
            </div>
            <p className="text-base sm:text-2xl font-black text-purple-950 mt-1">₹1,00,000+</p>
          </div>
        </div>

        <div className="flex-1 shrink-0 min-w-[170px] sm:min-w-0 snap-start p-3.5 sm:p-5 bg-gradient-to-br from-amber-50 to-white border border-amber-200 rounded-2xl shadow-xs">
          <div className="flex flex-col justify-between h-full space-y-2">
            <div className="flex items-center justify-between gap-1">
              <SponsorTierBadge tier="GOLD" />
              <span className="text-[10px] sm:text-xs font-bold text-amber-700 whitespace-nowrap">
                {tierCounts.GOLD} Enrolled
              </span>
            </div>
            <p className="text-base sm:text-2xl font-black text-amber-950 mt-1">₹50,000 – ₹99k</p>
          </div>
        </div>

        <div className="flex-1 shrink-0 min-w-[170px] sm:min-w-0 snap-start p-3.5 sm:p-5 bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-2xl shadow-xs">
          <div className="flex flex-col justify-between h-full space-y-2">
            <div className="flex items-center justify-between gap-1">
              <SponsorTierBadge tier="SILVER" />
              <span className="text-[10px] sm:text-xs font-bold text-blue-700 whitespace-nowrap">
                {tierCounts.SILVER} Enrolled
              </span>
            </div>
            <p className="text-base sm:text-2xl font-black text-blue-950 mt-1">₹25,000 – ₹49k</p>
          </div>
        </div>

        <div className="flex-1 shrink-0 min-w-[170px] sm:min-w-0 snap-start p-3.5 sm:p-5 bg-gradient-to-br from-slate-100 to-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex flex-col justify-between h-full space-y-2">
            <div className="flex items-center justify-between gap-1">
              <SponsorTierBadge tier="SUPPORTING" />
              <span className="text-[10px] sm:text-xs font-bold text-slate-600 whitespace-nowrap">
                {tierCounts.SUPPORTING} Enrolled
              </span>
            </div>
            <p className="text-base sm:text-2xl font-black text-slate-900 mt-1">Below ₹25,000</p>
          </div>
        </div>
      </div>

      {/* Sponsor List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 font-bold text-slate-900 text-sm">
          Registered Corporate Sponsors
        </div>
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading sponsors...</div>
        ) : sponsors.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No sponsors registered yet.</div>
        ) : (
          <>
            {/* Mobile View Cards (Zero Horizontal Scroll) */}
            <div className="md:hidden divide-y divide-slate-100 p-3 space-y-3">
              {sponsors.map((sp) => (
                <div key={sp._id} className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-slate-900 truncate leading-tight">{sp.companyName}</h4>
                        <p className="text-[10px] text-slate-400 truncate">{sp.email}</p>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <SponsorTierBadge tier={sp.tierName} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <div>
                      <p className="text-[10px] text-slate-400">Contribution</p>
                      <AmountText amount={sp.amount} size="sm" />
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          sp.paymentStatus === 'PAID'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {sp.paymentStatus === 'PAID' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        {sp.paymentStatus}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">Contact: {sp.contactPerson}</span>
                    <Link href={`/sponsors/${sp._id}`}>
                      <Button variant="outline" size="sm" className="text-xs py-1 px-2.5 h-auto">
                        <Eye className="w-3 h-3 mr-1" /> View Checklist
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Company Name</th>
                    <th className="px-6 py-4">Contact Person</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Detected Tier</th>
                    <th className="px-6 py-4">Payment Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sponsors.map((sp) => (
                    <tr key={sp._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-3">
                        <Building2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <div>
                          <p className="leading-tight">{sp.companyName}</p>
                          <p className="text-xs text-slate-400 font-normal">{sp.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800">{sp.contactPerson}</p>
                        <p className="text-xs text-slate-500">{sp.phone}</p>
                      </td>
                      <td className="px-6 py-4">
                        <AmountText amount={sp.amount} size="sm" />
                      </td>
                      <td className="px-6 py-4">
                        <SponsorTierBadge tier={sp.tierName} />
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full ${
                            sp.paymentStatus === 'PAID'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {sp.paymentStatus === 'PAID' ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <Clock className="w-3.5 h-3.5" />
                          )}
                          {sp.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/sponsors/${sp._id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-3.5 h-3.5 mr-1" /> View Checklist
                          </Button>
                        </Link>
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
