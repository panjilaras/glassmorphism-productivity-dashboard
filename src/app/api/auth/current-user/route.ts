import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user, session, users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Extract Authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { 
          error: 'Authorization token required', 
          code: 'MISSING_TOKEN' 
        }, 
        { status: 401 }
      );
    }

    // Extract token from "Bearer {token}" format
    const token = authHeader.replace('Bearer ', '').trim();
    
    if (!token) {
      return NextResponse.json(
        { 
          error: 'Authorization token required', 
          code: 'MISSING_TOKEN' 
        }, 
        { status: 401 }
      );
    }

    // Query session table to find active session by token
    const sessionResult = await db.select()
      .from(session)
      .where(eq(session.token, token))
      .limit(1);

    // Validate session exists and is not expired
    if (sessionResult.length === 0) {
      return NextResponse.json(
        { 
          error: 'Invalid or expired session', 
          code: 'INVALID_SESSION' 
        }, 
        { status: 401 }
      );
    }

    const userSession = sessionResult[0];
    
    // Check if session is expired
    if (userSession.expiresAt <= new Date()) {
      return NextResponse.json(
        { 
          error: 'Invalid or expired session', 
          code: 'INVALID_SESSION' 
        }, 
        { status: 401 }
      );
    }

    // Fetch auth user from user table using session.userId
    const authUserResult = await db.select()
      .from(user)
      .where(eq(user.id, userSession.userId))
      .limit(1);

    if (authUserResult.length === 0) {
      return NextResponse.json(
        { 
          error: 'User not found', 
          code: 'USER_NOT_FOUND' 
        }, 
        { status: 404 }
      );
    }

    const authUser = authUserResult[0];

    // Query users (master) table by email
    const masterUserResult = await db.select()
      .from(users)
      .where(eq(users.email, authUser.email))
      .limit(1);

    let masterUser;

    // If master user doesn't exist, auto-create them
    if (masterUserResult.length === 0) {
      const now = new Date().toISOString();
      
      const newMasterUser = await db.insert(users)
        .values({
          name: authUser.name,
          email: authUser.email,
          role: authUser.role,
          status: 'active',
          joinDate: now,
          avatarUrl: authUser.image,
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      masterUser = newMasterUser[0];
    } else {
      masterUser = masterUserResult[0];
    }

    // Return merged user data
    return NextResponse.json({
      id: authUser.id,
      email: authUser.email,
      name: authUser.name,
      role: masterUser.role, // Use role from Master Users table, not auth table
      status: masterUser.status,
      avatarUrl: masterUser.avatarUrl,
      position: masterUser.position,
    }, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : String(error)),
        code: 'INTERNAL_ERROR'
      }, 
      { status: 500 }
    );
  }
}