import { NextRequest, NextResponse } from 'next/server';
import { withSuperAdminAuth } from '@/lib/auth/middleware';
import { reactivateUser } from '@/lib/db/adminService';

// Reactivate a user
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return withSuperAdminAuth(req, async (authenticatedReq) => {
    try {
      const userId = params.id;
      const adminId = authenticatedReq.user?.userId || '';
      
      // Call the service to reactivate the user
      const result = await reactivateUser(userId, adminId);
      
      if (!result.success) {
        return NextResponse.json({ error: result.message }, { status: 400 });
      }
      
      return NextResponse.json({ message: result.message });
    } catch (error) {
      console.error('Error reactivating user:', error);
      return NextResponse.json(
        { error: 'Failed to reactivate user' },
        { status: 500 }
      );
    }
  });
} 