import jwt from 'jsonwebtoken';
import { UserPayload } from '../types/user.interface';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export const generateToken = (payload: UserPayload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string): UserPayload => {
  return jwt.verify(token, JWT_SECRET) as UserPayload;
};
