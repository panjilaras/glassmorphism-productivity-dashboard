"use client";

import React, { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { CheckCircle2, Clock, AlertCircle, UserPlus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Activity {
  id: string;
  type: string;
  user: string;
  action: string;
  task: string;
  time: string;
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = React.useCallback(async () => {
    try {
      // Fetch recent tasks, users, and categories
      const [tasksRes, usersRes, categoriesRes] = await Promise.all([
        fetch('/api/tasks?limit=100'),
        fetch('/api/users?limit=100'),
        fetch('/api/task-categories?limit=100')
      ]);
      
      const tasksData = await tasksRes.json();
      const usersData = await usersRes.json();
      const categoriesData = await categoriesRes.json();
      
      const allActivities: Activity[] = [];
      
      // Build user map for assignee names
      const userMap = new Map(Array.isArray(usersData) ? usersData.map((u: any) => [u.id, u.name]) : []);
      
      // Add task activities
      if (Array.isArray(tasksData)) {
        const taskActivities = tasksData
          .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 4)
          .map((task: any) => {
            let assigneeName = 'System';
            if (task.assigneeIds) {
              const ids = task.assigneeIds.split(',').map((id: string) => parseInt(id.trim())).filter((id: number) => !isNaN(id));
              if (ids.length > 0) {
                assigneeName = userMap.get(ids[0]) || 'Unknown User';
              }
            }
            
            const timeAgo = getTimeAgo(new Date(task.updatedAt));
            
            return {
              id: `task-${task.id}`,
              type: task.status === 'completed' ? 'completed' : 'created',
              user: assigneeName,
              action: task.status === 'completed' ? 'completed task' : 'updated task',
              task: task.title,
              time: timeAgo,
            };
          });
        allActivities.push(...taskActivities);
      }
      
      // Add user activities
      if (Array.isArray(usersData)) {
        const userActivities = usersData
          .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 2)
          .map((user: any) => ({
            id: `user-${user.id}`,
            type: 'user',
            user: user.name,
            action: 'joined the team',
            task: '',
            time: getTimeAgo(new Date(user.updatedAt)),
          }));
        allActivities.push(...userActivities);
      }
      
      // Add category activities
      if (Array.isArray(categoriesData)) {
        const categoryActivities = categoriesData
          .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 2)
          .map((cat: any) => ({
            id: `category-${cat.id}`,
            type: 'created',
            user: 'System',
            action: 'updated category',
            task: cat.name,
            time: getTimeAgo(new Date(cat.updatedAt)),
          }));
        allActivities.push(...categoryActivities);
      }
      
      // Sort all activities by time and take top 8
      const sortedActivities = allActivities
        .sort((a, b) => {
          const timeA = parseTimeAgo(a.time);
          const timeB = parseTimeAgo(b.time);
          return timeA - timeB;
        })
        .slice(0, 8);
      
      setActivities(sortedActivities);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(() => {
      fetchActivities();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchActivities]);

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  const parseTimeAgo = (timeStr: string): number => {
    if (timeStr === 'just now') return 0;
    const match = timeStr.match(/(\d+)\s+(minute|hour|day)/);
    if (match) {
      const value = parseInt(match[1]);
      const unit = match[2];
      if (unit === 'minute') return value;
      if (unit === 'hour') return value * 60;
      if (unit === 'day') return value * 60 * 24;
    }
    return 999999;
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