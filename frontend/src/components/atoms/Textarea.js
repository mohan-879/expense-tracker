'use client';

import React from 'react';

export default function Textarea({
  name,
  value,
  onChange,
  placeholder = '',
  rows = 3,
  required = false,
  disabled = false,
  error = '',
  className = '',
}) {
  return (
    <div className="w-full">
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
        disabled={disabled}
        className={`w-full px-3.5 py-2 text-sm text-slate-800 bg-white border ${
          error ? 'border-rose-500 focus:ring-rose-400' : 'border-slate-300 focus:ring-blue-500'
        } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:border-transparent disabled:bg-slate-100 disabled:text-slate-500 transition-colors ${className}`}
      />
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}
