import { Router } from "express";
import { getUserProfile } from "../controllers/profile.controller";
import { authenticate } from "../middlewares/auth.middleware";

const profileRoute = Router();

profileRoute.get("/:userId", getUserProfile);

export default profileRoute;
