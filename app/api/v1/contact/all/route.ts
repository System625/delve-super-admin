import { NextRequest, NextResponse } from 'next/server';
import { withSuperAdminAuth } from '@/lib/auth/middleware';

/**
 * GET handler for fetching all contact form messages
 * This endpoint returns all contact form submissions
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
      
      // Make request to external API to fetch contact form messages
      const response = await fetch(`${apiUrl}/contact/all`, {
        headers: {
          'Authorization': authHeader || '',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('External API error:', data);
        return NextResponse.json(
          { error: data.message || 'Failed to fetch contact form messages' },
          { status: response.status }
        );
      }

      // Return the data directly
      return NextResponse.json(data);
    } catch (error) {
      console.error('Error fetching contact form messages:', error);
      return NextResponse.json(
        { error: 'Failed to fetch contact form messages' },
        { status: 500 }
      );
    }
  });
} 