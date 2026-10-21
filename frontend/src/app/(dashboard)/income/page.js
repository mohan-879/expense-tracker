'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import API from '../../../services/api';
import AmountText from '../../../components/atoms/AmountText';
import Button from '../../../components/atoms/Button';
import Input from '../../../components/atoms/Input';
import Select from '../../../components/atoms/Select';
import FormField from '../../../components/molecules/FormField';
import { DollarSign, PlusCircle, ArrowUpRight, FileSpreadsheet, FileText } from 'lucide-react';
import { exportToStyledExcel, exportToStyledPDF } from '../../../utils/exportHelper';

export default function IncomePage() {
  const { user } = useAuth();
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    source: 'College Funding',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    paymentMethod: 'Bank Transfer',
    referenceNumber: '',
  });

  useEffect(() => {
    fetchIncome();
  }, []);

  const fetchIncome = async () => {
    try {
      setLoading(true);
      const res = await API.get('/income');
      if (res.data.success) {
        setIncomes(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddIncome = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/income', formData);
      if (res.data.success) {
        setShowAddModal(false);
        setFormData({
          source: 'College Funding',
          amount: '',
          date: new Date().toISOString().split('T')[0],
          description: '',
          paymentMethod: 'Bank Transfer',
          referenceNumber: '',
        });
        fetchIncome();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const sourceOptions = [
    'College Funding',
    'Sponsorship',
    'Membership Fees',
    'Event Registration',
    'Donations',
    'Other Income',
  ];

  const totalIncomeSum = incomes.reduce((acc, inc) => acc + inc.amount, 0);

  // Export to Excel (.xlsx) matching structured model format
  const exportToExcel = async () => {
    if (incomes.length === 0) {
      alert('No income records available to export.');
      return;
    }

    try {
      const headers = [
        '#',
        'Income Code / ID',
        'Source / Sponsor Name',
        'Category / Description',
        'Payment Method',
        'Reference No',
        'Amount (INR)',
        'Status',
        'Recorded At',
      ];

      const rows = incomes.map((inc, idx) => [
        idx + 1,
        inc.incomeCode || 'N/A',
        inc.source || '-',
        inc.description || 'Club Inflow',
        inc.paymentMethod || 'Bank Transfer',
        inc.referenceNumber || '-',
        inc.amount || 0,
        'Completed',
        new Date(inc.date || inc.createdAt).toLocaleString('en-IN'),
      ]);

      await exportToStyledExcel({
        filename: `Panimalar_Club_Income_${new Date().toISOString().slice(0, 10)}.xlsx`,
        sheetName: 'Income_Ledger',
        reportTitle: 'EXPENSE TRACKER',
        metaInfo: `Generated: ${new Date().toLocaleString('en-IN')} | Total Entries: ${incomes.length} | Total Income: Rs. ${totalIncomeSum.toLocaleString('en-IN')}`,
        headers,
        rows,
        columnAlignments: ['center', 'center', 'left', 'left', 'center', 'center', 'right', 'center', 'center'],
      });
    } catch (err) {
      console.error('Export Excel failed:', err);
      alert('Failed to export Excel: ' + (err.message || 'Unknown error'));
    }
  };

  // Export to PDF matching structured model format
  const exportToPDF = async () => {
    if (incomes.length === 0) {
      alert('No income records available to export.');
      return;
    }

    try {
      const headers = [
        '#',
        'Code',
        'Source / Sponsor',
        'Description',
        'Payment Method',
        'Reference No',
        'Amount',
        'Status',
        'Recorded At',
      ];

      const rows = incomes.map((inc, idx) => {
        const dateStr = new Date(inc.date || inc.createdAt).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
        return [
          idx + 1,
          inc.incomeCode || 'N/A',
          inc.source || '',
          inc.description || '-',
          inc.paymentMethod || 'Bank Transfer',
          inc.referenceNumber || '-',
          `Rs. ${(inc.amount || 0).toLocaleString('en-IN')}`,
          'Completed',
          dateStr,
        ];
      });

      await exportToStyledPDF({
        filename: `Panimalar_Club_Income_${new Date().toISOString().slice(0, 10)}.pdf`,
        reportTitle: 'EXPENSE TRACKER',
        metaInfo: `Club Income Ledger | Total Entries: ${incomes.length} | Total Inflow: Rs. ${totalIncomeSum.toLocaleString('en-IN')}`,
        headers,
        rows,
        orientation: 'landscape',
        columnStyles: {
          0: { halign: 'center', cellWidth: 10 },
          1: { halign: 'center', cellWidth: 26 },
          2: { halign: 'left' },
          3: { halign: 'left' },
          4: { halign: 'center', cellWidth: 28 },
          5: { halign: 'center', cellWidth: 26 },
          6: { halign: 'right', cellWidth: 28 },
          7: { halign: 'center', cellWidth: 22 },
          8: { halign: 'center', cellWidth: 26 },
        },
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
            Club Income Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track all incoming funds from college grants, sponsorships, membership fees, and donations.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2.5">
          {['ADMIN', 'FINANCER', 'FACULTY_COORDINATOR'].includes(user?.role) && (
            <Button variant="primary" size="md" onClick={() => setShowAddModal(true)} className="font-bold">
              <PlusCircle className="w-4 h-4 mr-2" /> Record Club Income
            </Button>
          )}

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

      <div className="p-6 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl text-white shadow-lg shadow-emerald-500/20 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-100">Total Recorded Club Income</p>
          <p className="text-3xl font-extrabold mt-1">₹{totalIncomeSum.toLocaleString('en-IN')}</p>
        </div>
        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-xs">
          <ArrowUpRight className="w-8 h-8 text-white" />
        </div>
      </div>

      {/* Income Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 font-bold text-slate-900 text-sm">
          Income Ledger Entries
        </div>
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading income ledger...</div>
        ) : incomes.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No income entries recorded yet.</div>
        ) : (
          <>
            {/* Mobile Cards (Zero Horizontal Scroll) */}
            <div className="md:hidden divide-y divide-slate-100 p-3 space-y-3">
              {incomes.map((inc) => (
                <div key={inc._id} className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="font-mono text-[10px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                        {inc.incomeCode}
                      </span>
                      <h4 className="font-bold text-xs text-slate-900 mt-1 leading-tight">{inc.source}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{inc.description || 'No description'}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <AmountText amount={inc.amount} size="sm" type="credit" />
                      <p className="text-[10px] text-slate-400 mt-0.5">{new Date(inc.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Payment: <strong className="text-slate-700">{inc.paymentMethod}</strong></span>
                    {inc.referenceNumber && <span className="font-mono text-[10px]">Ref: {inc.referenceNumber}</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Income Code</th>
                    <th className="px-6 py-4">Source & Description</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Payment Method</th>
                    <th className="px-6 py-4">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {incomes.map((inc) => (
                    <tr key={inc._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900 text-xs">{inc.incomeCode}</td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900 leading-tight">{inc.source}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{inc.description || 'No description'}</p>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-600">
                        {new Date(inc.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600">
                        {inc.paymentMethod} {inc.referenceNumber ? `(${inc.referenceNumber})` : ''}
                      </td>
                      <td className="px-6 py-4">
                        <AmountText amount={inc.amount} size="sm" type="credit" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* RECORD INCOME MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-2xl border border-slate-200 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Record Club Income</h3>
            <form onSubmit={handleAddIncome} className="space-y-4">
              <FormField label="Income Source" required>
                <Select
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  options={sourceOptions}
                  required
                />
              </FormField>

              <FormField label="Amount (₹)" required>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="50000"
                  min="0.01"
                  step="0.01"
                  required
                />
              </FormField>

              <FormField label="Income Date" required>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </FormField>

              <FormField label="Payment Method">
                <Select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  options={['Bank Transfer', 'UPI', 'Cheque', 'Cash', 'Card', 'Other']}
                />
              </FormField>

              <FormField label="Reference / Transaction Number">
                <Input
                  value={formData.referenceNumber}
                  onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                  placeholder="e.g. GOV-GRANT-2026"
                />
              </FormField>

              <FormField label="Description">
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Annual Student Activity Fund Grant"
                />
              </FormField>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" type="button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Record Income
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
