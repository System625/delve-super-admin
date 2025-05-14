import { NextRequest, NextResponse } from 'next/server';
import { withSuperAdminAuth } from '@/lib/auth/middleware';
import { z } from 'zod';

// Zod schema for user details response
const userResponseSchema = z.object({
  success: z.boolean(),
  status_code: z.number(),
  message: z.string(),
  data: z.object({
    user: z.object({
      id: z.string(),
      email: z.string().email(),
      name: z.string(),
      account_type: z.string(),
      created_at: z.string(),
      // Add other fields as needed
    }),
  }).optional(),
});

// Type for the response
export type UserResponse = z.infer<typeof userResponseSchema>;

/**
 * GET handler for fetching a specific user by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return withSuperAdminAuth(req, async () => {
    try {
      const userId = params.id;
      
      // Get API URL from environment variables
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        return NextResponse.json(
          { error: 'API URL is not configured' },
          { status: 500 }
        );
      }

      // Get the authorization token from the request
      const authHeader = req.headers.get('authorization');
      
      // Make request to external API to fetch user details
      const response = await fetch(`${apiUrl}/user/${userId}`, {
        headers: {
          'Authorization': authHeader || '',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return NextResponse.json(
          { error: data.message || 'Failed to fetch user details' },
          { status: response.status }
        );
      }

      // Validate the response against our schema
      const result = userResponseSchema.safeParse(data);
      if (!result.success) {
        console.error('API response validation error:', result.error);
        return NextResponse.json(
          { error: 'Invalid response format from API' },
          { status: 500 }
        );
      }

      // Return the validated data
      return NextResponse.json(data);
    } catch (error) {
      console.error(`Error fetching user ${params.id}:`, error);
      return NextResponse.json(
        { error: 'Failed to fetch user details' },
        { status: 500 }
      );
    }
  });
}

/**
 * DELETE handler for removing a user by ID
 * This endpoint deletes a user and their data
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return withSuperAdminAuth(req, async () => {
    try {
      const userId = params.id;
      
      // Get API URL from environment variables
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        return NextResponse.json(
          { error: 'API URL is not configured' },
          { status: 500 }
        );
      }

      // Get the authorization token from the request
      const authHeader = req.headers.get('authorization');
      
      // Make request to external API to delete the user
      const response = await fetch(`${apiUrl}/user/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': authHeader || '',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return NextResponse.json(
          { error: data.message || 'Failed to delete user' },
          { status: response.status }
        );
      }

      // Return success response
      return NextResponse.json({
        success: true,
        message: 'User deleted successfully',
        ...data
      });
    } catch (error) {
      console.error(`Error deleting user ${params.id}:`, error);
      return NextResponse.json(
        { error: 'Failed to delete user' },
        { status: 500 }
      );
    }
  });
} 