// Define user routes
import { Router } from "express";
import {
  addUser,
  deleteSavedMovie,
  deleteUser,
  getAllUsers,
  getOwnUser,
  getSavedMovies,
  getUser,
  saveMovie,
  searchUsers,
  updateOwnUser,
  updateUser,
} from "../controllers/userController.js";
import { authenticate, authorize } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/multerMiddleware.js";

const router = Router();

// ***** Protected Routes **** //
router.get("/me", authenticate, getOwnUser);
router.put("/me", authenticate, upload.single("image"), updateOwnUser);
router.get("/saved-movies", authenticate, getSavedMovies);
router.post("/saved-movies/:id", authenticate, saveMovie);
router.delete("/saved-movies/:id", authenticate, deleteSavedMovie);

// ***** Private Routes **** //
router.get("/", authenticate, authorize("admin"), getAllUsers);
router.post(
  "/",
  authenticate,
  authorize("admin"),
  upload.single("image"),
  addUser
);
router.get("/search", authenticate, authorize("admin"), searchUsers);
router.get("/:id", authenticate, authorize("admin"), getUser);
router.delete("/:id", authenticate, authorize("admin"), deleteUser);
router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  upload.single("image"),
  updateUser
);

export default router;
