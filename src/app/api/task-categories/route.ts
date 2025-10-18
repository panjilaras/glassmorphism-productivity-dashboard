import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { taskCategories } from '@/db/schema';
import { eq, like, desc, or } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single category by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const category = await db
        .select()
        .from(taskCategories)
        .where(eq(taskCategories.id, parseInt(id)))
        .limit(1);

      if (category.length === 0) {
        return NextResponse.json(
          { error: 'Category not found', code: 'CATEGORY_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(category[0], { status: 200 });
    }

    // List all categories with pagination and search
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');

    let query = db.select().from(taskCategories).orderBy(desc(taskCategories.createdAt));

    if (search) {
      query = query.where(like(taskCategories.name, `%${search}%`));
    }

    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, color, taskCount } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required and must be a non-empty string', code: 'MISSING_NAME' },
        { status: 400 }
      );
    }

    // Sanitize and validate inputs
    const sanitizedName = name.trim();

    // Validate color format if provided
    if (color && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
      return NextResponse.json(
        { error: 'Color must be a valid hex color code (e.g., #FF5733)', code: 'INVALID_COLOR' },
        { status: 400 }
      );
    }

    // Validate taskCount if provided
    if (taskCount !== undefined && (typeof taskCount !== 'number' || taskCount < 0)) {
      return NextResponse.json(
        { error: 'Task count must be a non-negative number', code: 'INVALID_TASK_COUNT' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const newCategory = await db
      .insert(taskCategories)
      .values({
        name: sanitizedName,
        color: color || null,
        taskCount: taskCount ?? 0,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json(newCategory[0], { status: 201 });
  } catch (error: any) {
    console.error('POST error:', error);

    // Handle unique constraint violation
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json(
        { error: 'A category with this name already exists', code: 'DUPLICATE_NAME' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, color, taskCount } = body;

    // Check if category exists
    const existing = await db
      .select()
      .from(taskCategories)
      .where(eq(taskCategories.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Category not found', code: 'CATEGORY_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Build update object
    const updates: any = {
      updatedAt: new Date().toISOString(),
    };

    // Validate and add name if provided
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Name must be a non-empty string', code: 'INVALID_NAME' },
          { status: 400 }
        );
      }
      updates.name = name.trim();
    }

    // Validate and add color if provided
    if (color !== undefined) {
      if (color !== null && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
        return NextResponse.json(
          { error: 'Color must be a valid hex color code (e.g., #FF5733)', code: 'INVALID_COLOR' },
          { status: 400 }
        );
      }
      updates.color = color;
    }

    // Validate and add taskCount if provided
    if (taskCount !== undefined) {
      if (typeof taskCount !== 'number' || taskCount < 0) {
        return NextResponse.json(
          { error: 'Task count must be a non-negative number', code: 'INVALID_TASK_COUNT' },
          { status: 400 }
        );
      }
      updates.taskCount = taskCount;
    }

    const updated = await db
      .update(taskCategories)
      .set(updates)
      .where(eq(taskCategories.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error: any) {
    console.error('PUT error:', error);

    // Handle unique constraint violation
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json(
        { error: 'A category with this name already exists', code: 'DUPLICATE_NAME' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if category exists
    const existing = await db
      .select()
      .from(taskCategories)
      .where(eq(taskCategories.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Category not found', code: 'CATEGORY_NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(taskCategories)
      .where(eq(taskCategories.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Category deleted successfully',
        category: deleted[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}