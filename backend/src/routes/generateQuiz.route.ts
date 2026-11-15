import { Router } from "express";
import { generateQuizF, generateQuizU } from "../controllers/generateQuiz.controller";

const generateQuizRouter = Router();

generateQuizRouter.post("/generateQuiz", generateQuizU);
generateQuizRouter.post("/generateQuizFromText", generateQuizF);

export default generateQuizRouter;
