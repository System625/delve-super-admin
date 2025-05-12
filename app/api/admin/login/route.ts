import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import User from '@/models/User';
import { generateToken } from '@/lib/auth/jwt';
import { connectToDatabase } from '@/lib/db/mongoose';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await req.json();
    const { email, password } = body;
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Find the user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Check if the user is a super_admin
    if (user.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Access denied: Super Admin privileges required' },
        { status: 403 }
      );
    }
    
    // Check if the user is deactivated
    if (user.isDeactivated) {
      return NextResponse.json(
        { error: 'Account is deactivated' },
        { status: 403 }
      );
    }
    
    // Verify the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Generate JWT token
    const token = generateToken(user);
    
    // Return the token and user info
    return NextResponse.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 