import { NextRequest, NextResponse } from 'next/server';
import { withSuperAdminAuth } from '@/lib/auth/middleware';
import { deleteUser } from '@/lib/db/adminService';

// Delete a user
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return withSuperAdminAuth(req, async () => {
    try {
      const userId = params.id;
      
      // Call the service to delete the user
      const result = await deleteUser(userId);
      
      if (!result.success) {
        return NextResponse.json({ error: result.message }, { status: 400 });
      }
      
      return NextResponse.json({ message: result.message });
    } catch (error) {
      console.error('Error deleting user:', error);
      return NextResponse.json(
        { error: 'Failed to delete user' },
        { status: 500 }
      );
    }
  });
} 