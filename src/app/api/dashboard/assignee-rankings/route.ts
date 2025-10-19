import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { tasks, users } from '@/db/schema';
import { eq } from 'drizzle-orm';

interface AssigneeRanking {
  userId: number;
  name: string;
  totalPoints: number;
  completedTasks: number;
}

export async function GET(request: NextRequest) {
  try {
    // Fetch all completed tasks
    const completedTasks = await db.select()
      .from(tasks)
      .where(eq(tasks.status, 'completed'));

    // Fetch all users to create a lookup map
    const allUsers = await db.select().from(users);
    const userMap = new Map(allUsers.map(user => [user.id, user.name]));

    // Map to store aggregated data for each assignee
    const assigneeData = new Map<number, { name: string; totalPoints: number; completedTasks: number }>();

    // Process each completed task
    for (const task of completedTasks) {
      // Skip if assigneeIds is null or empty
      if (!task.assigneeIds || task.assigneeIds.trim() === '') {
        continue;
      }

      // Parse comma-separated assigneeIds
      const assigneeIdArray = task.assigneeIds
        .split(',')
        .map(id => id.trim())
        .filter(id => id !== '')
        .map(id => parseInt(id, 10))
        .filter(id => !isNaN(id));

      const taskPoints = task.points || 0;

      // Each assignee gets FULL points for the completed task
      for (const userId of assigneeIdArray) {
        if (!assigneeData.has(userId)) {
          // Initialize data for this user
          const userName = userMap.get(userId) || 'Unknown User';
          assigneeData.set(userId, {
            name: userName,
            totalPoints: 0,
            completedTasks: 0
          });
        }

        // Add full points and increment task count
        const userData = assigneeData.get(userId)!;
        userData.totalPoints += taskPoints;
        userData.completedTasks += 1;
      }
    }

    // Convert map to array and sort by totalPoints descending
    const rankings: AssigneeRanking[] = Array.from(assigneeData.entries())
      .map(([userId, data]) => ({
        userId,
        name: data.name,
        totalPoints: data.totalPoints,
        completedTasks: data.completedTasks
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints);

    return NextResponse.json(rankings, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error,
        code: 'QUERY_FAILED'
      }, 
      { status: 500 }
    );
  }
}