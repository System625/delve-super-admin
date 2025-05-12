import { NextRequest, NextResponse } from 'next/server';
import { withSuperAdminAuth } from '@/lib/auth/middleware';
import { getUserAILogs } from '@/lib/db/adminService';

// Get AI logs for a specific user
export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  return withSuperAdminAuth(req, async () => {
    try {
      const userId = params.userId;
      
      // Get AI logs for the user
      const logs = await getUserAILogs(userId);
      
      return NextResponse.json({ logs });
    } catch (error) {
      console.error('Error fetching user AI logs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch user AI logs' },
        { status: 500 }
      );
    }
  });
} 