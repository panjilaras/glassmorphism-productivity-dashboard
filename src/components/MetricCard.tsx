"use client";

import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  gradient?: 1 | 2 | 3 | 4;
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  change,
  changeType = 'neutral',
  gradient,
}: MetricCardProps) {
  return (
    <GlassCard hover gradient={gradient} className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-foreground">{value}</h3>
          {change && (
            <p
              className={cn(
                'text-sm font-medium mt-2',
                changeType === 'positive' && 'text-green-600 dark:text-green-400',
                changeType === 'negative' && 'text-red-600 dark:text-red-400',
                changeType === 'neutral' && 'text-muted-foreground'
              )}
            >
              {change}
            </p>
          )}
        </div>
        <div className="p-3 rounded-xl bg-primary/10">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
    </GlassCard>
  );
}