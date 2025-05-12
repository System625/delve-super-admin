import { NextRequest, NextResponse } from "next/server";
import { withAIUsageCheck } from "../middleware";

interface AIRequest extends NextRequest {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

// This is a mock AI processing endpoint
export async function POST(req: NextRequest) {
  return withAIUsageCheck(req as AIRequest, async (authenticatedReq) => {
    try {
      // Parse the request body
      const body = await req.json();
      const { prompt } = body;
      
      if (!prompt) {
        return NextResponse.json(
          { error: "Prompt is required" },
          { status: 400 }
        );
      }
      
      // Here, we would typically call an actual AI service
      // For demo purposes, we'll just echo back a response based on the prompt
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate a mock response
      const response = {
        result: `AI response to: "${prompt}"`,
        // Add some metadata to show this endpoint is tracking usage
        metadata: {
          user_id: authenticatedReq.user?.userId,
          prompt_length: prompt.length,
          timestamp: new Date().toISOString(),
          message: "This request has been logged and counted against your daily AI usage limit."
        }
      };
      
      return NextResponse.json(response);
    } catch (error) {
      console.error("AI processing error:", error);
      return NextResponse.json(
        { error: "Failed to process AI request" },
        { status: 500 }
      );
    }
  });
} 