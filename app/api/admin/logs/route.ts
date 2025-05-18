import { NextRequest, NextResponse } from 'next/server';
import { withSuperAdminAuth } from '@/lib/auth/middleware';

/**
 * GET handler for fetching system logs
 * This endpoint returns all system logs or logs filtered by type
 */
export async function GET(req: NextRequest) {
  console.log('Auth header received in logs API:', req.headers.get('authorization'));
  
  // Get the Bearer token manually to debug
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
  console.log('Token extracted in logs API:', token ? `${token.substring(0, 15)}...` : 'No token');

  return withSuperAdminAuth(req, async () => {
    try {
      // Extract query parameters
      // Uncomment and use these parameters when implementing filtering by log type
      // const url = new URL(req.url);
      // const logType = url.searchParams.get('type') || 'all';
      
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
      console.log('Making request to external logs API:', `${apiUrl}/ai/logs`);
      
      // Get the authorization token from the request
      const authHeader = req.headers.get('authorization');
      
      // Make request to external API to fetch logs
      const response = await fetch(`${apiUrl}/ai/logs`, {
        headers: {
          'Authorization': authHeader || '',
        },
      });

      const data = await response.json();
      console.log('External API logs response status:', response.status);
      
      if (!response.ok) {
        console.error('External API error:', data);
        return NextResponse.json(
          { error: data.message || 'Failed to fetch logs' },
          { status: response.status }
        );
      }

      // Return the data directly
      return NextResponse.json(data);
    } catch (error) {
      console.error('Error fetching logs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch logs' },
        { status: 500 }
      );
    }
  });
} 