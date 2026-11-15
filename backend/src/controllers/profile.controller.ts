import { Request, Response } from "express";
import * as profileService from "../services/profile.service";

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const profile = await profileService.getUserProfile(req.params.userId);
    res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: profile,
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};
