"use client";

import React from 'react';
import { Navigation } from '@/components/Navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import { Download, Calendar, TrendingUp, Users, Clock, CheckCircle2 } from 'lucide-react';
import { MetricCard } from '@/components/MetricCard';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'bottom' as const,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
};

export default function ReportsPage() {
  const [dateRange, setDateRange] = React.useState('7days');
  const [reportType, setReportType] = React.useState('overview');
  const [categoryFilter, setCategoryFilter] = React.useState('all');

  // Productivity Trend Data - now showing task points over time
  const productivityData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
    datasets: [
      {
        label: 'Total Points Completed',
        data: [0, 0, 0, 0, 0, 0],
        borderColor: 'rgb(168, 135, 255)',
        backgroundColor: 'rgba(168, 135, 255, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Average Points per Task',
        data: [0, 0, 0, 0, 0, 0],
        borderColor: 'rgb(135, 206, 250)',
        backgroundColor: 'rgba(135, 206, 250, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Task Category Completion Data - using soft pastel colors
  const categoryData = {
    labels: ['UAT', 'Datafix', 'Training', 'Task Force', 'Other'],
    datasets: [
      {
        label: 'Tasks Completed',
        data: [0, 0, 0, 0, 0],
        backgroundColor: [
          'rgba(230, 230, 250, 0.7)',
          'rgba(173, 216, 230, 0.7)',
          'rgba(255, 182, 193, 0.7)',
          'rgba(255, 218, 185, 0.7)',
          'rgba(221, 160, 221, 0.7)',
        ],
        borderColor: [
          'rgb(230, 230, 250)',
          'rgb(173, 216, 230)',
          'rgb(255, 182, 193)',
          'rgb(255, 218, 185)',
          'rgb(221, 160, 221)',
        ],
        borderWidth: 2,
      },
    ],
  };

  // Task Category Points Data
  const categoryPointsData = {
    labels: ['UAT', 'Datafix', 'Training', 'Task Force', 'Other'],
    datasets: [
      {
        label: 'Total Points by Category',
        data: [0, 0, 0, 0, 0],
        backgroundColor: [
          'rgba(230, 230, 250, 0.7)',
          'rgba(173, 216, 230, 0.7)',
          'rgba(255, 182, 193, 0.7)',
          'rgba(255, 218, 185, 0.7)',
          'rgba(221, 160, 221, 0.7)',
        ],
        borderColor: [
          'rgb(230, 230, 250)',
          'rgb(173, 216, 230)',
          'rgb(255, 182, 193)',
          'rgb(255, 218, 185)',
          'rgb(221, 160, 221)',
        ],
        borderWidth: 2,
      },
    ],
  };

  // Priority Distribution
  const priorityData = {
    labels: ['Low', 'Medium', 'High', 'Urgent'],
    datasets: [
      {
        data: [0, 0, 0, 0],
        backgroundColor: [
          'rgba(135, 206, 250, 0.7)',
          'rgba(255, 218, 185, 0.7)',
          'rgba(255, 182, 193, 0.7)',
          'rgba(220, 53, 69, 0.7)',
        ],
        borderColor: [
          'rgb(135, 206, 250)',
          'rgb(255, 218, 185)',
          'rgb(255, 182, 193)',
          'rgb(220, 53, 69)',
        ],
        borderWidth: 2,
      },
    ],
  };

  // Performance Radar
  const performanceData = {
    labels: ['Task Completion', 'On-Time Delivery', 'Quality Score', 'Collaboration', 'Points Average', 'Efficiency'],
    datasets: [
      {
        label: 'Current Period',
        data: [0, 0, 0, 0, 0, 0],
        backgroundColor: 'rgba(168, 135, 255, 0.2)',
        borderColor: 'rgb(168, 135, 255)',
        borderWidth: 2,
      },
      {
        label: 'Previous Period',
        data: [0, 0, 0, 0, 0, 0],
        backgroundColor: 'rgba(135, 206, 250, 0.2)',
        borderColor: 'rgb(135, 206, 250)',
        borderWidth: 2,
      },
    ],
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
        },
      },
    },
  };

  const handleExport = (format: string) => {
    // Simulate export functionality
    const reportData = {
      dateRange,
      reportType,
      categoryFilter,
      metrics: {
        totalTasks: 0,
        completedTasks: 0,
        totalPoints: 0,
        activeUsers: 0,
        avgCompletionTime: '0h',
        categories: {
          UAT: { tasks: 0, points: 0 },
          Datafix: { tasks: 0, points: 0 },
          Training: { tasks: 0, points: 0 },
          'Task Force': { tasks: 0, points: 0 },
          Other: { tasks: 0, points: 0 },
        },
      },
      timestamp: new Date().toISOString(),
    };

    const dataStr = format === 'json' 
      ? JSON.stringify(reportData, null, 2)
      : `Report Generated: ${new Date().toLocaleString()}\nDate Range: ${dateRange}\nReport Type: ${reportType}\nCategory Filter: ${categoryFilter}\n\nMetrics:\n- Total Tasks: 0\n- Completed: 0\n- Total Points: 0\n- Active Users: 0\n- Avg Time: 0h\n\nCategory Breakdown:\n- UAT: 0 tasks, 0 points\n- Datafix: 0 tasks, 0 points\n- Training: 0 tasks, 0 points\n- Task Force: 0 tasks, 0 points\n- Other: 0 tasks, 0 points`;

    const blob = new Blob([dataStr], { type: format === 'json' ? 'application/json' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `productivity-report-${Date.now()}.${format === 'json' ? 'json' : 'txt'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="lg:ml-72 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Reports & Analytics</h1>
              <p className="text-muted-foreground">Comprehensive insights with assignee rankings by total points earned</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => handleExport('json')} variant="outline" className="glass-card">
                <Download className="w-4 h-4 mr-2" />
                Export JSON
              </Button>
              <Button onClick={() => handleExport('csv')} className="shadow-lg">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Filters */}
          <GlassCard>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="reportType" className="mb-2 block">Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger className="glass-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card">
                    <SelectItem value="overview">Overview</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="productivity">Productivity</SelectItem>
                    <SelectItem value="category">Category Analysis</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <Label htmlFor="categoryFilter" className="mb-2 block">Task Category</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="glass-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card">
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="UAT">UAT</SelectItem>
                    <SelectItem value="Datafix">Datafix</SelectItem>
                    <SelectItem value="Training">Training</SelectItem>
                    <SelectItem value="Task Force">Task Force</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <Label htmlFor="dateRange" className="mb-2 block">Date Range</Label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="glass-card">
                    <Calendar className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card">
                    <SelectItem value="7days">Last 7 Days</SelectItem>
                    <SelectItem value="30days">Last 30 Days</SelectItem>
                    <SelectItem value="90days">Last 90 Days</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 lg:flex-none">
                <Label htmlFor="customDate" className="mb-2 block">Custom Range</Label>
                <Input type="date" className="glass-card" />
              </div>
            </div>
          </GlassCard>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Tasks"
              value={0}
              icon={CheckCircle2}
              change="No data yet"
              changeType="positive"
              gradient={1}
            />
            <MetricCard
              title="Total Points"
              value="0"
              icon={TrendingUp}
              change="No data yet"
              changeType="positive"
              gradient={2}
            />
            <MetricCard
              title="Team Members"
              value={0}
              icon={Users}
              change="No data yet"
              changeType="positive"
              gradient={3}
            />
            <MetricCard
              title="Avg Points/Task"
              value="0"
              icon={Clock}
              change="No data yet"
              changeType="positive"
              gradient={4}
            />
          </div>

          {/* Charts Grid - Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GlassCard className="h-[400px]">
              <h3 className="text-lg font-semibold mb-4">Productivity Trend (Points & Tasks)</h3>
              <div className="h-[320px]">
                <Line data={productivityData} options={chartOptions} />
              </div>
            </GlassCard>

            <GlassCard className="h-[400px]">
              <h3 className="text-lg font-semibold mb-4">Tasks by Category</h3>
              <div className="h-[320px]">
                <Bar data={categoryData} options={chartOptions} />
              </div>
            </GlassCard>
          </div>

          {/* Charts Grid - Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GlassCard className="h-[400px]">
              <h3 className="text-lg font-semibold mb-4">Points Distribution by Category</h3>
              <div className="h-[320px]">
                <Bar data={categoryPointsData} options={chartOptions} />
              </div>
            </GlassCard>

            <GlassCard className="h-[400px]">
              <h3 className="text-lg font-semibold mb-4">Task Priority Distribution</h3>
              <div className="h-[320px] flex items-center justify-center">
                <Doughnut 
                  data={priorityData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: true,
                        position: 'bottom' as const,
                      },
                    },
                  }} 
                />
              </div>
            </GlassCard>
          </div>

          {/* Performance Radar */}
          <GlassCard className="h-[400px]">
            <h3 className="text-lg font-semibold mb-4">Performance Metrics Comparison</h3>
            <div className="h-[320px]">
              <Radar data={performanceData} options={radarOptions} />
            </div>
          </GlassCard>

          {/* Summary Table */}
          <GlassCard>
            <h3 className="text-lg font-semibold mb-4">Category Performance Summary</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">Category</th>
                    <th className="text-right py-3 px-4 font-semibold">Tasks</th>
                    <th className="text-right py-3 px-4 font-semibold">Points</th>
                    <th className="text-right py-3 px-4 font-semibold">Avg Points</th>
                    <th className="text-right py-3 px-4 font-semibold">Completion Rate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border hover:bg-accent/20">
                    <td className="py-3 px-4 flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#E6E6FA' }} />
                      UAT
                    </td>
                    <td className="text-right py-3 px-4 font-medium">0</td>
                    <td className="text-right py-3 px-4 font-medium">0</td>
                    <td className="text-right py-3 px-4 text-muted-foreground">0</td>
                    <td className="text-right py-3 px-4 text-green-600 dark:text-green-400">0%</td>
                  </tr>
                  <tr className="border-b border-border hover:bg-accent/20">
                    <td className="py-3 px-4 flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ADD8E6' }} />
                      Datafix
                    </td>
                    <td className="text-right py-3 px-4 font-medium">0</td>
                    <td className="text-right py-3 px-4 font-medium">0</td>
                    <td className="text-right py-3 px-4 text-muted-foreground">0</td>
                    <td className="text-right py-3 px-4 text-green-600 dark:text-green-400">0%</td>
                  </tr>
                  <tr className="border-b border-border hover:bg-accent/20">
                    <td className="py-3 px-4 flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FFB6C1' }} />
                      Training
                    </td>
                    <td className="text-right py-3 px-4 font-medium">0</td>
                    <td className="text-right py-3 px-4 font-medium">0</td>
                    <td className="text-right py-3 px-4 text-muted-foreground">0</td>
                    <td className="text-right py-3 px-4 text-green-600 dark:text-green-400">0%</td>
                  </tr>
                  <tr className="border-b border-border hover:bg-accent/20">
                    <td className="py-3 px-4 flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FFDAB9' }} />
                      Task Force
                    </td>
                    <td className="text-right py-3 px-4 font-medium">0</td>
                    <td className="text-right py-3 px-4 font-medium">0</td>
                    <td className="text-right py-3 px-4 text-muted-foreground">0</td>
                    <td className="text-right py-3 px-4 text-green-600 dark:text-green-400">0%</td>
                  </tr>
                  <tr className="hover:bg-accent/20">
                    <td className="py-3 px-4 flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#DDA0DD' }} />
                      Other
                    </td>
                    <td className="text-right py-3 px-4 font-medium">0</td>
                    <td className="text-right py-3 px-4 font-medium">0</td>
                    <td className="text-right py-3 px-4 text-muted-foreground">0</td>
                    <td className="text-right py-3 px-4 text-green-600 dark:text-green-400">0%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </GlassCard>

          {/* Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard gradient={1}>
              <h3 className="text-lg font-semibold mb-2">🎯 Start Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Begin adding tasks with categories and points to see performance insights and category analytics here.
              </p>
            </GlassCard>
            <GlassCard gradient={2}>
              <h3 className="text-lg font-semibold mb-2">📈 Points System</h3>
              <p className="text-sm text-muted-foreground">
                All assignees receive full points for completed tasks with multiple assignees. Rankings show total accumulated points.
              </p>
            </GlassCard>
            <GlassCard gradient={3}>
              <h3 className="text-lg font-semibold mb-2">✨ Real-Time Data</h3>
              <p className="text-sm text-muted-foreground">
                Your charts and analytics will automatically update as you create and complete tasks in the system.
              </p>
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  );
}