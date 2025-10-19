import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { tasks, taskCategories } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Fetch all tasks and categories
    const [allTasks, allCategories] = await Promise.all([
      db.select().from(tasks),
      db.select().from(taskCategories)
    ]);

    // Calculate week boundaries for last 6 weeks
    const now = new Date();
    const weeks: { start: Date; end: Date; label: string }[] = [];
    for (let i = 5; i >= 0; i--) {
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() - (i * 7));
      weekEnd.setHours(23, 59, 59, 999);
      
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekEnd.getDate() - 6);
      weekStart.setHours(0, 0, 0, 0);
      
      weeks.push({
        start: weekStart,
        end: weekEnd,
        label: `Week ${6 - i}`
      });
    }

    // Calculate productivity trend
    const totalPointsCompleted: number[] = [];
    const avgPointsPerTask: number[] = [];

    for (const week of weeks) {
      const completedTasksInWeek = allTasks.filter(task => {
        if (task.status !== 'completed') return false;
        const updatedAt = new Date(task.updatedAt);
        return updatedAt >= week.start && updatedAt <= week.end;
      });

      const totalPoints = completedTasksInWeek.reduce((sum, task) => sum + (task.points || 0), 0);
      const avgPoints = completedTasksInWeek.length > 0 
        ? Math.round((totalPoints / completedTasksInWeek.length) * 10) / 10 
        : 0;

      totalPointsCompleted.push(totalPoints);
      avgPointsPerTask.push(avgPoints);
    }

    // Calculate category breakdown
    const categoryBreakdown: Array<{
      name: string;
      taskCount: number;
      totalPoints: number;
      avgPoints: number;
      completionRate: number;
      color: string;
    }> = [];

    // Process defined categories
    for (const category of allCategories) {
      const categoryTasks = allTasks.filter(task => task.categoryId === category.id);
      const taskCount = categoryTasks.length;
      const totalPoints = categoryTasks.reduce((sum, task) => sum + (task.points || 0), 0);
      const avgPoints = taskCount > 0 ? Math.round((totalPoints / taskCount) * 100) / 100 : 0;
      const completedCount = categoryTasks.filter(task => task.status === 'completed').length;
      const completionRate = taskCount > 0 ? Math.round((completedCount / taskCount) * 1000) / 10 : 0;

      categoryBreakdown.push({
        name: category.name,
        taskCount,
        totalPoints,
        avgPoints,
        completionRate,
        color: category.color || '#E0E0E0'
      });
    }

    // Add uncategorized tasks
    const uncategorizedTasks = allTasks.filter(task => task.categoryId === null);
    if (uncategorizedTasks.length > 0) {
      const taskCount = uncategorizedTasks.length;
      const totalPoints = uncategorizedTasks.reduce((sum, task) => sum + (task.points || 0), 0);
      const avgPoints = Math.round((totalPoints / taskCount) * 100) / 100;
      const completedCount = uncategorizedTasks.filter(task => task.status === 'completed').length;
      const completionRate = Math.round((completedCount / taskCount) * 1000) / 10;

      categoryBreakdown.push({
        name: 'Uncategorized',
        taskCount,
        totalPoints,
        avgPoints,
        completionRate,
        color: '#E0E0E0'
      });
    }

    // Sort by taskCount descending
    categoryBreakdown.sort((a, b) => b.taskCount - a.taskCount);

    // Calculate priority distribution
    const priorityDistribution = {
      low: allTasks.filter(task => task.priority === 'low').length,
      medium: allTasks.filter(task => task.priority === 'medium').length,
      high: allTasks.filter(task => task.priority === 'high').length,
      urgent: allTasks.filter(task => task.priority === 'urgent').length
    };

    // Calculate performance metrics
    const completedTasks = allTasks.filter(task => task.status === 'completed');
    const totalTasks = allTasks.length;
    const nonCancelledTasks = allTasks.filter(task => task.status !== 'cancelled');

    const taskCompletion = totalTasks > 0 
      ? Math.round((completedTasks.length / totalTasks) * 1000) / 10 
      : 0;

    // Calculate on-time delivery
    const completedTasksWithDueDate = completedTasks.filter(task => task.dueDate);
    const onTimeCount = completedTasksWithDueDate.filter(task => {
      const updatedAt = new Date(task.updatedAt);
      const dueDate = new Date(task.dueDate!);
      return updatedAt <= dueDate;
    }).length;
    const onTimeDelivery = completedTasksWithDueDate.length > 0 
      ? Math.round((onTimeCount / completedTasksWithDueDate.length) * 1000) / 10 
      : 0;

    const totalAllPoints = allTasks.reduce((sum, task) => sum + (task.points || 0), 0);
    const pointsAverage = totalTasks > 0 
      ? Math.round((totalAllPoints / totalTasks) * 10) / 10 
      : 0;

    const efficiency = nonCancelledTasks.length > 0 
      ? Math.round((completedTasks.length / nonCancelledTasks.length) * 1000) / 10 
      : 0;

    const performanceMetrics = {
      taskCompletion,
      onTimeDelivery,
      qualityScore: 0,
      collaboration: 0,
      pointsAverage,
      efficiency
    };

    return NextResponse.json({
      productivityTrend: {
        labels: weeks.map(w => w.label),
        totalPointsCompleted,
        avgPointsPerTask
      },
      categoryBreakdown,
      priorityDistribution,
      performanceMetrics
    }, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}