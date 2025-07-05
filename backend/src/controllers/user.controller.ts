import { Request, Response, NextFunction } from "express";
import UserService from "../services/user.service";
import { AuthRequest } from "../middlewares/auth.middleware";

const userService = new UserService();

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password } = req.body;
    const data = await userService.register(name, email, password);
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const data = await userService.login(email, password);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await userService.getProfile(req.user.userId);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
