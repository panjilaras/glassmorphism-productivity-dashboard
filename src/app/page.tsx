"use client";

import React, { useEffect, useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { MetricCard } from '@/components/MetricCard';
import {
  CheckSquare,
  Users,
  TrendingUp,
  Clock,
  Filter,
  X
} from 'lucide-react';
import {
  TaskCompletionChart,
  TeamProductivityChart,
  TaskDistributionChart
} from '@/components/DashboardCharts';
import { RecentActivity } from '@/components/RecentActivity';
import { Calendar } from '@/components/Calendar';
import { TodayTasks } from '@/components/TodayTasks';
import { ChatBot } from '@/components/ChatBot';
import { useSidebar } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Home() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { isOpen: sidebarOpen } = useSidebar();
  const [timePeriod, setTimePeriod] = useState<string>('30days');
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  // Fetch default settings
  useEffect(() => {
    async function fetchDefaultSettings() {
      try {
        const token = localStorage.getItem("bearer_token");
        const response = await fetch('/api/default-settings?key=default_time_filter', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setTimePeriod(data.settingValue || '30days');
        }
      } catch (error) {
        console.error('Failed to fetch default settings:', error);
        // Keep default '30days' if fetch fails
      }
    }
    
    fetchDefaultSettings();
  }, []);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const response = await fetch('/api/dashboard/metrics');
        const data = await response.json();
        setMetrics(data);
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, []);

  const handleClearFilters = () => {
    setTimePeriod('all');
    setDateFrom('');
    setDateTo('');
  };

  const hasActiveFilters = timePeriod !== 'all' || dateFrom || dateTo;

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className={cn(
        "p-3 sm:p-4 md:p-6 lg:p-8 transition-all duration-300",
        sidebarOpen ? "lg:ml-72" : "lg:ml-0"
      )}>
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8">
          {/* Header */}
          <div className="mb-4 sm:mb-5 md:mb-6 lg:mb-8 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-2 sm:mb-2.5 md:mb-3 tracking-tight bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Dashboard</h1>
              <p className="text-sm sm:text-base md:text-base lg:text-lg text-muted-foreground font-medium">Welcome back! Here's your productivity overview.</p>
            </div>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className={cn("glass-card", hasActiveFilters && "border-primary")}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {hasActiveFilters && <span className="ml-2 w-2 h-2 rounded-full bg-primary" />}
            </Button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Filter Options</h3>
                {hasActiveFilters && (
                  <Button
                    onClick={handleClearFilters}
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Time Period</label>
                  <Select value={timePeriod} onValueChange={setTimePeriod}>
                    <SelectTrigger className="glass-card">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent className="glass-dropdown">
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="30days">Last 30 Days</SelectItem>
                      <SelectItem value="90days">Last 90 Days</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {timePeriod === 'custom' && (
                  <>
                    <div>
                      <label className="text-sm font-medium mb-2 block">From Date</label>
                      <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="w-full px-3 py-2 glass-card rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">To Date</label>
                      <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="w-full px-3 py-2 glass-card rounded-lg text-sm"
                      />
                    </div>
                  </>
                )}
              </div>

              {hasActiveFilters && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Showing data for: {timePeriod === '30days' ? 'Last 30 days' : timePeriod === '90days' ? 'Last 90 days' : timePeriod === 'custom' ? 'Custom range' : 'All time'}
                  </p>
                </div>
              )}
            </GlassCard>
          )}

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            {loading ?
            <>
                <MetricCard title="Total Tasks" value="..." icon={CheckSquare} change="Loading..." changeType="positive" gradient={1} />
                <MetricCard title="Active Users" value="..." icon={Users} change="Loading..." changeType="positive" gradient={2} />
                <MetricCard title="Completion Rate" value="..." icon={TrendingUp} change="Loading..." changeType="positive" gradient={3} />
                <MetricCard title="Avg. Time/Task" value="..." icon={Clock} change="Loading..." changeType="positive" gradient={4} />
              </> :
            metrics ?
            <>
                <MetricCard
                title="Total Tasks"
                value={metrics.totalTasks}
                icon={CheckSquare}
                change={metrics.activeTasks > 0 ? `${metrics.activeTasks} active` : "No active tasks"}
                changeType="positive"
                gradient={1} />

                <MetricCard
                title="Active Users"
                value={metrics.activeUsers}
                icon={Users}
                change={metrics.activeUsers > 0 ? "Team members" : "No users yet"}
                changeType="positive"
                gradient={2} />

                <MetricCard
                title="Completion Rate"
                value={`${metrics.completionRate}%`}
                icon={TrendingUp}
                change={metrics.completedTasks > 0 ? `${metrics.completedTasks} completed` : "No completed tasks"}
                changeType="positive"
                gradient={3} />

                <MetricCard
                title="Avg. Time/Task"
                value={metrics.avgTimePerTask}
                icon={Clock}
                change={metrics.totalPoints > 0 ? `${metrics.totalPoints} total points` : "No data yet"}
                changeType="positive"
                gradient={4} />

              </> :

            <>
                <MetricCard title="Total Tasks" value={0} icon={CheckSquare} change="No data yet" changeType="positive" gradient={1} />
                <MetricCard title="Active Users" value={0} icon={Users} change="No data yet" changeType="positive" gradient={2} />
                <MetricCard title="Completion Rate" value="0%" icon={TrendingUp} change="No data yet" changeType="positive" gradient={3} />
                <MetricCard title="Avg. Time/Task" value="0h" icon={Clock} change="No data yet" changeType="positive" gradient={4} />
              </>
            }
          </div>

          {/* Today Tasks Section with Calendar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            <div className="lg:col-span-2">
              <TodayTasks />
            </div>
            <Calendar />
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            <TaskCompletionChart timePeriod={timePeriod} dateFrom={dateFrom} dateTo={dateTo} />
            <TeamProductivityChart timePeriod={timePeriod} dateFrom={dateFrom} dateTo={dateTo} />
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            <TaskDistributionChart timePeriod={timePeriod} dateFrom={dateFrom} dateTo={dateTo} />
            <RecentActivity />
          </div>
        </div>
      </main>

      {/* AI ChatBot */}
      <ChatBot />
    </div>
  );
}