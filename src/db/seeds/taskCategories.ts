import { db } from '@/db';
import { taskCategories } from '@/db/schema';

async function main() {
    const sampleCategories = [
        {
            name: 'UAT',
            color: '#E6E6FA',
            taskCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            name: 'Datafix',
            color: '#ADD8E6',
            taskCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            name: 'Training',
            color: '#FFB6C1',
            taskCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            name: 'Task Force',
            color: '#FFDAB9',
            taskCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            name: 'Other',
            color: '#DDA0DD',
            taskCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
    ];

    await db.insert(taskCategories).values(sampleCategories);
    
    console.log('✅ Task categories seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});