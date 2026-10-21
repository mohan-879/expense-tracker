'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import API from '../../../services/api';
import ExpenseTable from '../../../components/organisms/ExpenseTable';

export default function VerificationQueuePage() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVerificationQueue();
  }, []);

  const fetchVerificationQueue = async () => {
    try {
      setLoading(true);
      const res = await API.get('/expenses?status=PAID');
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
          Faculty Coordinator Verification Queue
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Final review of paid expenses to verify completeness and close the transaction in the ledger.
        </p>
      </div>

      <ExpenseTable
        expenses={expenses}
        role={user?.role}
        currentUserId={user?._id}
        loading={loading}
        onRefresh={fetchVerificationQueue}
      />
    </div>
  );
}
