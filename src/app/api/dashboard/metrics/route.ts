import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, tasks } from '@/db/schema';
import { eq, sql, and, or } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Execute all queries in parallel for better performance
    const [
      totalTasksResult,
      activeTasksResult,
      completedTasksResult,
      activeUsersResult,
      totalPointsResult,
      highPriorityTasksResult,
      completedTasksData
    ] = await Promise.all([
      // Total tasks count
      db.select({ count: sql<number>`count(*)` }).from(tasks),
      
      // Active tasks count (not completed and not cancelled)
      db.select({ count: sql<number>`count(*)` })
        .from(tasks)
        .where(and(
          sql`${tasks.status} != 'completed'`,
          sql`${tasks.status} != 'cancelled'`
        )),
      
      // Completed tasks count
      db.select({ count: sql<number>`count(*)` })
        .from(tasks)
        .where(eq(tasks.status, 'completed')),
      
      // Active users count
      db.select({ count: sql<number>`count(*)` })
        .from(users)
        .where(eq(users.status, 'active')),
      
      // Total points sum
      db.select({ total: sql<number>`COALESCE(sum(${tasks.points}), 0)` })
        .from(tasks),
      
      // High priority tasks count
      db.select({ count: sql<number>`count(*)` })
        .from(tasks)
        .where(eq(tasks.priority, 'high')),
      
      // Get completed tasks with timestamps for average calculation
      db.select({
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt
      })
        .from(tasks)
        .where(eq(tasks.status, 'completed'))
    ]);

    // Extract values from results
    const totalTasks = Number(totalTasksResult[0]?.count || 0);
    const activeTasks = Number(activeTasksResult[0]?.count || 0);
    const completedTasks = Number(completedTasksResult[0]?.count || 0);
    const activeUsers = Number(activeUsersResult[0]?.count || 0);
    const totalPoints = Number(totalPointsResult[0]?.total || 0);
    const highPriorityTasks = Number(highPriorityTasksResult[0]?.count || 0);

    // Calculate completion rate
    const completionRate = totalTasks > 0 
      ? Math.round((completedTasks / totalTasks) * 1000) / 10 
      : 0;

    // Calculate average time per task
    let avgTimePerTask = "N/A";
    
    if (completedTasksData.length > 0) {
      let totalMilliseconds = 0;
      
      for (const task of completedTasksData) {
        const createdDate = new Date(task.createdAt);
        const updatedDate = new Date(task.updatedAt);
        const timeDiff = updatedDate.getTime() - createdDate.getTime();
        totalMilliseconds += timeDiff;
      }
      
      const avgMilliseconds = totalMilliseconds / completedTasksData.length;
      const avgHours = avgMilliseconds / (1000 * 60 * 60);
      const avgDays = avgHours / 24;
      
      if (avgDays >= 1) {
        avgTimePerTask = `${Math.round(avgDays * 10) / 10} days`;
      } else {
        avgTimePerTask = `${Math.round(avgHours * 10) / 10} hours`;
      }
    }

    // Return dashboard metrics
    return NextResponse.json({
      totalTasks,
      activeTasks,
      completedTasks,
      activeUsers,
      completionRate,
      avgTimePerTask,
      totalPoints,
      highPriorityTasks
    }, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}