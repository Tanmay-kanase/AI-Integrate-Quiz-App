import { UserPayload } from "./user.interface";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role?: "user" | "admin";
      };
    }
  }
}

export {};
