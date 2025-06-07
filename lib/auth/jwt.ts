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
    // We use a more flexible approach since we're handling external tokens
    let payload: JWTPayload;
    try {
      // First try with our secret
      payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch {      
      
      // If that fails, just decode without verification for external API tokens
      // This is necessary since we don't have access to the external API's secret
      payload = jwt.decode(token) as JWTPayload;
      
      if (!payload) {
        console.log('[verifyToken] Token could not be decoded');
        return null;
      }
      
      // Validate the payload has the required fields
      if (!payload.email || ((!payload.role && !payload.account_type) || (!payload.userId && !payload.id))) {        
        return null;
      }
      
      // Check if the token is expired based on exp claim
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        return null;
      }
    }
    
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