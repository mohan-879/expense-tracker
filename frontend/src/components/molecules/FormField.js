'use client';

import React from 'react';

export default function FormField({
  label,
  required = false,
  error = '',
  helpText = '',
  children,
  className = '',
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      {children}
      {helpText && !error && <p className="text-xs text-slate-500">{helpText}</p>}
      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
    </div>
  );
}
