'use client';

import React from 'react';
import Badge from '../atoms/Badge';
import { Clock, CheckCircle2, XCircle, CreditCard, ShieldCheck } from 'lucide-react';

export default function StatusBadge({ status = 'PENDING_TREASURER', rounded = 'rounded-md', className = '' }) {
  const configs = {
    PENDING_TREASURER: {
      label: 'Pending Approval',
      variant: 'warning',
      icon: Clock,
    },
    TREASURER_APPROVED: {
      label: 'Approved (Pending Payment)',
      variant: 'primary',
      icon: CheckCircle2,
    },
    PAYMENT_PENDING: {
      label: 'Payment Pending',
      variant: 'primary',
      icon: CreditCard,
    },
    REJECTED: {
      label: 'Rejected',
      variant: 'danger',
      icon: XCircle,
    },
    PAID: {
      label: 'Paid (Pending Verification)',
      variant: 'cyan',
      icon: CreditCard,
    },
    VERIFIED: {
      label: 'Verified & Closed',
      variant: 'success',
      icon: ShieldCheck,
    },
    PENDING: {
      label: 'Pending',
      variant: 'warning',
      icon: Clock,
    },
    COMPLETED: {
      label: 'Completed',
      variant: 'success',
      icon: CheckCircle2,
    },
  };

  const config = configs[status] || {
    label: status,
    variant: 'default',
    icon: Clock,
  };

  const IconComponent = config.icon;

  return (
    <Badge variant={config.variant} rounded={rounded} className={className}>
      <IconComponent className="w-3.5 h-3.5 flex-shrink-0" />
      <span className="leading-tight text-center">{config.label}</span>
    </Badge>
  );
}
