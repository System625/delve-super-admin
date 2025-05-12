import { NextRequest, NextResponse } from 'next/server';
import { withSuperAdminAuth } from '@/lib/auth/middleware';
import { getAllUsers, UserFilter } from '@/lib/db/adminService';

// Get all users with optional filter
export async function GET(req: NextRequest) {
  return withSuperAdminAuth(req, async () => {
    try {
      // Extract filter from query parameters
      const url = new URL(req.url);
      const filterParam = url.searchParams.get('filter') as UserFilter | null;
      const filter = filterParam || 'all';
      
      // Get users with the specified filter
      const users = await getAllUsers(filter);
      
      return NextResponse.json({ users });
    } catch (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }
  });
} 