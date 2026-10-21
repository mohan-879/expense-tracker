'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [targetUrl, setTargetUrl] = useState('/login');

  useEffect(() => {
    let dest = '/login';
    try {
      const storedToken = localStorage.getItem('clubfund_token');
      const storedUser = localStorage.getItem('clubfund_user');
      if (storedToken && storedUser) {
        dest = '/dashboard';
      }
    } catch (e) {
      dest = '/login';
    }

    setTargetUrl(dest);

    // Immediate router replace
    router.replace(dest);

    // Hard fallback redirect to ensure page never hangs
    const timer = setTimeout(() => {
      if (window.location.pathname === '/' || window.location.pathname === '') {
        window.location.replace(dest);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-extrabold text-xl flex items-center justify-center mx-auto shadow-md shadow-blue-500/20">
          DS
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">DSCLUB EXPENSE TRACKER</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">Panimalar Engineering College</p>
        </div>

        <div className="flex items-center justify-center space-x-3 py-2">
          <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-slate-600">Redirecting to portal...</span>
        </div>

        <div className="pt-2">
          <Link
            href={targetUrl}
            className="inline-flex items-center justify-center w-full px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm"
          >
            Click here if not redirected automatically
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
