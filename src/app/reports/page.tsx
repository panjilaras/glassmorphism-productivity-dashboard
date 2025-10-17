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
        data: [145, 162, 178, 198, 215, 235],
        borderColor: 'rgb(168, 135, 255)',
        backgroundColor: 'rgba(168, 135, 255, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Average Points per Task',
        data: [6.5, 7.2, 7.8, 8.2, 8.5, 9.2],
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
        data: [42, 58, 28, 35, 22],
        backgroundColor: [
          'rgba(230, 230, 250, 0.7)', // Lavender
          'rgba(173, 216, 230, 0.7)', // Light Blue
          'rgba(255, 182, 193, 0.7)', // Light Pink
          'rgba(255, 218, 185, 0.7)', // Peach
          'rgba(221, 160, 221, 0.7)', // Plum
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
        data: [336, 464, 140, 280, 110],
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
        data: [45, 85, 55, 15],
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
        data: [92, 88, 95, 85, 90, 90],
        backgroundColor: 'rgba(168, 135, 255, 0.2)',
        borderColor: 'rgb(168, 135, 255)',
        borderWidth: 2,
      },
      {
        label: 'Previous Period',
        data: [85, 82, 88, 80, 82, 85],
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
        totalTasks: 200,
        completedTasks: 185,
        totalPoints: 1330,
        activeUsers: 48,
        avgCompletionTime: '4.2h',
        categories: {
          UAT: { tasks: 42, points: 336 },
          Datafix: { tasks: 58, points: 464 },
          Training: { tasks: 28, points: 140 },
          'Task Force': { tasks: 35, points: 280 },
          Other: { tasks: 22, points: 110 },
        },
      },
      timestamp: new Date().toISOString(),
    };

    const dataStr = format === 'json' 
      ? JSON.stringify(reportData, null, 2)
      : `Report Generated: ${new Date().toLocaleString()}\nDate Range: ${dateRange}\nReport Type: ${reportType}\nCategory Filter: ${categoryFilter}\n\nMetrics:\n- Total Tasks: 200\n- Completed: 185\n- Total Points: 1330\n- Active Users: 48\n- Avg Time: 4.2h\n\nCategory Breakdown:\n- UAT: 42 tasks, 336 points\n- Datafix: 58 tasks, 464 points\n- Training: 28 tasks, 140 points\n- Task Force: 35 tasks, 280 points\n- Other: 22 tasks, 110 points`;

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
              value={200}
              icon={CheckCircle2}
              change="+15% vs last period"
              changeType="positive"
              gradient={1}
            />
            <MetricCard
              title="Total Points"
              value="1,330"
              icon={TrendingUp}
              change="+18.5% improvement"
              changeType="positive"
              gradient={2}
            />
            <MetricCard
              title="Team Members"
              value={48}
              icon={Users}
              change="+6 new members"
              changeType="positive"
              gradient={3}
            />
            <MetricCard
              title="Avg Points/Task"
              value="6.7"
              icon={Clock}
              change="+0.8 increase"
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
                    <td className="text-right py-3 px-4 font-medium">42</td>
                    <td className="text-right py-3 px-4 font-medium">336</td>
                    <td className="text-right py-3 px-4 text-muted-foreground">8.0</td>
                    <td className="text-right py-3 px-4 text-green-600 dark:text-green-400">92%</td>
                  </tr>
                  <tr className="border-b border-border hover:bg-accent/20">
                    <td className="py-3 px-4 flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ADD8E6' }} />
                      Datafix
                    </td>
                    <td className="text-right py-3 px-4 font-medium">58</td>
                    <td className="text-right py-3 px-4 font-medium">464</td>
                    <td className="text-right py-3 px-4 text-muted-foreground">8.0</td>
                    <td className="text-right py-3 px-4 text-green-600 dark:text-green-400">89%</td>
                  </tr>
                  <tr className="border-b border-border hover:bg-accent/20">
                    <td className="py-3 px-4 flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FFB6C1' }} />
                      Training
                    </td>
                    <td className="text-right py-3 px-4 font-medium">28</td>
                    <td className="text-right py-3 px-4 font-medium">140</td>
                    <td className="text-right py-3 px-4 text-muted-foreground">5.0</td>
                    <td className="text-right py-3 px-4 text-green-600 dark:text-green-400">85%</td>
                  </tr>
                  <tr className="border-b border-border hover:bg-accent/20">
                    <td className="py-3 px-4 flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FFDAB9' }} />
                      Task Force
                    </td>
                    <td className="text-right py-3 px-4 font-medium">35</td>
                    <td className="text-right py-3 px-4 font-medium">280</td>
                    <td className="text-right py-3 px-4 text-muted-foreground">8.0</td>
                    <td className="text-right py-3 px-4 text-green-600 dark:text-green-400">88%</td>
                  </tr>
                  <tr className="hover:bg-accent/20">
                    <td className="py-3 px-4 flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#DDA0DD' }} />
                      Other
                    </td>
                    <td className="text-right py-3 px-4 font-medium">22</td>
                    <td className="text-right py-3 px-4 font-medium">110</td>
                    <td className="text-right py-3 px-4 text-muted-foreground">5.0</td>
                    <td className="text-right py-3 px-4 text-green-600 dark:text-green-400">86%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </GlassCard>

          {/* Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard gradient={1}>
              <h3 className="text-lg font-semibold mb-2">🎯 Top Performing Category</h3>
              <p className="text-sm text-muted-foreground">
                UAT category has the highest completion rate at 92% with an average of 8 points per task. Excellent quality and consistency!
              </p>
            </GlassCard>
            <GlassCard gradient={2}>
              <h3 className="text-lg font-semibold mb-2">📈 Top Assignees</h3>
              <p className="text-sm text-muted-foreground">
                All assignees receive full points for completed tasks with multiple assignees. Rankings show total accumulated points across all tasks.
              </p>
            </GlassCard>
            <GlassCard gradient={3}>
              <h3 className="text-lg font-semibold mb-2">✨ Achievement</h3>
              <p className="text-sm text-muted-foreground">
                Total points completed increased by 18.5% this period. The team is consistently delivering high-value work!
              </p>
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  );
}