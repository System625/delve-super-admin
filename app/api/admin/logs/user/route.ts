import { NextRequest, NextResponse } from 'next/server';
import { withSuperAdminAuth } from '@/lib/auth/middleware';

/**
 * GET handler for fetching logs for a specific user
 * This endpoint returns logs for a single user ID
 */
export async function GET(req: NextRequest) {
  console.log('Auth header received in user logs API:', req.headers.get('authorization'));

  return withSuperAdminAuth(req, async () => {
    try {
      // Extract query parameters
      const url = new URL(req.url);
      const userId = url.searchParams.get('userId');
      
      if (!userId) {
        return NextResponse.json(
          { error: 'User ID is required' },
          { status: 400 }
        );
      }

      // Get API URL from environment variables
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        console.error('API URL not configured');
        return NextResponse.json(
          { error: 'API URL is not configured' },
          { status: 500 }
        );
      }

      // Log the request to help debug
      const externalEndpoint = `${apiUrl}/ai/logs/user?userId=${userId}`;
      console.log('Making request to external user logs API:', externalEndpoint);
      
      // Get the authorization token from the request
      const authHeader = req.headers.get('authorization');
      
      // Make request to external API to fetch user logs
      const response = await fetch(externalEndpoint, {
        method: 'GET',
        headers: {
          'Authorization': authHeader || '',
          'Content-Type': 'application/json'
        },
      });

      // Log the full URL and response for debugging
      console.log('Full URL requested:', externalEndpoint);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        console.error('External API error status:', response.status);
        const errorData = await response.json().catch(() => ({ message: `Failed with status: ${response.status}` }));
        console.error('External API error data:', errorData);
        
        return NextResponse.json(
          { 
            success: false,
            message: errorData.message || `Failed to fetch user logs (status: ${response.status})`,
            data: null
          },
          { status: response.status }
        );
      }

      // Parse the data
      const data = await response.json();
      console.log('User logs data received, entries:', Object.keys(data).length);
      
      // Format the response to match the format used in the logs endpoint
      return NextResponse.json({
        success: true,
        message: 'User logs retrieved successfully',
        data: data
      });
    } catch (error) {
      console.error('Error fetching user logs:', error);
      return NextResponse.json(
        { 
          success: false,
          message: error instanceof Error ? error.message : 'Failed to fetch user logs',
          data: null
        },
        { status: 500 }
      );
    }
  });
} 