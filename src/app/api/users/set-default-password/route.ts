import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user, account } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const DEFAULT_PASSWORD = 'Summitoto_456';
const SALT_ROUNDS = 10;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, role } = body;

    // Validate required field
    if (!email) {
      return NextResponse.json(
        { 
          error: 'Email is required',
          code: 'MISSING_EMAIL'
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          error: 'Invalid email format',
          code: 'INVALID_EMAIL'
        },
        { status: 400 }
      );
    }

    // Hash default password
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);

    // Check if user exists
    const existingUser = await db.select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    let userId: string;
    let isNewUser = false;

    if (existingUser.length > 0) {
      // User exists - use existing user ID
      userId = existingUser[0].id;

      // Update user's updatedAt timestamp
      await db.update(user)
        .set({
          updatedAt: new Date()
        })
        .where(eq(user.id, userId));

      // Check if credential account exists
      const existingAccount = await db.select()
        .from(account)
        .where(eq(account.userId, userId))
        .limit(1);

      if (existingAccount.length > 0) {
        // Update existing credential account
        await db.update(account)
          .set({
            password: hashedPassword,
            updatedAt: new Date()
          })
          .where(eq(account.userId, userId));
      } else {
        // Create new credential account
        await db.insert(account)
          .values({
            id: crypto.randomUUID(),
            accountId: email,
            providerId: 'credential',
            userId: userId,
            password: hashedPassword,
            accessToken: null,
            refreshToken: null,
            idToken: null,
            accessTokenExpiresAt: null,
            refreshTokenExpiresAt: null,
            scope: null,
            createdAt: new Date(),
            updatedAt: new Date()
          });
      }
    } else {
      // User does not exist - create new user
      isNewUser = true;
      userId = crypto.randomUUID();
      
      const userName = name || email.split('@')[0];
      const userRole = role || 'member';

      // Create new user
      await db.insert(user)
        .values({
          id: userId,
          name: userName,
          email: email,
          role: userRole,
          emailVerified: false,
          image: null,
          createdAt: new Date(),
          updatedAt: new Date()
        });

      // Create new credential account
      await db.insert(account)
        .values({
          id: crypto.randomUUID(),
          accountId: email,
          providerId: 'credential',
          userId: userId,
          password: hashedPassword,
          accessToken: null,
          refreshToken: null,
          idToken: null,
          accessTokenExpiresAt: null,
          refreshTokenExpiresAt: null,
          scope: null,
          createdAt: new Date(),
          updatedAt: new Date()
        });
    }

    // Fetch final user data to return
    const finalUser = await db.select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    const userData = finalUser[0];

    return NextResponse.json(
      {
        success: true,
        message: isNewUser 
          ? 'User created successfully with default password' 
          : 'User password updated successfully',
        user: {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role
        },
        defaultPassword: DEFAULT_PASSWORD
      },
      { status: isNewUser ? 201 : 200 }
    );

  } catch (error) {
    console.error('POST /api/users/set-default-password error:', error);
    
    // Handle specific bcrypt errors
    if (error instanceof Error && error.message.includes('bcrypt')) {
      return NextResponse.json(
        { 
          error: 'Password hashing failed',
          code: 'BCRYPT_ERROR'
        },
        { status: 500 }
      );
    }

    // Handle database errors
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json(
        { 
          error: 'Email already exists',
          code: 'DUPLICATE_EMAIL'
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error,
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}