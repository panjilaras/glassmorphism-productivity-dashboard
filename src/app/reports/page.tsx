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
import { Download, Calendar, TrendingUp, Users, Clock, CheckCircle2, RefreshCw, FileSpreadsheet, FileText } from 'lucide-react';
import { MetricCard } from '@/components/MetricCard';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [analyticsData, setAnalyticsData] = React.useState<any>(null);
  const [metricsData, setMetricsData] = React.useState<any>(null);

  // Fetch analytics data
  const fetchAnalytics = React.useCallback(async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true);
      else setLoading(true);
      
      const [analyticsRes, metricsRes] = await Promise.all([
        fetch('/api/reports/analytics'),
        fetch('/api/dashboard/metrics')
      ]);
      
      const analytics = await analyticsRes.json();
      const metrics = await metricsRes.json();
      
      setAnalyticsData(analytics);
      setMetricsData(metrics);
      
      if (showToast) {
        toast.success('Data refreshed successfully');
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    fetchAnalytics();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(() => {
      fetchAnalytics();
    }, 60000);
    
    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  const handleRefresh = () => {
    fetchAnalytics(true);
  };

  const handleExportExcel = () => {
    try {
      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // Summary sheet
      const summaryData = [
        ['Productivity Management System Report'],
        ['Generated:', new Date().toLocaleString()],
        ['Date Range:', dateRange],
        [''],
        ['Key Metrics'],
        ['Total Tasks', metricsData.totalTasks],
        ['Completed Tasks', metricsData.completedTasks],
        ['Completion Rate', `${metricsData.completionRate}%`],
        ['Total Points', metricsData.totalPoints],
        ['Active Users', metricsData.activeUsers],
        ['Avg Time/Task', metricsData.avgTimePerTask],
      ];
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');
      
      // Category breakdown sheet
      const categoryData = [
        ['Category', 'Tasks', 'Total Points', 'Avg Points', 'Completion Rate'],
        ...analyticsData.categoryBreakdown.map((c: any) => [
          c.name,
          c.taskCount,
          c.totalPoints,
          c.avgPoints,
          `${c.completionRate}%`
        ])
      ];
      const categorySheet = XLSX.utils.aoa_to_sheet(categoryData);
      XLSX.utils.book_append_sheet(wb, categorySheet, 'Categories');
      
      // Priority distribution sheet
      const priorityData = [
        ['Priority', 'Task Count'],
        ['Low', analyticsData.priorityDistribution.low],
        ['Medium', analyticsData.priorityDistribution.medium],
        ['High', analyticsData.priorityDistribution.high],
        ['Urgent', analyticsData.priorityDistribution.urgent],
      ];
      const prioritySheet = XLSX.utils.aoa_to_sheet(priorityData);
      XLSX.utils.book_append_sheet(wb, prioritySheet, 'Priority Distribution');
      
      // Write file
      XLSX.writeFile(wb, `productivity-report-${Date.now()}.xlsx`);
      toast.success('Excel report exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export Excel report');
    }
  };

  const handleExportCSV = () => {
    try {
      let csvContent = 'Productivity Management System Report\n';
      csvContent += `Generated:,${new Date().toLocaleString()}\n`;
      csvContent += `Date Range:,${dateRange}\n\n`;
      
      csvContent += 'Key Metrics\n';
      csvContent += `Total Tasks,${metricsData.totalTasks}\n`;
      csvContent += `Completed Tasks,${metricsData.completedTasks}\n`;
      csvContent += `Completion Rate,${metricsData.completionRate}%\n`;
      csvContent += `Total Points,${metricsData.totalPoints}\n`;
      csvContent += `Active Users,${metricsData.activeUsers}\n`;
      csvContent += `Avg Time/Task,${metricsData.avgTimePerTask}\n\n`;
      
      csvContent += 'Category Breakdown\n';
      csvContent += 'Category,Tasks,Total Points,Avg Points,Completion Rate\n';
      analyticsData.categoryBreakdown.forEach((c: any) => {
        csvContent += `${c.name},${c.taskCount},${c.totalPoints},${c.avgPoints},${c.completionRate}%\n`;
      });
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `productivity-report-${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('CSV report exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export CSV report');
    }
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(20);
      doc.text('Productivity Management System', 14, 20);
      doc.setFontSize(12);
      doc.text(`Report Generated: ${new Date().toLocaleString()}`, 14, 28);
      doc.text(`Date Range: ${dateRange}`, 14, 34);
      
      // Key Metrics
      doc.setFontSize(16);
      doc.text('Key Metrics', 14, 46);
      
      autoTable(doc, {
        startY: 50,
        head: [['Metric', 'Value']],
        body: [
          ['Total Tasks', metricsData.totalTasks],
          ['Completed Tasks', metricsData.completedTasks],
          ['Completion Rate', `${metricsData.completionRate}%`],
          ['Total Points', metricsData.totalPoints],
          ['Active Users', metricsData.activeUsers],
          ['Avg Time/Task', metricsData.avgTimePerTask],
        ],
      });
      
      // Category Breakdown
      doc.setFontSize(16);
      doc.text('Category Performance', 14, (doc as any).lastAutoTable.finalY + 10);
      
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 15,
        head: [['Category', 'Tasks', 'Total Points', 'Avg Points', 'Completion Rate']],
        body: analyticsData.categoryBreakdown.map((c: any) => [
          c.name,
          c.taskCount,
          c.totalPoints,
          c.avgPoints,
          `${c.completionRate}%`
        ]),
      });
      
      // Priority Distribution
      doc.setFontSize(16);
      doc.text('Priority Distribution', 14, (doc as any).lastAutoTable.finalY + 10);
      
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 15,
        head: [['Priority', 'Task Count']],
        body: [
          ['Low', analyticsData.priorityDistribution.low],
          ['Medium', analyticsData.priorityDistribution.medium],
          ['High', analyticsData.priorityDistribution.high],
          ['Urgent', analyticsData.priorityDistribution.urgent],
        ],
      });
      
      // Save
      doc.save(`productivity-report-${Date.now()}.pdf`);
      toast.success('PDF report exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export PDF report');
    }
  };

  if (loading || !analyticsData || !metricsData) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="lg:ml-72 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <p className="text-center text-muted-foreground py-12">Loading analytics...</p>
          </div>
        </main>
      </div>
    );
  }

  // Productivity Trend Data
  const productivityData = {
    labels: analyticsData.productivityTrend.labels,
    datasets: [
      {
        label: 'Total Points Completed',
        data: analyticsData.productivityTrend.totalPointsCompleted,
        borderColor: 'rgb(168, 135, 255)',
        backgroundColor: 'rgba(168, 135, 255, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Average Points per Task',
        data: analyticsData.productivityTrend.avgPointsPerTask,
        borderColor: 'rgb(135, 206, 250)',
        backgroundColor: 'rgba(135, 206, 250, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Task Category Completion Data
  const categoryData = {
    labels: analyticsData.categoryBreakdown.map((c: any) => c.name),
    datasets: [
      {
        label: 'Tasks Completed',
        data: analyticsData.categoryBreakdown.map((c: any) => c.taskCount),
        backgroundColor: analyticsData.categoryBreakdown.map((c: any) => c.color + 'bb'),
        borderColor: analyticsData.categoryBreakdown.map((c: any) => c.color),
        borderWidth: 2,
      },
    ],
  };

  // Task Category Points Data
  const categoryPointsData = {
    labels: analyticsData.categoryBreakdown.map((c: any) => c.name),
    datasets: [
      {
        label: 'Total Points by Category',
        data: analyticsData.categoryBreakdown.map((c: any) => c.totalPoints),
        backgroundColor: analyticsData.categoryBreakdown.map((c: any) => c.color + 'bb'),
        borderColor: analyticsData.categoryBreakdown.map((c: any) => c.color),
        borderWidth: 2,
      },
    ],
  };

  // Priority Distribution
  const priorityData = {
    labels: ['Low', 'Medium', 'High', 'Urgent'],
    datasets: [
      {
        data: [
          analyticsData.priorityDistribution.low,
          analyticsData.priorityDistribution.medium,
          analyticsData.priorityDistribution.high,
          analyticsData.priorityDistribution.urgent,
        ],
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
        data: [
          analyticsData.performanceMetrics.taskCompletion,
          analyticsData.performanceMetrics.onTimeDelivery,
          analyticsData.performanceMetrics.qualityScore,
          analyticsData.performanceMetrics.collaboration,
          analyticsData.performanceMetrics.pointsAverage * 10,
          analyticsData.performanceMetrics.efficiency,
        ],
        backgroundColor: 'rgba(168, 135, 255, 0.2)',
        borderColor: 'rgb(168, 135, 255)',
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

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="lg:ml-72 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Reports & Analytics</h1>
              <p className="text-muted-foreground">Comprehensive insights with real-time data</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button 
                onClick={handleRefresh} 
                variant="outline" 
                className="glass-card"
                disabled={refreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={handleExportExcel} variant="outline" className="glass-card">
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Excel
              </Button>
              <Button onClick={handleExportCSV} variant="outline" className="glass-card">
                <FileText className="w-4 h-4 mr-2" />
                CSV
              </Button>
              <Button onClick={handleExportPDF} className="shadow-lg">
                <Download className="w-4 h-4 mr-2" />
                PDF
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
                    {analyticsData.categoryBreakdown.map((cat: any) => (
                      <SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>
                    ))}
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
              value={metricsData.totalTasks}
              icon={CheckCircle2}
              change={`${metricsData.completionRate}% complete`}
              changeType="positive"
              gradient={1}
            />
            <MetricCard
              title="Total Points"
              value={metricsData.totalPoints}
              icon={TrendingUp}
              change={`${metricsData.completedTasks} completed`}
              changeType="positive"
              gradient={2}
            />
            <MetricCard
              title="Team Members"
              value={metricsData.activeUsers}
              icon={Users}
              change="Active contributors"
              changeType="positive"
              gradient={3}
            />
            <MetricCard
              title="Avg Time/Task"
              value={metricsData.avgTimePerTask}
              icon={Clock}
              change="Efficiency metric"
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
                  {analyticsData.categoryBreakdown.map((category: any) => (
                    <tr key={category.name} className="border-b border-border hover:bg-accent/20">
                      <td className="py-3 px-4 flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: category.color }} />
                        {category.name}
                      </td>
                      <td className="text-right py-3 px-4 font-medium">{category.taskCount}</td>
                      <td className="text-right py-3 px-4 font-medium">{category.totalPoints}</td>
                      <td className="text-right py-3 px-4 text-muted-foreground">{category.avgPoints}</td>
                      <td className="text-right py-3 px-4 text-green-600 dark:text-green-400">{category.completionRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>

          {/* Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard gradient={1}>
              <h3 className="text-lg font-semibold mb-2">🎯 Real-Time Analytics</h3>
              <p className="text-sm text-muted-foreground">
                All data updates automatically as you create, complete, and manage tasks in the system.
              </p>
            </GlassCard>
            <GlassCard gradient={2}>
              <h3 className="text-lg font-semibold mb-2">📊 Export Options</h3>
              <p className="text-sm text-muted-foreground">
                Export comprehensive reports in Excel, CSV, or PDF format with all metrics and category breakdowns.
              </p>
            </GlassCard>
            <GlassCard gradient={3}>
              <h3 className="text-lg font-semibold mb-2">✨ Performance Insights</h3>
              <p className="text-sm text-muted-foreground">
                Track completion rates (excluding cancelled tasks), on-time delivery, and efficiency metrics.
              </p>
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  );
}