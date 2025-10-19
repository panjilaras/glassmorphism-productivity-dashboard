import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, tasks, taskCategories } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Fetch all completed tasks with their categories
    const allTasks = await db
      .select({
        id: tasks.id,
        status: tasks.status,
        categoryId: tasks.categoryId,
        points: tasks.points,
        assigneeIds: tasks.assigneeIds,
      })
      .from(tasks);

    // Fetch all users for name lookup
    const allUsers = await db.select().from(users);
    const userMap = new Map(allUsers.map(user => [user.id, user.name]));

    // Fetch all categories for name and color lookup
    const allCategories = await db.select().from(taskCategories);
    const categoryMap = new Map(
      allCategories.map(cat => [cat.id, { name: cat.name, color: cat.color }])
    );

    // Calculate topAssignees - only count completed tasks
    const assigneeStats = new Map<number, { taskCount: number; points: number }>();

    allTasks
      .filter(task => task.status === 'completed')
      .forEach(task => {
        if (task.assigneeIds) {
          const assigneeIdList = task.assigneeIds
            .split(',')
            .map(id => id.trim())
            .filter(id => id !== '')
            .map(id => parseInt(id))
            .filter(id => !isNaN(id) && userMap.has(id));

          assigneeIdList.forEach(userId => {
            const current = assigneeStats.get(userId) || { taskCount: 0, points: 0 };
            assigneeStats.set(userId, {
              taskCount: current.taskCount + 1,
              points: current.points + (task.points || 0),
            });
          });
        }
      });

    const topAssignees = Array.from(assigneeStats.entries())
      .map(([userId, stats]) => ({
        name: userMap.get(userId) || 'Unknown User',
        taskCount: stats.taskCount,
        points: stats.points,
      }))
      .sort((a, b) => {
        if (b.points !== a.points) {
          return b.points - a.points;
        }
        return b.taskCount - a.taskCount;
      })
      .slice(0, 5);

    // Calculate tasksByCategory with real category data
    const categoryStats = new Map<number | null, number>();

    allTasks.forEach(task => {
      const categoryId = task.categoryId;
      categoryStats.set(categoryId, (categoryStats.get(categoryId) || 0) + 1);
    });

    const tasksByCategory = Array.from(categoryStats.entries())
      .map(([categoryId, count]) => {
        if (categoryId === null) {
          return {
            category: 'Uncategorized',
            count,
            color: '#E0E0E0',
          };
        }
        const categoryInfo = categoryMap.get(categoryId);
        return {
          category: categoryInfo?.name || 'Unknown Category',
          count,
          color: categoryInfo?.color || '#E0E0E0',
        };
      })
      .sort((a, b) => b.count - a.count);

    // Calculate tasksByStatus
    const statusOrder = ['todo', 'in-progress', 'completed', 'cancelled'];
    const statusStats = new Map<string, number>(
      statusOrder.map(status => [status, 0])
    );

    allTasks.forEach(task => {
      if (task.status && statusStats.has(task.status)) {
        statusStats.set(task.status, statusStats.get(task.status)! + 1);
      }
    });

    const tasksByStatus = statusOrder.map(status => ({
      status,
      count: statusStats.get(status) || 0,
    }));

    return NextResponse.json(
      {
        topAssignees,
        tasksByCategory,
        tasksByStatus,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}