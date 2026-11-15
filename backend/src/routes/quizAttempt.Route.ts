import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import * as attemptController from "../controllers/quizAttemp.controller";
const quizAttempRoute = Router();

quizAttempRoute.use(authenticate);

quizAttempRoute.post("/", attemptController.createQuizAttempt);

quizAttempRoute.get("/my-attempts", attemptController.getMyAttempts);

// Restrict these administrative endpoints to admins
quizAttempRoute.get("/", attemptController.getMyAttempts);

quizAttempRoute.get("/:id", attemptController.getAttemptById);

quizAttempRoute.put("/:id", attemptController.updateAttempt);

quizAttempRoute.delete("/:id", attemptController.deleteAttempt);

export default quizAttempRoute;
