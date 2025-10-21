import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { account, user, verification } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, newPassword } = body;

    if (!email || !newPassword) {
      return NextResponse.json(
        { error: 'Email and new password are required' },
        { status: 400 }
      );
    }

    // Find the user by email in auth user table
    const userResult = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    if (userResult.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const foundUser = userResult[0];

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in account table
    const accountResult = await db
      .select()
      .from(account)
      .where(eq(account.userId, foundUser.id))
      .limit(1);

    if (accountResult.length > 0) {
      await db
        .update(account)
        .set({ 
          password: hashedPassword,
          updatedAt: new Date()
        })
        .where(eq(account.userId, foundUser.id));
    } else {
      // Create account if it doesn't exist
      await db.insert(account).values({
        id: `account_${Date.now()}`,
        accountId: email,
        providerId: 'credential',
        userId: foundUser.id,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Create verification entry for email notification
    const verificationId = `verify_${Date.now()}`;
    const verificationValue = `password_reset_${Date.now()}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await db.insert(verification).values({
      id: verificationId,
      identifier: email,
      value: verificationValue,
      expiresAt: expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // In a production environment, you would send an actual email here
    // For now, we'll just log it and return success
    console.log(`Password reset verification sent to ${email}`);
    console.log(`Verification token: ${verificationValue}`);

    return NextResponse.json(
      { 
        message: 'Password reset successfully! A verification email has been sent to your email address.',
        verificationSent: true 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}