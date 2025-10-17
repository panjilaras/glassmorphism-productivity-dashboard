"use client";

import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { CheckCircle2, Clock, AlertCircle, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';

const activities = [
  {
    id: 1,
    type: 'completed',
    user: 'Sarah Johnson',
    action: 'completed task',
    task: 'Update landing page design',
    time: '5 minutes ago',
    icon: CheckCircle2,
    color: 'text-green-500',
  },
  {
    id: 2,
    type: 'created',
    user: 'Mike Chen',
    action: 'created new task',
    task: 'Review API documentation',
    time: '15 minutes ago',
    icon: Clock,
    color: 'text-blue-500',
  },
  {
    id: 3,
    type: 'alert',
    user: 'Emma Davis',
    action: 'flagged as urgent',
    task: 'Fix production bug',
    time: '1 hour ago',
    icon: AlertCircle,
    color: 'text-orange-500',
  },
  {
    id: 4,
    type: 'user',
    user: 'Alex Turner',
    action: 'joined the team',
    task: '',
    time: '2 hours ago',
    icon: UserPlus,
    color: 'text-purple-500',
  },
  {
    id: 5,
    type: 'completed',
    user: 'Lisa Wang',
    action: 'completed task',
    task: 'Client presentation slides',
    time: '3 hours ago',
    icon: CheckCircle2,
    color: 'text-green-500',
  },
  {
    id: 6,
    type: 'created',
    user: 'David Kim',
    action: 'created new task',
    task: 'Database optimization',
    time: '5 hours ago',
    icon: Clock,
    color: 'text-blue-500',
  },
];

export function RecentActivity() {
  return (
    <GlassCard className="h-[400px] overflow-hidden flex flex-col">
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-4">
        {activities.map((activity) => {
          const Icon = activity.icon;
          return (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/30 transition-colors"
            >
              <div className={cn('p-2 rounded-lg bg-background/50', activity.color)}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-medium text-foreground">{activity.user}</span>{' '}
                  <span className="text-muted-foreground">{activity.action}</span>
                  {activity.task && (
                    <>
                      {' '}
                      <span className="font-medium text-foreground">"{activity.task}"</span>
                    </>
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}