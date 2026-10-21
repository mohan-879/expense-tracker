'use client';

import React, { useEffect } from 'react';
import Button from '../components/atoms/Button';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('App Router Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-xl text-center space-y-4">
        <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Something went wrong!</h2>
        <p className="text-sm text-slate-500">
          {error?.message || 'An unexpected error occurred while loading this page.'}
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={() => reset()}
            className="font-bold flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={() => (window.location.href = '/dashboard')}
            className="font-bold"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
