import { Router } from "express";
import {
  register,
  login,
  getProfile,
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/user.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post("/signup", register);
router.post("/login", login);
router.get("/me", authenticate, getProfile);
router.post("/", createUser);

router.get("/", getAllUsers);

router.get("/:id", getUserById);

router.put("/:id", updateUser);

router.delete("/:id", deleteUser);
export default router;
