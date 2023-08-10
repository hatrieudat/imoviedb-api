import { Router } from "express";
import {
  addGenre,
  deleteGenre,
  getAllGenres,
  updateGenre,
} from "../controllers/genreController.js";
import { authenticate, authorize } from "../middlewares/authMiddleware.js";

const router = Router();

// ***** Public Routes **** //
router.get("/", getAllGenres);

// ***** Private Routes **** //
router.post("/", authenticate, authorize("admin"), addGenre);
router.put("/:id", authenticate, authorize("admin"), updateGenre);
router.delete("/:id", authenticate, authorize("admin"), deleteGenre);

export default router;
