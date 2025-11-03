"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { Navigation } from '@/components/Navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Download, FileSpreadsheet, FileText, RefreshCw, Trophy, Target, CheckCircle2, Filter, X, Award } from 'lucide-react';
import { useSidebar } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface Task {
  id: number;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  categoryName: string | null;
  categoryColor: string | null;
  dueDate: string | null;
  points: number;
  assigneeNames: string[];
  creatorName: string | null;
  createdAt: string;
  updatedAt: string;
  totalBonusPoints: number;
}

interface AssigneeStat {
  userId: string;
  userName: string;
  userEmail: string;
  totalPoints: number;
  totalBonusPoints: number;
  grandTotalPoints: number;
  tasksAssigned: number;
  tasksCompleted: number;
  avgPointsPerTask: number;
  completionRate: number;
}

interface ManagerStat {
  managerId: string;
  managerName: string;
  managerEmail: string;
  totalPoints: number;
  totalBonusPoints: number;
  grandTotalPoints: number;
  teamMembersCount: number;
  tasksAssigned: number;
  tasksCompleted: number;
}

interface Manager {
  id: string;
  name: string;
}

interface Category {
  id: number;
  name: string;
}

export default function ComprehensiveReportPage() {
  const { isOpen: sidebarOpen } = useSidebar();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [assigneeStats, setAssigneeStats] = useState<AssigneeStat[]>([]);
  const [managerStats, setManagerStats] = useState<ManagerStat[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Filter states
  const [timePeriod, setTimePeriod] = useState<string>('30days');
  const [selectedManager, setSelectedManager] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch default settings on mount
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

  const fetchData = async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true);
      else setLoading(true);

      const token = localStorage.getItem("bearer_token");
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const [reportRes, managersRes, categoriesRes] = await Promise.all([
        fetch('/api/reports/comprehensive', { headers }),
        fetch('/api/users/hierarchy', { headers }),
        fetch('/api/task-categories', { headers })
      ]);
      
      if (!reportRes.ok) {
        throw new Error('Failed to fetch report data');
      }

      const data = await reportRes.json();
      setTasks(data.tasks);
      setAssigneeStats(data.assigneeStats);
      setManagerStats(data.managerStats || []);

      if (managersRes.ok) {
        const managersData = await managersRes.json();
        const managersList = managersData.filter((u: any) => u.role === 'manager' || u.role === 'admin');
        setManagers(managersList);
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
      }

      if (showToast) {
        toast.success('Report refreshed successfully');
      }
    } catch (error) {
      console.error('Failed to fetch report:', error);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter tasks based on selected filters
  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];
    const now = new Date();

    // Time period filter
    if (timePeriod !== 'all') {
      const cutoffDate = new Date();
      if (timePeriod === '30days') {
        cutoffDate.setDate(now.getDate() - 30);
      } else if (timePeriod === '90days') {
        cutoffDate.setDate(now.getDate() - 90);
      } else if (timePeriod === 'custom' && dateFrom && dateTo) {
        const fromDate = new Date(dateFrom);
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        filtered = filtered.filter(task => {
          const taskDate = new Date(task.createdAt);
          return taskDate >= fromDate && taskDate <= toDate;
        });
        return filtered;
      }

      if (timePeriod !== 'custom') {
        filtered = filtered.filter(task => {
          const taskDate = new Date(task.createdAt);
          return taskDate >= cutoffDate;
        });
      }
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(task => 
        task.categoryName === categories.find(c => c.id.toString() === selectedCategory)?.name
      );
    }

    return filtered;
  }, [tasks, timePeriod, selectedManager, selectedCategory, dateFrom, dateTo, categories]);

  // Recalculate stats based on filtered tasks - now includes bonus points from original stats
  const filteredStats = useMemo(() => {
    const statsMap = new Map<string, {
      userName: string;
      userEmail: string;
      totalPoints: number;
      totalBonusPoints: number;
      tasksAssigned: number;
      tasksCompleted: number;
    }>();

    filteredTasks.forEach(task => {
      task.assigneeNames.forEach(assigneeName => {
        const originalStat = assigneeStats.find(s => s.userName === assigneeName);
        if (originalStat) {
          if (!statsMap.has(assigneeName)) {
            statsMap.set(assigneeName, {
              userName: assigneeName,
              userEmail: originalStat.userEmail,
              totalPoints: 0,
              totalBonusPoints: originalStat.totalBonusPoints,
              tasksAssigned: 0,
              tasksCompleted: 0
            });
          }

          const stat = statsMap.get(assigneeName)!;
          stat.totalPoints += task.points;
          stat.tasksAssigned += 1;
          if (task.status === 'completed') {
            stat.tasksCompleted += 1;
          }
        }
      });
    });

    return Array.from(statsMap.values())
      .map(stat => ({
        userId: stat.userName,
        userName: stat.userName,
        userEmail: stat.userEmail,
        totalPoints: stat.totalPoints,
        totalBonusPoints: stat.totalBonusPoints,
        grandTotalPoints: stat.totalPoints + stat.totalBonusPoints,
        tasksAssigned: stat.tasksAssigned,
        tasksCompleted: stat.tasksCompleted,
        avgPointsPerTask: stat.tasksAssigned > 0 
          ? Math.round((stat.totalPoints / stat.tasksAssigned) * 10) / 10 
          : 0,
        completionRate: stat.tasksAssigned > 0 
          ? Math.round((stat.tasksCompleted / stat.tasksAssigned) * 1000) / 10 
          : 0
      }))
      .sort((a, b) => b.grandTotalPoints - a.grandTotalPoints);
  }, [filteredTasks, assigneeStats]);

  const handleRefresh = () => {
    fetchData(true);
  };

  const handleClearFilters = () => {
    setTimePeriod('all');
    setSelectedManager('all');
    setSelectedCategory('all');
    setDateFrom('');
    setDateTo('');
  };

  const handleExportExcel = () => {
    try {
      const wb = XLSX.utils.book_new();

      // Calculate max number of assignees for column headers
      const maxAssignees = Math.max(...filteredTasks.map(t => t.assigneeNames.length), 1);
      const assigneeHeaders = Array.from({ length: maxAssignees }, (_, i) => `Assignee ${i + 1}`);

      // Tasks sheet with split assignees
      const tasksData = [
        ['Task ID', 'Title', 'Description', 'Category', 'Due Date', ...assigneeHeaders, 'Points', 'Bonus Points', 'Status', 'Priority', 'Creator'],
        ...filteredTasks.map(task => {
          // Create array with assignee names, filling empty slots with empty strings
          const assigneeColumns = Array.from({ length: maxAssignees }, (_, i) => task.assigneeNames[i] || '');

          return [
            task.id,
            task.title,
            task.description || '',
            task.categoryName || 'Uncategorized',
            task.dueDate || '',
            ...assigneeColumns,
            task.points,
            task.totalBonusPoints,
            task.status,
            task.priority,
            task.creatorName || ''
          ];
        })
      ];
      const tasksSheet = XLSX.utils.aoa_to_sheet(tasksData);
      XLSX.utils.book_append_sheet(wb, tasksSheet, 'Tasks');

      // Assignee stats sheet - with bonus points
      const statsData = [
        ['Assignee', 'Email', 'Task Points', 'Bonus Points', 'Grand Total', 'Tasks Assigned', 'Tasks Completed', 'Avg Points/Task', 'Completion Rate'],
        ...filteredStats.map(stat => [
          stat.userName,
          stat.userEmail,
          stat.totalPoints,
          stat.totalBonusPoints,
          stat.grandTotalPoints,
          stat.tasksAssigned,
          stat.tasksCompleted,
          stat.avgPointsPerTask,
          `${stat.completionRate}%`
        ])
      ];
      const statsSheet = XLSX.utils.aoa_to_sheet(statsData);
      XLSX.utils.book_append_sheet(wb, statsSheet, 'Assignee Stats');

      // Manager stats sheet - with bonus points
      const managerData = [
        ['Manager', 'Email', 'Task Points', 'Bonus Points', 'Grand Total', 'Team Members', 'Tasks Assigned', 'Tasks Completed'],
        ...managerStats.map(stat => [
          stat.managerName,
          stat.managerEmail,
          stat.totalPoints,
          stat.totalBonusPoints,
          stat.grandTotalPoints,
          stat.teamMembersCount,
          stat.tasksAssigned,
          stat.tasksCompleted
        ])
      ];
      const managerSheet = XLSX.utils.aoa_to_sheet(managerData);
      XLSX.utils.book_append_sheet(wb, managerSheet, 'Manager Stats');

      XLSX.writeFile(wb, `comprehensive-report-${Date.now()}.xlsx`);
      toast.success('Excel report exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export Excel report');
    }
  };

  const handleExportCSV = () => {
    try {
      let csvContent = 'Comprehensive Task Report\n';
      csvContent += `Generated: ${new Date().toLocaleString()}\n\n`;

      // Calculate max number of assignees
      const maxAssignees = Math.max(...filteredTasks.map(t => t.assigneeNames.length), 1);
      const assigneeHeaders = Array.from({ length: maxAssignees }, (_, i) => `Assignee ${i + 1}`).join(',');

      csvContent += 'TASKS\n';
      csvContent += `Task ID,Title,Description,Category,Due Date,${assigneeHeaders},Points,Bonus Points Allocated,Status,Priority,Creator\n`;
      filteredTasks.forEach(task => {
        const assigneeColumns = Array.from({ length: maxAssignees }, (_, i) => `"${task.assigneeNames[i] || ''}"`).join(',');
        csvContent += `${task.id},"${task.title}","${task.description || ''}","${task.categoryName || 'Uncategorized'}","${task.dueDate || ''}",${assigneeColumns},${task.points},${task.totalBonusPoints},${task.status},${task.priority},"${task.creatorName || ''}"\n`;
      });

      csvContent += '\n\nASSIGNEE STATISTICS\n';
      csvContent += 'Assignee,Email,Task Points,Bonus Points,Grand Total,Tasks Assigned,Tasks Completed,Avg Points/Task,Completion Rate\n';
      filteredStats.forEach(stat => {
        csvContent += `"${stat.userName}","${stat.userEmail}",${stat.totalPoints},${stat.totalBonusPoints},${stat.grandTotalPoints},${stat.tasksAssigned},${stat.tasksCompleted},${stat.avgPointsPerTask},${stat.completionRate}%\n`;
      });

      csvContent += '\n\nMANAGER STATISTICS\n';
      csvContent += 'Manager,Email,Task Points,Bonus Points,Grand Total,Team Members,Tasks Assigned,Tasks Completed\n';
      managerStats.forEach(stat => {
        csvContent += `"${stat.managerName}","${stat.managerEmail}",${stat.totalPoints},${stat.totalBonusPoints},${stat.grandTotalPoints},${stat.teamMembersCount},${stat.tasksAssigned},${stat.tasksCompleted}\n`;
      });

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `comprehensive-report-${Date.now()}.csv`;
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
      doc.text('Comprehensive Task Report', 14, 20);
      doc.setFontSize(12);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);

      // Assignee Statistics
      doc.setFontSize(16);
      doc.text('Assignee Performance', 14, 40);

      autoTable(doc, {
        startY: 45,
        head: [['Assignee', 'Task Pts', 'Bonus', 'Total', 'Tasks', 'Done', 'Avg', 'Rate']],
        body: filteredStats.map(stat => [
          stat.userName,
          stat.totalPoints,
          stat.totalBonusPoints,
          stat.grandTotalPoints,
          stat.tasksAssigned,
          stat.tasksCompleted,
          stat.avgPointsPerTask,
          `${stat.completionRate}%`
        ]),
      });

      // Manager Statistics
      let finalY = (doc as any).lastAutoTable.finalY;
      if (managerStats.length > 0) {
        if (finalY > 200) {
          doc.addPage();
          doc.setFontSize(16);
          doc.text('Manager Performance', 14, 20);
          autoTable(doc, {
            startY: 25,
            head: [['Manager', 'Task Pts', 'Bonus', 'Total', 'Team', 'Tasks', 'Done']],
            body: managerStats.map(stat => [
              stat.managerName,
              stat.totalPoints,
              stat.totalBonusPoints,
              stat.grandTotalPoints,
              stat.teamMembersCount,
              stat.tasksAssigned,
              stat.tasksCompleted
            ]),
          });
          finalY = (doc as any).lastAutoTable.finalY;
        } else {
          doc.setFontSize(16);
          doc.text('Manager Performance', 14, finalY + 10);
          autoTable(doc, {
            startY: finalY + 15,
            head: [['Manager', 'Task Pts', 'Bonus', 'Total', 'Team', 'Tasks', 'Done']],
            body: managerStats.map(stat => [
              stat.managerName,
              stat.totalPoints,
              stat.totalBonusPoints,
              stat.grandTotalPoints,
              stat.teamMembersCount,
              stat.tasksAssigned,
              stat.tasksCompleted
            ]),
          });
          finalY = (doc as any).lastAutoTable.finalY;
        }
      }

      // Tasks (new page if needed) - with split assignees
      const maxAssignees = Math.min(Math.max(...filteredTasks.map(t => t.assigneeNames.length), 1), 3); // Limit to 3 for PDF width
      const assigneeHeaders = Array.from({ length: maxAssignees }, (_, i) => `Assignee ${i + 1}`);
      
      if (finalY > 200) {
        doc.addPage();
        doc.setFontSize(16);
        doc.text('Task Details', 14, 20);
        autoTable(doc, {
          startY: 25,
          head: [['ID', 'Title', 'Category', ...assigneeHeaders, 'Points', 'Status']],
          body: filteredTasks.map(task => {
            const assigneeColumns = Array.from({ length: maxAssignees }, (_, i) => 
              task.assigneeNames[i] ? task.assigneeNames[i].substring(0, 15) : ''
            );
            return [
              task.id,
              task.title.substring(0, 30),
              task.categoryName?.substring(0, 15) || 'N/A',
              ...assigneeColumns,
              task.points,
              task.status
            ];
          }),
        });
      } else {
        doc.setFontSize(16);
        doc.text('Task Details', 14, finalY + 10);
        autoTable(doc, {
          startY: finalY + 15,
          head: [['ID', 'Title', 'Category', ...assigneeHeaders, 'Points', 'Status']],
          body: filteredTasks.map(task => {
            const assigneeColumns = Array.from({ length: maxAssignees }, (_, i) => 
              task.assigneeNames[i] ? task.assigneeNames[i].substring(0, 15) : ''
            );
            return [
              task.id,
              task.title.substring(0, 30),
              task.categoryName?.substring(0, 15) || 'N/A',
              ...assigneeColumns,
              task.points,
              task.status
            ];
          }),
        });
      }

      doc.save(`comprehensive-report-${Date.now()}.pdf`);
      toast.success('PDF report exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export PDF report');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className={cn(
          "p-3 sm:p-4 md:p-6 lg:p-8 transition-all duration-300",
          sidebarOpen ? "lg:ml-72" : "lg:ml-0"
        )}>
          <div className="max-w-7xl mx-auto">
            <p className="text-center text-muted-foreground py-12">Loading comprehensive report...</p>
          </div>
        </main>
      </div>
    );
  }

  // Prepare chart data - using grandTotalPoints
  const topAssignees = filteredStats.slice(0, 10);
  
  const pointsChartData = {
    labels: topAssignees.map(stat => stat.userName),
    datasets: [
      {
        label: 'Task Points',
        data: topAssignees.map(stat => stat.totalPoints),
        backgroundColor: 'rgba(168, 135, 255, 0.7)',
        borderColor: 'rgb(168, 135, 255)',
        borderWidth: 2,
      },
      {
        label: 'Bonus Points',
        data: topAssignees.map(stat => stat.totalBonusPoints),
        backgroundColor: 'rgba(255, 215, 0, 0.7)',
        borderColor: 'rgb(255, 215, 0)',
        borderWidth: 2,
      },
    ],
  };

  const managerPointsChartData = {
    labels: managerStats.map(stat => stat.managerName),
    datasets: [
      {
        label: 'Task Points',
        data: managerStats.map(stat => stat.totalPoints),
        backgroundColor: 'rgba(255, 182, 193, 0.7)',
        borderColor: 'rgb(255, 182, 193)',
        borderWidth: 2,
      },
      {
        label: 'Bonus Points',
        data: managerStats.map(stat => stat.totalBonusPoints),
        backgroundColor: 'rgba(255, 215, 0, 0.7)',
        borderColor: 'rgb(255, 215, 0)',
        borderWidth: 2,
      },
    ],
  };

  const completionChartData = {
    labels: topAssignees.map(stat => stat.userName),
    datasets: [
      {
        label: 'Completion Rate (%)',
        data: topAssignees.map(stat => stat.completionRate),
        backgroundColor: 'rgba(135, 206, 250, 0.7)',
        borderColor: 'rgb(135, 206, 250)',
        borderWidth: 2,
      },
    ],
  };

  const statusDistribution = {
    labels: ['To Do', 'In Progress', 'Completed', 'Cancelled'],
    datasets: [
      {
        data: [
          filteredTasks.filter(t => t.status === 'todo').length,
          filteredTasks.filter(t => t.status === 'inprogress').length,
          filteredTasks.filter(t => t.status === 'completed').length,
          filteredTasks.filter(t => t.status === 'cancelled').length,
        ],
        backgroundColor: [
          'rgba(255, 218, 185, 0.7)',
          'rgba(135, 206, 250, 0.7)',
          'rgba(168, 135, 255, 0.7)',
          'rgba(255, 182, 193, 0.7)',
        ],
        borderColor: [
          'rgb(255, 218, 185)',
          'rgb(135, 206, 250)',
          'rgb(168, 135, 255)',
          'rgb(255, 182, 193)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        beginAtZero: true,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  const hasActiveFilters = timePeriod !== 'all' || selectedManager !== 'all' || selectedCategory !== 'all' || dateFrom || dateTo;

  const totalBonusPoints = filteredStats.reduce((sum, stat) => sum + stat.totalBonusPoints, 0);
  const totalTaskPoints = filteredTasks.reduce((sum, t) => sum + t.points, 0);

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className={cn(
        "p-3 sm:p-4 md:p-6 lg:p-8 transition-all duration-300",
        sidebarOpen ? "lg:ml-72" : "lg:ml-0"
      )}>
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Comprehensive Report</h1>
              <p className="text-muted-foreground">
                Detailed task breakdown with assignee performance metrics
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className={cn("glass-card", hasActiveFilters && "border-primary")}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {hasActiveFilters && <span className="ml-2 w-2 h-2 rounded-full bg-primary" />}
              </Button>
              <Button
                onClick={handleRefresh}
                variant="outline"
                className="glass-card"
                disabled={refreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="shadow-lg">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="glass-dropdown">
                  <DropdownMenuItem onClick={handleExportExcel}>
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Export as Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportCSV}>
                    <FileText className="w-4 h-4 mr-2" />
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportPDF}>
                    <Download className="w-4 h-4 mr-2" />
                    Export as PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

                <div>
                  <label className="text-sm font-medium mb-2 block">Manager</label>
                  <Select value={selectedManager} onValueChange={setSelectedManager}>
                    <SelectTrigger className="glass-card">
                      <SelectValue placeholder="Select manager" />
                    </SelectTrigger>
                    <SelectContent className="glass-dropdown">
                      <SelectItem value="all">All Managers</SelectItem>
                      {managers.map(manager => (
                        <SelectItem key={manager.id} value={manager.id}>
                          {manager.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="glass-card">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="glass-dropdown">
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
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
                    Showing {filteredTasks.length} of {tasks.length} tasks
                    {timePeriod !== 'all' && ` • ${timePeriod === '30days' ? 'Last 30 days' : timePeriod === '90days' ? 'Last 90 days' : 'Custom range'}`}
                    {selectedManager !== 'all' && ` • Manager: ${managers.find(m => m.id === selectedManager)?.name}`}
                    {selectedCategory !== 'all' && ` • Category: ${categories.find(c => c.id.toString() === selectedCategory)?.name}`}
                  </p>
                </div>
              )}
            </GlassCard>
          )}

          {/* Summary Cards - Updated with bonus points */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <GlassCard gradient={1} className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Tasks</p>
                  <p className="text-3xl font-bold">{filteredTasks.length}</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard gradient={2} className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                  <Target className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Task Points</p>
                  <p className="text-3xl font-bold">{totalTaskPoints}</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard gradient={4} className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Award className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bonus Points</p>
                  <p className="text-3xl font-bold">{totalBonusPoints}</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard gradient={3} className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Assignees</p>
                  <p className="text-3xl font-bold">{filteredStats.length}</p>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <GlassCard className="lg:col-span-2 h-[400px]">
              <h3 className="text-lg font-semibold mb-4">Points per Assignee (Top 10)</h3>
              <div className="h-[320px]">
                <Bar data={pointsChartData} options={chartOptions} />
              </div>
            </GlassCard>

            <GlassCard className="h-[400px]">
              <h3 className="text-lg font-semibold mb-4">Task Status Distribution</h3>
              <div className="h-[320px] flex items-center justify-center">
                <Doughnut data={statusDistribution} options={doughnutOptions} />
              </div>
            </GlassCard>
          </div>

          {/* Points per Manager Chart */}
          {managerStats.length > 0 && (
            <GlassCard className="h-[400px]">
              <h3 className="text-lg font-semibold mb-4">Points per Manager</h3>
              <div className="h-[320px]">
                <Bar data={managerPointsChartData} options={chartOptions} />
              </div>
            </GlassCard>
          )}

          {/* Completion Rate Chart */}
          <GlassCard className="h-[400px]">
            <h3 className="text-lg font-semibold mb-4">Completion Rate by Assignee (Top 10)</h3>
            <div className="h-[320px]">
              <Bar data={completionChartData} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }} />
            </div>
          </GlassCard>

          {/* Assignee Statistics Table - Updated with bonus points columns */}
          <GlassCard>
            <h3 className="text-lg font-semibold mb-4">Assignee Performance Rankings</h3>
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto scrollbar-thin">
              <table className="w-full">
                <thead className="sticky top-0 bg-card backdrop-blur-md z-10">
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">Rank</th>
                    <th className="text-left py-3 px-4 font-semibold">Assignee</th>
                    <th className="text-left py-3 px-4 font-semibold">Email</th>
                    <th className="text-right py-3 px-4 font-semibold">Task Points</th>
                    <th className="text-right py-3 px-4 font-semibold">Bonus Points</th>
                    <th className="text-right py-3 px-4 font-semibold">Grand Total</th>
                    <th className="text-right py-3 px-4 font-semibold">Tasks</th>
                    <th className="text-right py-3 px-4 font-semibold">Completed</th>
                    <th className="text-right py-3 px-4 font-semibold">Avg Pts</th>
                    <th className="text-right py-3 px-4 font-semibold">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStats.map((stat, index) => (
                    <tr key={stat.userId} className="border-b border-border hover:bg-accent/20">
                      <td className="py-3 px-4">
                        {index === 0 && <span className="text-2xl">🥇</span>}
                        {index === 1 && <span className="text-2xl">🥈</span>}
                        {index === 2 && <span className="text-2xl">🥉</span>}
                        {index > 2 && <span className="text-muted-foreground">#{index + 1}</span>}
                      </td>
                      <td className="py-3 px-4 font-medium">{stat.userName}</td>
                      <td className="py-3 px-4 text-muted-foreground text-sm">{stat.userEmail}</td>
                      <td className="text-right py-3 px-4 text-primary">{stat.totalPoints}</td>
                      <td className="text-right py-3 px-4 text-amber-500 font-medium">
                        {stat.totalBonusPoints > 0 && <Award className="w-3 h-3 inline mr-1" />}
                        {stat.totalBonusPoints}
                      </td>
                      <td className="text-right py-3 px-4 font-bold text-lg">{stat.grandTotalPoints}</td>
                      <td className="text-right py-3 px-4">{stat.tasksAssigned}</td>
                      <td className="text-right py-3 px-4 text-green-600 dark:text-green-400">
                        {stat.tasksCompleted}
                      </td>
                      <td className="text-right py-3 px-4 text-muted-foreground">{stat.avgPointsPerTask}</td>
                      <td className="text-right py-3 px-4">
                        <span className={stat.completionRate >= 75 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}>
                          {stat.completionRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredStats.length === 0 && (
                    <tr>
                      <td colSpan={10} className="text-center py-8 text-muted-foreground">
                        No assignee data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>

          {/* Task Details Table */}
          <GlassCard>
            <h3 className="text-lg font-semibold mb-4">All Tasks</h3>
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto scrollbar-thin">
              <table className="w-full">
                <thead className="sticky top-0 bg-card backdrop-blur-md z-10">
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">ID</th>
                    <th className="text-left py-3 px-4 font-semibold">Title</th>
                    <th className="text-left py-3 px-4 font-semibold">Description</th>
                    <th className="text-left py-3 px-4 font-semibold">Category</th>
                    <th className="text-left py-3 px-4 font-semibold">Due Date</th>
                    <th className="text-left py-3 px-4 font-semibold">Assignees</th>
                    <th className="text-right py-3 px-4 font-semibold">Points</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map(task => (
                    <tr key={task.id} className="border-b border-border hover:bg-accent/20">
                      <td className="py-3 px-4 text-muted-foreground">#{task.id}</td>
                      <td className="py-3 px-4 font-medium">{task.title}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground max-w-xs truncate">
                        {task.description || 'No description'}
                      </td>
                      <td className="py-3 px-4">
                        {task.categoryName ? (
                          <span className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded"
                              style={{ backgroundColor: task.categoryColor || '#E0E0E0' }}
                            />
                            {task.categoryName}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Uncategorized</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {task.assigneeNames.length > 0 ? task.assigneeNames.join(', ') : 'Unassigned'}
                      </td>
                      <td className="text-right py-3 px-4 font-bold text-primary">{task.points}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            task.status === 'completed'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : task.status === 'inprogress'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                              : task.status === 'cancelled'
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                          }`}
                        >
                          {task.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            task.priority === 'urgent'
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              : task.priority === 'high'
                              ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                              : task.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredTasks.length === 0 && (
                    <tr>
                      <td colSpan={9} className="text-center py-8 text-muted-foreground">
                        No tasks available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  );
}