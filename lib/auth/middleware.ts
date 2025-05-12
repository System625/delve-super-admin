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
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Add user data to the request
    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };

    // Call the original handler with the authenticated request
    return await handler(req);
  } catch (error) {
    console.error("Auth middleware error:", error);
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
    const authResponse = await withAuth(req, async (authenticatedReq) => {
      if (authenticatedReq.user?.role !== 'super_admin') {
        return NextResponse.json(
          { error: "Super Admin access required" },
          { status: 403 }
        );
      }
      // Pass the authenticated and authorized request to the original handler
      return await handler(authenticatedReq);
    });

    return authResponse;
  } catch (error) {
    console.error("Super Admin auth middleware error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 