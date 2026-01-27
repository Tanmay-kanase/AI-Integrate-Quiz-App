import { Router } from "express";
import { register, login, getProfile } from "../controllers/user.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post("/signup", register);
router.post("/login", login);
router.get("/me", authenticate, getProfile);

export default router;
