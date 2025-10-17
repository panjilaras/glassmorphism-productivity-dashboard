"use client";

import React from 'react';
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
  const data = {
    labels: ['Sarah Johnson', 'Mike Chen', 'Emma Davis', 'David Kim', 'Lisa Wang'],
    datasets: [
      {
        label: 'Total Points',
        data: [145, 128, 98, 87, 72],
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
  };

  return (
    <GlassCard className="h-[400px]">
      <h3 className="text-lg font-semibold mb-4">Top Assignee Rankings (Total Points)</h3>
      <div className="h-[320px]">
        <Bar data={data} options={chartOptions} />
      </div>
    </GlassCard>
  );
}

export function TeamProductivityChart() {
  const data = {
    labels: ['UAT', 'Datafix', 'Training', 'Task Force', 'Other'],
    datasets: [
      {
        label: 'Tasks by Category',
        data: [12, 18, 8, 15, 7],
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

  return (
    <GlassCard className="h-[400px]">
      <h3 className="text-lg font-semibold mb-4">Team Productivity by Task Category</h3>
      <div className="h-[320px]">
        <Bar data={data} options={chartOptions} />
      </div>
    </GlassCard>
  );
}

export function TaskDistributionChart() {
  const data = {
    labels: ['To Do', 'In Progress', 'Completed', 'Cancelled'],
    datasets: [
      {
        data: [25, 35, 125, 15],
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
  };

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
        <Doughnut data={data} options={doughnutOptions} />
      </div>
    </GlassCard>
  );
}