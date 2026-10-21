'use client';

import React from 'react';
import AmountText from '../atoms/AmountText';

export default function MetricCard({
  title,
  amount,
  isCurrency = true,
  count,
  subtitle,
  icon: Icon,
  color = 'blue',
  className = '',
}) {
  const colorStyles = {
    blue: {
      bg: 'bg-blue-50/90 text-blue-600 border-blue-100',
      borderTop: 'border-t-blue-500',
      badge: 'text-blue-700 bg-blue-50',
    },
    emerald: {
      bg: 'bg-emerald-50/90 text-emerald-600 border-emerald-100',
      borderTop: 'border-t-emerald-500',
      badge: 'text-emerald-700 bg-emerald-50',
    },
    amber: {
      bg: 'bg-amber-50/90 text-amber-600 border-amber-100',
      borderTop: 'border-t-amber-500',
      badge: 'text-amber-700 bg-amber-50',
    },
    rose: {
      bg: 'bg-rose-50/90 text-rose-600 border-rose-100',
      borderTop: 'border-t-rose-500',
      badge: 'text-rose-700 bg-rose-50',
    },
    purple: {
      bg: 'bg-purple-50/90 text-purple-600 border-purple-100',
      borderTop: 'border-t-purple-500',
      badge: 'text-purple-700 bg-purple-50',
    },
    indigo: {
      bg: 'bg-indigo-50/90 text-indigo-600 border-indigo-100',
      borderTop: 'border-t-indigo-500',
      badge: 'text-indigo-700 bg-indigo-50',
    },
    cyan: {
      bg: 'bg-cyan-50/90 text-cyan-600 border-cyan-100',
      borderTop: 'border-t-cyan-500',
      badge: 'text-cyan-700 bg-cyan-50',
    },
  };

  const style = colorStyles[color] || colorStyles.blue;

  return (
    <div
      className={`p-2.5 sm:p-4 bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 border-t-2 sm:border-t-3 ${style.borderTop} shadow-2xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between ${className}`}
    >
      <div className="flex items-start justify-between gap-1.5 sm:gap-2.5">
        <div className="min-w-0 flex-1">
          <p className="text-[9px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
            {title}
          </p>
          <div className="mt-1 sm:mt-1.5">
            {isCurrency ? (
              <AmountText amount={amount} size="xs" className="!text-xs sm:!text-base font-extrabold truncate" />
            ) : (
              <span className="text-sm sm:text-xl font-extrabold text-slate-900 tracking-tight">
                {count}
              </span>
            )}
          </div>
        </div>
        {Icon && (
          <div className={`p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl border ${style.bg} flex-shrink-0 shadow-2xs`}>
            <Icon className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
          </div>
        )}
      </div>

      {subtitle && (
        <div className="mt-2 sm:mt-2.5 pt-1.5 sm:pt-2 border-t border-slate-100 flex items-center justify-between text-[9px] sm:text-[10.5px] text-slate-400">
          <span className="truncate">{subtitle}</span>
        </div>
      )}
    </div>
  );
}
