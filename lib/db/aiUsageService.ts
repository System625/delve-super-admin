import User, { IUser } from '@/models/User';
import AIRequestLog from '@/models/AIRequestLog';
import BlockedLog from '@/models/BlockedLog';
import { connectToDatabase } from './mongoose';

// Constants for AI usage limits
const FREE_USER_DAILY_LIMIT = 10; // Daily request limit for free users
const TOKEN_COST_FACTOR = 0.000002; // Cost per token (can be adjusted)

export async function resetDailyUsage(): Promise<void> {
  await connectToDatabase();
  const dayAgo = new Date();
  dayAgo.setHours(0, 0, 0, 0);
  
  await User.updateMany(
    { lastUsageReset: { $lt: dayAgo } },
    { $set: { dailyAICallCount: 0, lastUsageReset: new Date() } }
  );
}

export async function canMakeAIRequest(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  await connectToDatabase();
  
  const user = await User.findById(userId);
  if (!user) {
    return { allowed: false, reason: 'User not found' };
  }

  if (user.isDeactivated) {
    return { allowed: false, reason: 'User account has been deactivated' };
  }

  if (user.isBlocked) {
    return { allowed: false, reason: 'User is blocked from AI services' };
  }

  // Reset daily usage if it's a new day
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastReset = new Date(user.lastUsageReset);
  lastReset.setHours(0, 0, 0, 0);

  if (lastReset < today) {
    user.dailyAICallCount = 0;
    user.lastUsageReset = new Date();
    await user.save();
  }

  // Check daily limits based on account type
  const dailyLimit = user.account_type === 'free' 
    ? FREE_USER_DAILY_LIMIT 
    : calculatePaidUserDailyLimit(user);

  if (user.dailyAICallCount >= dailyLimit) {
    // User has exceeded their daily limit, block them from AI services
    user.isBlocked = true;
    await user.save();
    
    // Log the blocking event
    await BlockedLog.create({
      userId: user._id,
      reason: `Daily ${user.account_type} limit exceeded (${dailyLimit} requests)`,
      timestamp: new Date()
    });
    
    return { 
      allowed: false, 
      reason: `You have exceeded your daily AI usage limit (${dailyLimit} requests)` 
    };
  }

  return { allowed: true };
}

export async function recordAIUsage(
  userId: string, 
  tokensUsed: number, 
  requestType: string = 'general'
): Promise<void> {
  await connectToDatabase();
  
  const user = await User.findById(userId);
  if (!user) return;

  // Calculate the cost based on tokens used
  const cost = tokensUsed * TOKEN_COST_FACTOR;

  // Update user stats
  user.dailyAICallCount += 1;
  user.total_tokens_used += tokensUsed;
  user.total_cost += cost;
  await user.save();

  // Log the request
  await AIRequestLog.create({
    userId: user._id,
    timestamp: new Date(),
    tokensUsed,
    cost,
    requestType
  });
}

// Calculate daily limit for paid users based on their subscription cost
function calculatePaidUserDailyLimit(user: IUser): number {
  if (!user.subscription_cost) return FREE_USER_DAILY_LIMIT * 3; // Default higher limit if no cost specified
  
  // Convert monthly subscription to daily value and allow for approximately 
  // half of that value in tokens (rough estimate)
  const dailySubscriptionValue = user.subscription_cost / 30;
  const approximateTokensPerDollar = 500000; // Rough estimate of tokens per dollar
  
  // Daily limit is tokens value divided by average tokens per request
  const averageTokensPerRequest = 1000; // Average estimate of tokens per request
  const dailyLimit = Math.ceil((dailySubscriptionValue * approximateTokensPerDollar * 0.5) / averageTokensPerRequest);
  
  // Ensure a reasonable minimum
  return Math.max(dailyLimit, FREE_USER_DAILY_LIMIT * 3);
}

export async function getUserAIStats(userId: string): Promise<{
  dailyUsage: number;
  dailyLimit: number;
  totalTokens: number;
  totalCost: number;
}> {
  await connectToDatabase();
  
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Reset daily usage if it's a new day
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastReset = new Date(user.lastUsageReset);
  lastReset.setHours(0, 0, 0, 0);

  if (lastReset < today) {
    user.dailyAICallCount = 0;
    user.lastUsageReset = new Date();
    await user.save();
  }

  const dailyLimit = user.account_type === 'free' 
    ? FREE_USER_DAILY_LIMIT 
    : calculatePaidUserDailyLimit(user);

  return {
    dailyUsage: user.dailyAICallCount,
    dailyLimit,
    totalTokens: user.total_tokens_used,
    totalCost: user.total_cost
  };
} 