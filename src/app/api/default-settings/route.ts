import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { defaultSettings } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const key = searchParams.get('key');

    // Get single setting by key
    if (key !== null) {
      if (key.trim() === '') {
        return NextResponse.json(
          { error: 'Setting key cannot be empty', code: 'INVALID_KEY' },
          { status: 400 }
        );
      }

      const setting = await db
        .select()
        .from(defaultSettings)
        .where(eq(defaultSettings.settingKey, key))
        .limit(1);

      if (setting.length === 0) {
        return NextResponse.json(
          { error: 'Setting not found', code: 'SETTING_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(setting[0], { status: 200 });
    }

    // Get all settings with pagination
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    const settings = await db
      .select()
      .from(defaultSettings)
      .orderBy(desc(defaultSettings.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { settingKey, settingValue, description } = body;

    // Validate required fields
    if (!settingKey || typeof settingKey !== 'string' || settingKey.trim() === '') {
      return NextResponse.json(
        { error: 'Setting key is required and must be a non-empty string', code: 'MISSING_SETTING_KEY' },
        { status: 400 }
      );
    }

    if (!settingValue || typeof settingValue !== 'string' || settingValue.trim() === '') {
      return NextResponse.json(
        { error: 'Setting value is required and must be a non-empty string', code: 'MISSING_SETTING_VALUE' },
        { status: 400 }
      );
    }

    // Check if setting key already exists
    const existingSetting = await db
      .select()
      .from(defaultSettings)
      .where(eq(defaultSettings.settingKey, settingKey.trim()))
      .limit(1);

    if (existingSetting.length > 0) {
      return NextResponse.json(
        { error: 'Setting key already exists', code: 'DUPLICATE_SETTING_KEY' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const newSetting = await db
      .insert(defaultSettings)
      .values({
        settingKey: settingKey.trim(),
        settingValue: settingValue.trim(),
        description: description ? description.trim() : null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json(newSetting[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    
    // Handle unique constraint violation
    if ((error as Error).message.includes('UNIQUE constraint failed')) {
      return NextResponse.json(
        { error: 'Setting key already exists', code: 'DUPLICATE_SETTING_KEY' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Validate id parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { settingKey, settingValue, description } = body;

    // Validate settingKey if provided
    if (settingKey !== undefined && (typeof settingKey !== 'string' || settingKey.trim() === '')) {
      return NextResponse.json(
        { error: 'Setting key must be a non-empty string', code: 'INVALID_SETTING_KEY' },
        { status: 400 }
      );
    }

    // Validate settingValue if provided
    if (settingValue !== undefined && (typeof settingValue !== 'string' || settingValue.trim() === '')) {
      return NextResponse.json(
        { error: 'Setting value must be a non-empty string', code: 'INVALID_SETTING_VALUE' },
        { status: 400 }
      );
    }

    // Check if setting exists
    const existingSetting = await db
      .select()
      .from(defaultSettings)
      .where(eq(defaultSettings.id, parseInt(id)))
      .limit(1);

    if (existingSetting.length === 0) {
      return NextResponse.json(
        { error: 'Setting not found', code: 'SETTING_NOT_FOUND' },
        { status: 404 }
      );
    }

    // If settingKey is being updated, check for uniqueness
    if (settingKey && settingKey.trim() !== existingSetting[0].settingKey) {
      const duplicateSetting = await db
        .select()
        .from(defaultSettings)
        .where(eq(defaultSettings.settingKey, settingKey.trim()))
        .limit(1);

      if (duplicateSetting.length > 0) {
        return NextResponse.json(
          { error: 'Setting key already exists', code: 'DUPLICATE_SETTING_KEY' },
          { status: 400 }
        );
      }
    }

    // Build update object with only provided fields
    const updateFields: {
      settingKey?: string;
      settingValue?: string;
      description?: string | null;
      updatedAt: string;
    } = {
      updatedAt: new Date().toISOString(),
    };

    if (settingKey !== undefined) {
      updateFields.settingKey = settingKey.trim();
    }

    if (settingValue !== undefined) {
      updateFields.settingValue = settingValue.trim();
    }

    if (description !== undefined) {
      updateFields.description = description ? description.trim() : null;
    }

    const updatedSetting = await db
      .update(defaultSettings)
      .set(updateFields)
      .where(eq(defaultSettings.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedSetting[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);

    // Handle unique constraint violation
    if ((error as Error).message.includes('UNIQUE constraint failed')) {
      return NextResponse.json(
        { error: 'Setting key already exists', code: 'DUPLICATE_SETTING_KEY' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Validate id parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if setting exists
    const existingSetting = await db
      .select()
      .from(defaultSettings)
      .where(eq(defaultSettings.id, parseInt(id)))
      .limit(1);

    if (existingSetting.length === 0) {
      return NextResponse.json(
        { error: 'Setting not found', code: 'SETTING_NOT_FOUND' },
        { status: 404 }
      );
    }

    const deletedSetting = await db
      .delete(defaultSettings)
      .where(eq(defaultSettings.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Setting deleted successfully',
        setting: deletedSetting[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}