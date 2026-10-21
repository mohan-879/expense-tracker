'use client';

import React from 'react';

export default function Select({
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select option',
  placeholderDisabled = false,
  required = false,
  disabled = false,
  error = '',
  className = '',
}) {
  return (
    <div className="w-full">
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`w-full px-3.5 py-2 text-sm text-slate-800 bg-white border ${
          error ? 'border-rose-500 focus:ring-rose-400' : 'border-slate-300 focus:ring-blue-500'
        } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:border-transparent disabled:bg-slate-100 disabled:text-slate-500 transition-colors ${className}`}
      >
        {placeholder && (
          <option value="" disabled={placeholderDisabled}>
            {placeholder}
          </option>
        )}
        {options.map((opt, idx) => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const label = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={idx} value={val}>
              {label}
            </option>
          );
        })}
      </select>
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}
