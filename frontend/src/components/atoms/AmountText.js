'use client';

import React from 'react';

export default function AmountText({
  amount = 0,
  currency = '₹',
  size = 'md',
  type = 'neutral', // 'credit', 'debit', 'neutral'
  className = '',
}) {
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(Number(amount) || 0);

  const colors = {
    neutral: 'text-slate-900',
    credit: 'text-emerald-600',
    debit: 'text-rose-600',
    warning: 'text-amber-600',
  };

  const sizes = {
    xs: 'text-xs font-bold',
    sm: 'text-sm font-semibold',
    md: 'text-base font-bold',
    lg: 'text-xl font-bold',
    xl: 'text-3xl font-extrabold',
  };

  const prefix = type === 'credit' ? '+' : type === 'debit' ? '-' : '';

  return (
    <span className={`inline-flex items-center tracking-tight ${colors[type]} ${sizes[size]} ${className}`}>
      {prefix}
      {currency}
      {formatted}
    </span>
  );
}
