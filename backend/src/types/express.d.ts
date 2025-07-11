import { UserPayload } from "./user.interface";

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}
