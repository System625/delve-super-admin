import { NextRequest, NextResponse } from 'next/server';
import { withSuperAdminAuth } from '@/lib/auth/middleware';
import { z } from 'zod';

// Zod schema for the response structure from the backend
const usersResponseSchema = z.object({
  success: z.boolean(),
  status_code: z.number(),
  message: z.string(),
  data: z.object({
    users: z.array(
      z.object({
        id: z.string(),
        email: z.string().email(),
        name: z.string().optional(),
        account_type: z.string(),
        created_at: z.string(),
        updated_at: z.string().optional(),
        deleted_at: z.string().nullable().optional(),
        is_verified: z.boolean().optional(),
        image_url: z.string().nullable().optional(),
        primary_language: z.string().nullable().optional(),
        target_language: z.string().nullable().optional(),
        target_language_proficiency: z.string().nullable().optional(),
        is_deactivated: z.boolean().optional(),
        resetToken: z.string().nullable().optional(),
        resetTokenExpires: z.string().nullable().optional(),
        total_tokens_used: z.number().optional(),
        total_cost: z.number().optional(),
        deletedReason: z.string().nullable().optional()
      })
    ),
    meta: z.object({
      total: z.number(),
      current_page: z.number(),
      total_pages: z.number()
    }).optional()
  }),
});

// Type for the GET response that our frontend expects
export type UsersResponse = z.infer<typeof usersResponseSchema>;

// Type for user from external API
interface ExternalUserData {
  id: string;
  email: string;
  name?: string;
  account_type: string;
  created_at: string;
  updated_at?: string;
  deleted_at?: string | null;
  is_verified?: boolean;
  image_url?: string | null;
  primary_language?: string | null;
  target_language?: string | null;
  target_language_proficiency?: string | null;
  is_deactivated?: boolean;
  resetToken?: string | null;
  resetTokenExpires?: string | null;
  total_tokens_used?: number;
  total_cost?: number;
  deletedReason?: string | null;
}

/**
 * GET handler for listing all users
 * This endpoint returns a list of all users with basic information
 */
export async function GET(req: NextRequest) {
  // Debug log for the incoming Authorization header
  console.log('Auth header received:', req.headers.get('authorization'));
  
  // Get the Bearer token manually to debug
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
  console.log('Token extracted:', token ? `${token.substring(0, 15)}...` : 'No token');
  
  return withSuperAdminAuth(req, async () => {
    try {
      // Extract query parameters
      const url = new URL(req.url);
      const page = url.searchParams.get('page') || '1';
      const limit = url.searchParams.get('per_page') || '10'; // Client still uses per_page but we'll convert to limit
      
      // Get API URL from environment variables
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        console.error('API URL not configured');
        return NextResponse.json(
          { error: 'API URL is not configured' },
          { status: 500 }
        );
      }

      // Use the correct endpoint format: /user instead of /users and limit instead of per_page
      console.log('Making request to external API:', `${apiUrl}/user?page=${page}&limit=${limit}`);
      // Get the authorization token from the request
      const authHeader = req.headers.get('authorization');
      
      // Make request to external API to fetch users
      const response = await fetch(`${apiUrl}/user?page=${page}&limit=${limit}`, {
        headers: {
          'Authorization': authHeader || '',
        },
      });

      const data = await response.json();
      console.log('External API response status:', response.status);
      
      if (!response.ok) {
        console.error('External API error:', data);
        return NextResponse.json(
          { error: data.message || 'Failed to fetch users' },
          { status: response.status }
        );
      }

      // Validate the API response against our schema
      const validationResult = usersResponseSchema.safeParse(data);
      if (!validationResult.success) {
        console.error('API response validation error:', validationResult.error);
        console.log('Raw API response:', data);
        // Continue anyway, but log the validation error for debugging
      }

      // Based on the log example, we need to adapt the API response to match our expected format
      // The response has users under data.users and pagination info under data.meta
      const adaptedData = {
        success: data.success,
        status_code: data.status_code,
        message: data.message,
        data: {
          users: data.data.users.map((user: ExternalUserData) => ({
            id: user.id,
            email: user.email,
            name: user.name || '',
            account_type: user.account_type,
            created_at: user.created_at,
            total_tokens_used: user.total_tokens_used || 0,
            total_cost: user.total_cost || 0,
            is_deactivated: user.is_deactivated || false
          })),
          meta: {
            total: data.data.meta.total,
            current_page: parseInt(page),
            total_pages: data.data.meta.total_pages
          }
        }
      };

      // Return the adapted data
      return NextResponse.json(adaptedData);
    } catch (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }
  });
}

/**
 * POST handler for creating a new user
 * This would be implemented if needed in the future
 */
export async function POST(req: NextRequest) {
  return withSuperAdminAuth(req, async () => {
    return NextResponse.json(
      { error: 'Not implemented' },
      { status: 501 }
    );
  });
} 