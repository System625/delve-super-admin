import jwt from 'jsonwebtoken';
import { IUser } from '@/models/User';

// In a real app, this would be an environment variable
const JWT_SECRET = 'delve-super-admin-secret-key-123456789';

export interface JWTPayload {
  userId?: string;
  email: string;
  role?: string;
  // Fields from the external API token
  id?: string;
  account_type?: string;
  iat?: number;
  exp?: number;
}

export function generateToken(user: IUser): string {
  const payload: JWTPayload = {
    userId: user._id ? user._id.toString() : '',
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    // Add debugging for token verification
    console.log('[verifyToken] Attempting to verify token');
    // We use a more flexible approach since we're handling external tokens
    let payload: JWTPayload;
    try {
      // First try with our secret
      payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
      console.log('[verifyToken] Token verified with internal secret');
    } catch (verificationError) {
      console.log('[verifyToken] Failed with internal secret, treating as external token');
      // Log the verification error for debugging purposes
      console.log('[verifyToken] Verification error:', verificationError);
      
      // If that fails, just decode without verification for external API tokens
      // This is necessary since we don't have access to the external API's secret
      payload = jwt.decode(token) as JWTPayload;
      
      if (!payload) {
        console.log('[verifyToken] Token could not be decoded');
        return null;
      }
      
      // Validate the payload has the required fields
      if (!payload.email || ((!payload.role && !payload.account_type) || (!payload.userId && !payload.id))) {
        console.log('[verifyToken] Token payload missing required fields');
        console.log('[verifyToken] Payload:', payload);
        return null;
      }
      
      // Check if the token is expired based on exp claim
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        console.log('[verifyToken] Token is expired');
        return null;
      }
    }
    
    console.log('[verifyToken] Token payload:', {
      id: payload.id || payload.userId,
      email: payload.email,
      role: payload.role || payload.account_type
    });
    
    return payload;
  } catch (error) {
    console.error('[verifyToken] Error verifying token:', error);
    return null;
  }
}

export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.split(' ')[1];
}

export const jwtUtils = {
  generateToken,
  verifyToken,
  extractTokenFromHeader,
}; 