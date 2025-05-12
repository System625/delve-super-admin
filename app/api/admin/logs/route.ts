import { NextRequest, NextResponse } from 'next/server';
import { withSuperAdminAuth } from '@/lib/auth/middleware';
import { getSystemLogs } from '@/lib/db/adminService';

// Get system logs (blocked and deactivation logs)
export async function GET(req: NextRequest) {
  return withSuperAdminAuth(req, async () => {
    try {
      // Extract query parameters
      const url = new URL(req.url);
      const logType = url.searchParams.get('type') as 'blocked' | 'deactivation' | 'all' | null;
      const limitParam = url.searchParams.get('limit');
      
      // Default to 'all' logs if no type specified
      const type = logType || 'all';
      
      // Convert limit to number or use default
      const limit = limitParam ? parseInt(limitParam, 10) : 100;
      
      // Get logs
      const logs = await getSystemLogs(type, limit);
      
      return NextResponse.json({ logs });
    } catch (error) {
      console.error('Error fetching system logs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch system logs' },
        { status: 500 }
      );
    }
  });
} 