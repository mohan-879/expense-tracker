'use client';

import React from 'react';

export default function RoleBadge({ role }) {
  const colors = {
    ADMIN: 'bg-rose-50 text-rose-700 border-rose-200',
    FACULTY_COORDINATOR: 'bg-purple-50 text-purple-700 border-purple-200',
    FINANCER: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    TREASURER: 'bg-amber-50 text-amber-700 border-amber-200',
    MEMBER: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  return (
    <span
      className={`inline-block px-2.5 py-0.5 text-[10px] font-extrabold border rounded-md uppercase ${
        colors[role] || 'bg-slate-100 text-slate-700 border-slate-200'
      }`}
    >
      {role?.replace(/_/g, ' ') || role}
    </span>
  );
}
