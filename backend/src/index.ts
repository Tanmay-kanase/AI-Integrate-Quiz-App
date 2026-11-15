import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import userRoutes from "./routes/user.routes";
import HttpException from "./exceptions/HttpException";
import quizTopicRoutes from "./routes/quizTopic.routes";
import questionRoutes from "./routes/question.route";
import router from "./routes/codingAssessment.route";
import generateQuizRouter from "./routes/generateQuiz.route";
import profileRoute from "./routes/profile.route";
import quizAttempRoute from "./routes/quizAttempt.Route";
import path from "path";
const app = express();
const frontendPath = path.join(
  __dirname,
  "../../frontend/dist/Price-Pulse/browser",
);
app.use(express.static(frontendPath));
app.use(
  cors({
    origin: "http://localhost:4200",
    credentials: true,
  }),
);
app.use(express.json());
app.use("/api", generateQuizRouter);
app.use("/api/users/profile", profileRoute);
app.use("/api/quizAttempt", quizAttempRoute);
app.use("/api/coding", router);
app.use("/api/users", userRoutes);
app.use("/api/topics", quizTopicRoutes);
app.use("/api/questions", questionRoutes);
app.use((req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ message: "API route not found" });
  }
  res.sendFile(path.join(frontendPath, "index.csr.html"));
});
// Global error handler
app.use(
  (
    err: HttpException,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    res
      .status(err.status || 500)
      .json({ status: err.status, message: err.message });
  },
);

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/quizapp";
mongoose.connect(MONGO_URI).then(() => {
  console.log("MongoDB connected");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
