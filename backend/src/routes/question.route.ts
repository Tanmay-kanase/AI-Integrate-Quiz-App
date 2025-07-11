import { Router } from "express";
import questionController from "../controllers/question.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.get("/topic/:topicId", authenticate, questionController.getQuestionsByTopic);
router.post("/", authenticate, questionController.createQuestion);
router.delete("/:id", authenticate, questionController.deleteQuestion);

export default router;
