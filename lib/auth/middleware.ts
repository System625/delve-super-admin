import { NextRequest, NextResponse } from "next/server";
import { verifyToken, extractTokenFromHeader } from "./jwt";

interface NextRequestWithUser extends NextRequest {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export async function withAuth(
  req: NextRequestWithUser,
  handler: (req: NextRequestWithUser) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const authHeader = req.headers.get('authorization');
    
    const token = extractTokenFromHeader(authHeader || '');
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);

    if (!payload) {
      console.log('[withAuth] Token is invalid or expired');
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Check for different field names in the payload
    const userId = payload.userId || payload.id;
    const role = payload.role || payload.account_type;
    
    if (!userId || !role) {
      return NextResponse.json(
        { error: "Invalid token payload" },
        { status: 401 }
      );
    }
    
    // Add user data to the request
    req.user = {
      userId,
      email: payload.email,
      role: role
    };

    // Call the original handler with the authenticated request
    return await handler(req);
  } catch (error) {
    console.error("[withAuth] Auth middleware error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function withSuperAdminAuth(
  req: NextRequestWithUser,
  handler: (req: NextRequestWithUser) => Promise<NextResponse>
): Promise<NextResponse> {
  try {    
    
    return await withAuth(req, async (authenticatedReq) => {
      // Check if role is either 'super_admin' or 'super-admin' (with dash)
      const userRole = authenticatedReq.user?.role || '';
      
      if (userRole !== 'super_admin' && userRole !== 'super-admin') {        
        return NextResponse.json(
          { error: "Super Admin access required" },
          { status: 403 }
        );
      }
      
      // Pass the authenticated and authorized request to the original handler
      return await handler(authenticatedReq);
    });
  } catch (error) {
    console.error("[withSuperAdminAuth] Super Admin auth middleware error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 