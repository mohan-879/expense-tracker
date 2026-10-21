'use client';

import React from 'react';

export default function Input({
  type = 'text',
  name,
  value,
  onChange,
  placeholder = '',
  required = false,
  disabled = false,
  error = '',
  className = '',
  min,
  max,
  step,
}) {
  return (
    <div className="w-full">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        className={`w-full px-3.5 py-2 text-sm text-slate-800 bg-white border ${
          error ? 'border-rose-500 focus:ring-rose-400' : 'border-slate-300 focus:ring-blue-500'
        } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:border-transparent disabled:bg-slate-100 disabled:text-slate-500 transition-colors ${className}`}
      />
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}
