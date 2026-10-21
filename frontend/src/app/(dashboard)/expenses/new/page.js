'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SubmitExpensePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/expenses?action=new');
    const timer = setTimeout(() => {
      window.location.replace('/expenses?action=new');
    }, 150);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-3">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xs font-semibold text-slate-500">Opening Expense Submission...</p>
    </div>
  );
}
