import { Request, Response } from "express";
import * as attemptService from "../services/quizAttempt.service";

export const createQuizAttempt = async (req: Request, res: Response) => {
  try {
    const attempt = await attemptService.createQuizAttempt(
      req.body,
      req.body.userId,
    );

    res.status(201).json({
      success: true,
      message: "Quiz attempt saved successfully",
      data: attempt,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllAttempts = async (req: Request, res: Response) => {
  try {
    const attempts = await attemptService.getAllAttempts();

    res.status(200).json({
      success: true,
      data: attempts,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAttemptById = async (req: Request, res: Response) => {
  try {
    const attempt = await attemptService.getAttemptById(req.params.id);

    if (!attempt) {
      res.status(404).json({
        success: false,
        message: "Attempt not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: attempt,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyAttempts = async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;

    const attempts = await attemptService.getMyAttempts(userId);

    res.status(200).json({
      success: true,
      data: attempts,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateAttempt = async (req: Request, res: Response) => {
  try {
    const attempt = await attemptService.updateAttempt(
      req.params.id,
      req.body.userId,
      req.body,
    );

    if (!attempt) {
      res.status(404).json({
        success: false,
        message: "Attempt not found or unauthorized",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Attempt updated successfully",
      data: attempt,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteAttempt = async (req: Request, res: Response) => {
  try {
    const attempt = await attemptService.deleteAttempt(
      req.params.id,
      req.query.userId as string,
    );

    if (!attempt) {
      res.status(404).json({
        success: false,
        message: "Attempt not found or unauthorized",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Attempt deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
