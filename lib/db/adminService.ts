import { ObjectId } from 'mongodb';
import User, { IUser } from '@/models/User';
import BlockedLog from '@/models/BlockedLog';
import DeactivationLog from '@/models/DeactivationLog';
import AIRequestLog from '@/models/AIRequestLog';
import { connectToDatabase } from './mongoose';

export type UserFilter = 'all' | 'active' | 'blocked' | 'deactivated';

interface UserWithId extends IUser {
  _id: ObjectId;
}

interface LogWithId {
  _id: ObjectId;
  [key: string]: unknown;
}

interface PopulatedLog {
  _id: ObjectId;
  userId: {
    _id: ObjectId;
    email: string;
    name: string;
  };
  actionBy?: {
    _id: ObjectId;
    email: string;
    name: string;
  };
  reason?: string;
  action?: string;
  timestamp: Date;
  [key: string]: unknown;
}

interface UserResponse {
  id: string;
  email: string;
  name: string;
  account_type: string;
  role: string;
  isBlocked: boolean;
  isDeactivated: boolean;
  dailyAICallCount: number;
  total_tokens_used: number;
  total_cost: number;
  created_at: Date;
}

interface AILogResponse {
  id: string;
  timestamp: Date;
  tokensUsed: number;
  cost: number;
  requestType: string;
}

interface SystemLogResponse {
  id: string;
  type: 'blocked' | 'deactivation';
  userId: string;
  userEmail: string;
  userName: string;
  reason?: string;
  action?: string;
  adminId?: string;
  adminEmail?: string;
  adminName?: string;
  timestamp: Date;
}

export async function getAllUsers(filter: UserFilter = 'all'): Promise<UserResponse[]> {
  await connectToDatabase();
  
  let query = {};
  
  switch (filter) {
    case 'active':
      query = { isBlocked: false, isDeactivated: false };
      break;
    case 'blocked':
      query = { isBlocked: true };
      break;
    case 'deactivated':
      query = { isDeactivated: true };
      break;
    default:
      // 'all' - no filter
      break;
  }
  
  const users = await User.find(query).select(
    'email name role account_type isBlocked isDeactivated dailyAICallCount total_tokens_used total_cost created_at'
  ) as UserWithId[];
  
  return users.map(user => ({
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    account_type: user.account_type,
    role: user.role,
    isBlocked: user.isBlocked,
    isDeactivated: user.isDeactivated,
    dailyAICallCount: user.dailyAICallCount,
    total_tokens_used: user.total_tokens_used,
    total_cost: user.total_cost,
    created_at: user.created_at
  }));
}

export async function deactivateUser(userId: string, adminId: string): Promise<{ success: boolean; message: string }> {
  await connectToDatabase();
  
  const user = await User.findById(userId) as UserWithId | null;
  if (!user) {
    return { success: false, message: 'User not found' };
  }
  
  if (user.role === 'super_admin') {
    return { success: false, message: 'Cannot deactivate a super admin account' };
  }
  
  if (user.isDeactivated) {
    return { success: false, message: 'User is already deactivated' };
  }
  
  user.isDeactivated = true;
  await user.save();
  
  // Log the deactivation
  await DeactivationLog.create({
    userId: user._id,
    action: 'deactivate',
    actionBy: new ObjectId(adminId),
    timestamp: new Date()
  });
  
  return { success: true, message: 'User deactivated successfully' };
}

export async function reactivateUser(userId: string, adminId: string): Promise<{ success: boolean; message: string }> {
  await connectToDatabase();
  
  const user = await User.findById(userId) as UserWithId | null;
  if (!user) {
    return { success: false, message: 'User not found' };
  }
  
  if (!user.isDeactivated && !user.isBlocked) {
    return { success: false, message: 'User is already active' };
  }
  
  user.isDeactivated = false;
  user.isBlocked = false;
  await user.save();
  
  // Log the reactivation
  await DeactivationLog.create({
    userId: user._id,
    action: 'reactivate',
    actionBy: new ObjectId(adminId),
    timestamp: new Date()
  });
  
  return { success: true, message: 'User reactivated successfully' };
}

export async function deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
  await connectToDatabase();
  
  const user = await User.findById(userId) as UserWithId | null;
  if (!user) {
    return { success: false, message: 'User not found' };
  }
  
  if (user.role === 'super_admin') {
    return { success: false, message: 'Cannot delete a super admin account' };
  }
  
  // Delete user logs
  await AIRequestLog.deleteMany({ userId: user._id });
  await BlockedLog.deleteMany({ userId: user._id });
  await DeactivationLog.deleteMany({ userId: user._id });
  
  // Delete the user
  await User.findByIdAndDelete(userId);
  
  return { success: true, message: 'User and all associated data deleted successfully' };
}

export async function getUserAILogs(userId: string): Promise<AILogResponse[]> {
  await connectToDatabase();
  
  // Cast document to an unknown type first
  const logsResult = await AIRequestLog.find({ userId: new ObjectId(userId) })
    .sort({ timestamp: -1 }) // Most recent first
    .limit(100);
  
  // Then cast to the expected interface type
  const logs = logsResult as unknown as LogWithId[];
  
  return logs.map(log => ({
    id: log._id.toString(),
    timestamp: log.timestamp as Date,
    tokensUsed: log.tokensUsed as number,
    cost: log.cost as number,
    requestType: (log.requestType as string) || 'general'
  }));
}

export async function getSystemLogs(
  logType: 'blocked' | 'deactivation' | 'all', 
  limit: number = 100
): Promise<SystemLogResponse[]> {
  await connectToDatabase();
  
  let blockedLogs: SystemLogResponse[] = [];
  let deactivationLogs: SystemLogResponse[] = [];
  
  if (logType === 'blocked' || logType === 'all') {
    const blockedResults = await BlockedLog.find()
      .sort({ timestamp: -1 })
      .limit(logType === 'all' ? limit / 2 : limit)
      .populate('userId', 'email name');
    
    // Cast safely with intermediate unknown type
    const logs = blockedResults as unknown as PopulatedLog[];
    
    blockedLogs = logs.map(log => ({
      id: log._id.toString(),
      type: 'blocked',
      userId: log.userId._id.toString(),
      userEmail: log.userId.email,
      userName: log.userId.name,
      reason: log.reason,
      timestamp: log.timestamp
    }));
  }
  
  if (logType === 'deactivation' || logType === 'all') {
    const deactivationResults = await DeactivationLog.find()
      .sort({ timestamp: -1 })
      .limit(logType === 'all' ? limit / 2 : limit)
      .populate('userId', 'email name')
      .populate('actionBy', 'email name');
    
    // Cast safely with intermediate unknown type
    const logs = deactivationResults as unknown as PopulatedLog[];
    
    deactivationLogs = logs.map(log => ({
      id: log._id.toString(),
      type: 'deactivation',
      action: log.action,
      userId: log.userId._id.toString(),
      userEmail: log.userId.email,
      userName: log.userId.name,
      adminId: log.actionBy?._id.toString() || '',
      adminEmail: log.actionBy?.email || '',
      adminName: log.actionBy?.name || '',
      timestamp: log.timestamp
    }));
  }
  
  // Combine and sort by timestamp if both types are requested
  if (logType === 'all') {
    return [...blockedLogs, ...deactivationLogs]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }
  
  return logType === 'blocked' ? blockedLogs : deactivationLogs;
} 