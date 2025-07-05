import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import HttpException from "../exceptions/HttpException";

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new HttpException(401, "Unauthorized"));
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    next(new HttpException(401, "Invalid or expired token"));
  }
};
