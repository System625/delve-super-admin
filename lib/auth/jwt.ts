import jwt from 'jsonwebtoken';
import { IUser } from '@/models/User';

// In a real app, this would be an environment variable
const JWT_SECRET = 'delve-super-admin-secret-key-123456789';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
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
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
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