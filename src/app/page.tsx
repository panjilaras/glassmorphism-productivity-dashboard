"use client";

import React from 'react';
import { Navigation } from '@/components/Navigation';
import { MetricCard } from '@/components/MetricCard';
import { 
  CheckSquare, 
  Users, 
  TrendingUp, 
  Clock 
} from 'lucide-react';
import { 
  TaskCompletionChart, 
  TeamProductivityChart, 
  TaskDistributionChart 
} from '@/components/DashboardCharts';
import { RecentActivity } from '@/components/RecentActivity';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="lg:ml-72 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's your productivity overview.</p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Tasks"
              value={0}
              icon={CheckSquare}
              change="No data yet"
              changeType="positive"
              gradient={1}
            />
            <MetricCard
              title="Active Users"
              value={0}
              icon={Users}
              change="No data yet"
              changeType="positive"
              gradient={2}
            />
            <MetricCard
              title="Completion Rate"
              value="0%"
              icon={TrendingUp}
              change="No data yet"
              changeType="positive"
              gradient={3}
            />
            <MetricCard
              title="Avg. Time/Task"
              value="0h"
              icon={Clock}
              change="No data yet"
              changeType="positive"
              gradient={4}
            />
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TaskCompletionChart />
            <TeamProductivityChart />
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TaskDistributionChart />
            <RecentActivity />
          </div>
        </div>
      </main>
    </div>
  );
}