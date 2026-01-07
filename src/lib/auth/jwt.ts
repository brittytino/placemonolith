import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export type UserRole = 'SUPER_ADMIN' | 'STUDENT';

export interface JWTPayload {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  batchId?: string; // For students
}

export function signToken(payload: JWTPayload): string {
  // @ts-ignore - jwt types might conflict with exact implementation detail but this works
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch (error) {
    return null;
  }
}
