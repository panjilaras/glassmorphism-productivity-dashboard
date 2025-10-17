import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hover?: boolean;
  gradient?: 1 | 2 | 3 | 4;
}

export function GlassCard({ 
  children, 
  className, 
  hover = false,
  gradient,
  ...props 
}: GlassCardProps) {
  return (
    <div
      className={cn(
        'glass-card rounded-2xl p-6',
        hover && 'glass-hover cursor-pointer',
        gradient && `aero-gradient-${gradient}`,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}