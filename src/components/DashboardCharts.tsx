"use client";

import React, { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
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

export function TaskCompletionChart() {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/dashboard/charts');
        const data = await response.json();
        
        if (data.topAssignees && data.topAssignees.length > 0) {
          setChartData({
            labels: data.topAssignees.map((a: any) => a.name),
            datasets: [
              {
                label: 'Total Points',
                data: data.topAssignees.map((a: any) => a.points),
                backgroundColor: [
                  'rgba(168, 135, 255, 0.7)',
                  'rgba(135, 206, 250, 0.7)',
                  'rgba(255, 182, 193, 0.7)',
                  'rgba(255, 218, 185, 0.7)',
                  'rgba(221, 160, 221, 0.7)',
                ],
                borderColor: [
                  'rgb(168, 135, 255)',
                  'rgb(135, 206, 250)',
                  'rgb(255, 182, 193)',
                  'rgb(255, 218, 185)',
                  'rgb(221, 160, 221)',
                ],
                borderWidth: 2,
              },
            ],
          });
        }
      } catch (error) {
        console.error('Failed to fetch chart data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  return (
    <GlassCard className="h-[400px]">
      <h3 className="text-lg font-semibold mb-4">Top Assignee Rankings (Total Points)</h3>
      <div className="h-[320px]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : chartData ? (
          <Bar data={chartData} options={chartOptions} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No data available</p>
          </div>
        )}
      </div>
    </GlassCard>
  );
}

export function TeamProductivityChart() {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/dashboard/charts');
        const data = await response.json();
        
        if (data.tasksByCategory && data.tasksByCategory.length > 0) {
          setChartData({
            labels: data.tasksByCategory.map((c: any) => c.category),
            datasets: [
              {
                label: 'Tasks by Category',
                data: data.tasksByCategory.map((c: any) => c.count),
                backgroundColor: data.tasksByCategory.map((c: any) => 
                  c.color ? `${c.color}B3` : 'rgba(230, 230, 250, 0.7)'
                ),
                borderColor: data.tasksByCategory.map((c: any) => 
                  c.color || 'rgb(230, 230, 250)'
                ),
                borderWidth: 2,
              },
            ],
          });
        }
      } catch (error) {
        console.error('Failed to fetch chart data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  return (
    <GlassCard className="h-[400px]">
      <h3 className="text-lg font-semibold mb-4">Team Productivity by Task Category</h3>
      <div className="h-[320px]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : chartData ? (
          <Bar data={chartData} options={chartOptions} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No data available</p>
          </div>
        )}
      </div>
    </GlassCard>
  );
}

export function TaskDistributionChart() {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/dashboard/charts');
        const data = await response.json();
        
        if (data.tasksByStatus) {
          const statusLabels: Record<string, string> = {
            'todo': 'To Do',
            'in-progress': 'In Progress',
            'completed': 'Completed',
            'cancelled': 'Cancelled'
          };
          
          setChartData({
            labels: data.tasksByStatus.map((s: any) => statusLabels[s.status] || s.status),
            datasets: [
              {
                data: data.tasksByStatus.map((s: any) => s.count),
                backgroundColor: [
                  'rgba(255, 182, 193, 0.7)',
                  'rgba(255, 218, 185, 0.7)',
                  'rgba(168, 135, 255, 0.7)',
                  'rgba(128, 128, 128, 0.7)',
                ],
                borderColor: [
                  'rgb(255, 182, 193)',
                  'rgb(255, 218, 185)',
                  'rgb(168, 135, 255)',
                  'rgb(128, 128, 128)',
                ],
                borderWidth: 2,
              },
            ],
          });
        }
      } catch (error) {
        console.error('Failed to fetch chart data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
      },
    },
  };

  return (
    <GlassCard className="h-[400px]">
      <h3 className="text-lg font-semibold mb-4">Task Distribution</h3>
      <div className="h-[320px] flex items-center justify-center">
        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : chartData ? (
          <Doughnut data={chartData} options={doughnutOptions} />
        ) : (
          <p className="text-muted-foreground">No data available</p>
        )}
      </div>
    </GlassCard>
  );
}