'use client';

import React from 'react';
import Badge from '../atoms/Badge';
import { Award, Crown, Star, Shield } from 'lucide-react';

export default function SponsorTierBadge({ tier = 'SUPPORTING', rounded = 'rounded-md', className = '' }) {
  const configs = {
    PLATINUM: {
      label: 'PLATINUM TIER',
      variant: 'purple',
      icon: Crown,
    },
    GOLD: {
      label: 'GOLD TIER',
      variant: 'warning',
      icon: Award,
    },
    SILVER: {
      label: 'SILVER TIER',
      variant: 'primary',
      icon: Star,
    },
    SUPPORTING: {
      label: 'SUPPORTING TIER',
      variant: 'default',
      icon: Shield,
    },
  };

  const config = configs[String(tier).toUpperCase()] || configs.SUPPORTING;
  const IconComponent = config.icon;

  return (
    <Badge variant={config.variant} rounded={rounded} className={className}>
      <IconComponent className="w-3.5 h-3.5 flex-shrink-0" />
      <span>{config.label}</span>
    </Badge>
  );
}
