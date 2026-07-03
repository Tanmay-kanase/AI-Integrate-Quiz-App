import CodingAssessment from "../models/codingAssessment.model";

export const createCodingAssessment = async (data: any) => {
  return await CodingAssessment.create(data);
};

export const getAllCodingAssessments = async () => {
  return await CodingAssessment.find().populate("quizTopicId");
};

export const getCodingAssessmentById = async (id: string) => {
  return await CodingAssessment.findById(id).populate("quizTopicId");
};

export const updateCodingAssessment = async (id: string, data: any) => {
  return await CodingAssessment.findByIdAndUpdate(id, data, { new: true });
};

export const deleteCodingAssessment = async (id: string) => {
  return await CodingAssessment.findByIdAndDelete(id);
};
