import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, role } = body;

    // Validate email field
    if (!email || typeof email !== 'string' || email.trim() === '') {
      return NextResponse.json(
        { 
          error: 'Email is required',
          code: 'MISSING_EMAIL' 
        },
        { status: 400 }
      );
    }

    // Validate role field
    if (!role || typeof role !== 'string' || role.trim() === '') {
      return NextResponse.json(
        { 
          error: 'Role is required',
          code: 'MISSING_ROLE' 
        },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedRole = role.trim();

    // Find auth user by email
    const existingUser = await db.select()
      .from(user)
      .where(eq(user.email, sanitizedEmail))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json(
        { 
          error: 'Auth user not found',
          code: 'AUTH_USER_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    // Update auth user table with new role
    const updatedUser = await db.update(user)
      .set({
        role: sanitizedRole,
        updatedAt: new Date()
      })
      .where(eq(user.email, sanitizedEmail))
      .returning();

    if (updatedUser.length === 0) {
      return NextResponse.json(
        { 
          error: 'Failed to update user role',
          code: 'UPDATE_FAILED' 
        },
        { status: 500 }
      );
    }

    // Return success response with updated user
    return NextResponse.json({
      success: true,
      message: 'Role synced successfully',
      user: {
        id: updatedUser[0].id,
        email: updatedUser[0].email,
        name: updatedUser[0].name,
        role: updatedUser[0].role,
        updatedAt: updatedUser[0].updatedAt
      }
    }, { status: 200 });

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR' 
      },
      { status: 500 }
    );
  }
}