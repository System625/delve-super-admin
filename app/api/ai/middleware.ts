import { NextRequest, NextResponse } from "next/server";
import { verifyToken, extractTokenFromHeader } from "@/lib/auth/jwt";
import { canMakeAIRequest, recordAIUsage } from "@/lib/db/aiUsageService";

interface AIRequest extends NextRequest {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export async function withAIUsageCheck(
  req: AIRequest,
  handler: (req: AIRequest) => Promise<NextResponse>
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

    // Check if the user can make an AI request
    const { allowed, reason } = await canMakeAIRequest(payload.userId);
    
    if (!allowed) {
      return NextResponse.json(
        { error: reason || "AI usage is currently restricted" },
        { status: 403 }
      );
    }

    // Process the request
    const response = await handler(req);
    
    // Calculate approximate tokens used for this request
    // This is just an example - in a real system you'd use more accurate measurement
    let tokensUsed = 1000; // Default estimate
    try {
      // Try to parse the body to get a better estimate
      const body = await req.json();
      const input = body.input || body.prompt || '';
      
      // Very rough estimate: 1 token ≈ 4 characters
      if (typeof input === 'string') {
        tokensUsed = Math.ceil(input.length / 4) + 100; // base + input length
      }
    } catch {
      // If we can't parse the body, use the default estimate
    }
    
    // Record the AI usage
    await recordAIUsage(payload.userId, tokensUsed);
    
    return response;
  } catch (error) {
    console.error("AI middleware error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 