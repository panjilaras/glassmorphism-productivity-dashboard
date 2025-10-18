import { db } from '@/db';
import { tasks } from '@/db/schema';

async function main() {
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
    const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    const fiveDaysFromNow = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

    const sampleTasks = [
        {
            title: 'Complete UAT testing for login module',
            description: 'Test all login scenarios including edge cases and security features',
            status: 'in-progress',
            priority: 'high',
            categoryId: 1,
            points: 8,
            assigneeIds: '3',
            createdAt: threeDaysAgo.toISOString(),
            updatedAt: oneDayAgo.toISOString(),
            dueDate: twoDaysFromNow.toISOString(),
        },
        {
            title: 'Fix customer data inconsistencies in production',
            description: 'Resolve data sync issues between customer and order tables',
            status: 'todo',
            priority: 'high',
            categoryId: 2,
            points: 5,
            assigneeIds: '2',
            createdAt: twoDaysAgo.toISOString(),
            updatedAt: twoDaysAgo.toISOString(),
            dueDate: fiveDaysFromNow.toISOString(),
        },
        {
            title: 'Conduct training session on new dashboard features',
            description: 'Train team members on the new productivity management dashboard',
            status: 'completed',
            priority: 'medium',
            categoryId: 3,
            points: 3,
            assigneeIds: '1,2',
            createdAt: sevenDaysAgo.toISOString(),
            updatedAt: oneDayAgo.toISOString(),
            dueDate: oneDayAgo.toISOString(),
        },
    ];

    await db.insert(tasks).values(sampleTasks);
    
    console.log('✅ Tasks seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});