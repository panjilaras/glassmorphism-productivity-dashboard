"use client";

import React, { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { CheckCircle2, Clock, AlertCircle, UserPlus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Activity {
  id: number;
  type: string;
  user: string;
  action: string;
  task: string;
  time: string;
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivities() {
      try {
        // Fetch recent tasks to build activity feed
        const tasksRes = await fetch('/api/tasks');
        const tasksData = await tasksRes.json();
        
        if (tasksData.success && Array.isArray(tasksData.data)) {
          // Convert tasks to activities
          const taskActivities = tasksData.data
            .sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
            .slice(0, 6)
            .map((task: any, index: number) => {
              const assignee = Array.isArray(task.assignees) && task.assignees.length > 0 
                ? task.assignees[0] 
                : 'Unknown';
              
              const timeAgo = getTimeAgo(new Date(task.updated_at));
              
              return {
                id: task.id,
                type: task.status === 'completed' ? 'completed' : 'created',
                user: assignee,
                action: task.status === 'completed' ? 'completed task' : 'working on',
                task: task.title,
                time: timeAgo,
              };
            });
          
          setActivities(taskActivities);
        }
      } catch (error) {
        console.error('Failed to fetch activities:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchActivities();
  }, []);

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'completed': return { Icon: CheckCircle2, color: 'text-green-500' };
      case 'created': return { Icon: Clock, color: 'text-blue-500' };
      case 'alert': return { Icon: AlertCircle, color: 'text-orange-500' };
      case 'user': return { Icon: UserPlus, color: 'text-purple-500' };
      default: return { Icon: Clock, color: 'text-blue-500' };
    }
  };

  return (
    <GlassCard className="h-[400px] overflow-hidden flex flex-col">
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : activities.length > 0 ? (
          activities.map((activity) => {
            const { Icon, color } = getActivityIcon(activity.type);
            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/30 transition-colors"
              >
                <div className={cn('p-2 rounded-lg bg-background/50', color)}>
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
          })
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No recent activity</p>
          </div>
        )}
      </div>
    </GlassCard>
  );
}