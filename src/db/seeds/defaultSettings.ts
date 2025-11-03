import { db } from '@/db';
import { defaultSettings } from '@/db/schema';

async function main() {
    const sampleSettings = [
        {
            settingKey: 'default_time_filter',
            settingValue: '30days',
            description: 'Default time filter for dashboard and reports (options: all, 30days, 90days, custom)',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            settingKey: 'default_category_filter',
            settingValue: 'all',
            description: 'Default category filter for dashboard and reports',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            settingKey: 'default_manager_filter',
            settingValue: 'all',
            description: 'Default manager filter for reports',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
    ];

    await db.insert(defaultSettings).values(sampleSettings);
    
    console.log('✅ Default settings seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});