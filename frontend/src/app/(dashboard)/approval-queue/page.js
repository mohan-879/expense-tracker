'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import API from '../../../services/api';
import ExpenseTable from '../../../components/organisms/ExpenseTable';

export default function ApprovalQueuePage() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingExpenses();
  }, []);

  const fetchPendingExpenses = async () => {
    try {
      setLoading(true);
      const res = await API.get('/expenses?status=PENDING_TREASURER');
      if (res.data.success) {
        setExpenses(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Approval Queue (Treasurer & Faculty Review)
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review and approve or reject pending member reimbursement requests.
        </p>
      </div>

      <ExpenseTable
        expenses={expenses}
        role={user?.role}
        currentUserId={user?._id}
        loading={loading}
        onRefresh={fetchPendingExpenses}
      />
    </div>
  );
}
