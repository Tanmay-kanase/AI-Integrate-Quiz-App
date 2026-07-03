import { Request, Response } from "express";
import * as service from "../services/codingAssessment.service";
import codingAssessmentModel from "../models/codingAssessment.model";

export const create = async (req: Request, res: Response) => {
  try {
    const assessment = await service.createCodingAssessment(req.body);

    res.status(201).json(assessment);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const getAll = async (req: Request, res: Response) => {
  try {
    const data = await service.getAllCodingAssessments();

    res.json(data);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const getByQuizTopicId = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { quizTopicId } = req.params;

    const assessment = await codingAssessmentModel
      .findOne({
        quizTopicId,
      })
      .populate("quizTopicId");

    if (!assessment) {
      res.status(404).json({
        success: false,
        message: "Coding assessment not found for this quiz topic",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: assessment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch coding assessment",
      error,
    });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const data = await service.getCodingAssessmentById(req.params.id);

    if (!data) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const data = await service.updateCodingAssessment(req.params.id, req.body);

    res.json(data);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    await service.deleteCodingAssessment(req.params.id);

    res.json({
      message: "Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json(error);
  }
};
