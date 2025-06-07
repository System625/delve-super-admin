import { NextRequest, NextResponse } from 'next/server';
import { withSuperAdminAuth } from '@/lib/auth/middleware';

/**
 * GET handler for fetching dashboard statistics
 * This endpoint returns various system-wide statistics for the admin dashboard
 */
export async function GET(req: NextRequest) {
  console.log('Auth header received in dashboard stats API:', req.headers.get('authorization'));
  
  // Get the Bearer token manually to debug
  const token = req.headers.get('authorization')?.startsWith('Bearer ') 
    ? req.headers.get('authorization')?.substring(7) 
    : req.headers.get('authorization');
  console.log('Token extracted in dashboard stats API:', token ? `${token.substring(0, 15)}...` : 'No token');

  return withSuperAdminAuth(req, async () => {
    try {
      // Get API URL from environment variables
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        console.error('API URL not configured');
        return NextResponse.json(
          { error: 'API URL is not configured' },
          { status: 500 }
        );
      }
 
      
      // Get the authorization token from the request
      const authHeader = req.headers.get('authorization');
      
      // Make request to external API to fetch stats
      const response = await fetch(`${apiUrl}/user/dashboard/stats`, {
        headers: {
          'Authorization': authHeader || '',
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('External API error:', data);
        return NextResponse.json(
          { error: data.message || 'Failed to fetch dashboard statistics' },
          { status: response.status }
        );
      }

      // Return the data directly
      return NextResponse.json(data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return NextResponse.json(
        { error: 'Failed to fetch dashboard statistics' },
        { status: 500 }
      );
    }
  });
} 