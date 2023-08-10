// Define auth routes
import { Router } from "express";
import {
  register,
  login,
  logout,
  refreshToken,
} from "../controllers/authController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = Router();

// ***** Public Routes **** //
router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);

// ***** Private Routes **** //
router.post("/logout", authenticate, logout);

export default router;
