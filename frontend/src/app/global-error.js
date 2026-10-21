'use client';

import React from 'react';

export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-4 bg-slate-800 p-8 rounded-2xl border border-slate-700">
          <h1 className="text-2xl font-black text-rose-400">Application Error</h1>
          <p className="text-sm text-slate-300">
            {error?.message || 'A critical error occurred in the application.'}
          </p>
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 font-bold text-sm rounded-xl transition-colors"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
