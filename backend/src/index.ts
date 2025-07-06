import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoutes from "./routes/user.routes";
import HttpException from "./exceptions/HttpException";
import quizTopicRoutes from './routes/quizTopic.routes';
dotenv.config();

const app = express();
app.use(express.json());
app.use("/api/users", userRoutes);
app.use('/api/topics', quizTopicRoutes);
// Global error handler
app.use(
  (
    err: HttpException,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    res
      .status(err.status || 500)
      .json({ status: err.status, message: err.message });
  }
);

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/quizapp";

mongoose.connect(MONGO_URI).then(() => {
  console.log("MongoDB connected");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
