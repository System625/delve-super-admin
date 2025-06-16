import { NextRequest, NextResponse } from 'next/server';
import { withSuperAdminAuth } from '@/lib/auth/middleware';

/**
 * GET handler for fetching all newsletter subscribers
 * This endpoint returns all newsletter subscribers
 */
export async function GET(req: NextRequest) {
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
     
      const authHeader = req.headers.get('authorization');
      
      // Make request to external API to fetch newsletter subscribers
      const response = await fetch(`${apiUrl}/newsletter`, {
        headers: {
          'Authorization': authHeader || '',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('External API error:', data);
        return NextResponse.json(
          { error: data.message || 'Failed to fetch newsletter subscribers' },
          { status: response.status }
        );
      }

      // Return the data directly
      return NextResponse.json(data);
    } catch (error) {
      console.error('Error fetching newsletter subscribers:', error);
      return NextResponse.json(
        { error: 'Failed to fetch newsletter subscribers' },
        { status: 500 }
      );
    }
  });
} 