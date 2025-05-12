import { NextRequest, NextResponse } from 'next/server';
import { withSuperAdminAuth } from '@/lib/auth/middleware';
import { deactivateUser } from '@/lib/db/adminService';

// Deactivate a user
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return withSuperAdminAuth(req, async (authenticatedReq) => {
    try {
      const userId = params.id;
      const adminId = authenticatedReq.user?.userId || '';
      
      // Call the service to deactivate the user
      const result = await deactivateUser(userId, adminId);
      
      if (!result.success) {
        return NextResponse.json({ error: result.message }, { status: 400 });
      }
      
      return NextResponse.json({ message: result.message });
    } catch (error) {
      console.error('Error deactivating user:', error);
      return NextResponse.json(
        { error: 'Failed to deactivate user' },
        { status: 500 }
      );
    }
  });
} 