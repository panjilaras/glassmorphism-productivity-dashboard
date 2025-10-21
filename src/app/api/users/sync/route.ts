import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, email, role, image } = body;

    // Validate required fields
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Auth user ID is required', code: 'MISSING_AUTH_ID' },
        { status: 400 }
      );
    }

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Name is required', code: 'MISSING_NAME' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required', code: 'MISSING_EMAIL' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedName = name.trim();
    const sanitizedRole = role?.trim() || 'member';

    // Check if master user exists with matching email
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, sanitizedEmail))
      .limit(1);

    const currentTimestamp = new Date().toISOString();

    if (existingUser.length > 0) {
      // Update existing master user
      const updated = await db
        .update(users)
        .set({
          name: sanitizedName,
          role: sanitizedRole,
          avatarUrl: image || existingUser[0].avatarUrl,
          updatedAt: currentTimestamp,
        })
        .where(eq(users.email, sanitizedEmail))
        .returning();

      if (updated.length === 0) {
        return NextResponse.json(
          { error: 'Failed to update user', code: 'UPDATE_FAILED' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          ...updated[0],
          syncedFromAuth: true,
        },
        { status: 200 }
      );
    } else {
      // Create new master user entry
      const newUser = await db
        .insert(users)
        .values({
          name: sanitizedName,
          email: sanitizedEmail,
          role: sanitizedRole,
          status: 'active',
          position: null,
          joinDate: currentTimestamp,
          avatarUrl: image || null,
          createdAt: currentTimestamp,
          updatedAt: currentTimestamp,
        })
        .returning();

      if (newUser.length === 0) {
        return NextResponse.json(
          { error: 'Failed to create user', code: 'CREATE_FAILED' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          ...newUser[0],
          syncedFromAuth: true,
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error('POST /api/users/sync error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}