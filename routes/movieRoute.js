import { Router } from "express";

// Import routes
import genreRoutes from "./genreRoute.js";
import countryRoutes from "./countryRoute.js";

// Import middlewares
import { authenticate, authorize } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/multerMiddleware.js";

// Import controllers
import {
  getAllMovies,
  getMovieByID,
  searchMovies,
  getTopRatedMovies,
  getRandomMovies,
  addMovie,
  updateMovie,
  deleteMovie,
} from "../controllers/movieController.js";
import {
  addMovieComment,
  getAllComments,
} from "../controllers/commentController.js";

const router = Router();

// Mount routes
router.use("/genres", genreRoutes);
router.use("/countries", countryRoutes);

// ***** Public Routes **** //
router.get("/search*", searchMovies);
router.get("/random", getRandomMovies);
router.get("/top-rated", getTopRatedMovies);
router.get("/:id", getMovieByID);
router.get("/", getAllMovies);

// ***** Protected Routes **** //
router.post("/:id/comments", authenticate, addMovieComment);
router.get("/:id/comments", authenticate, getAllComments);

// ***** Private Routes **** //
router.post(
  "/",
  authenticate,
  authorize("admin"),
  upload.single("image"),
  addMovie
);
router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  upload.single("image"),
  updateMovie
);
router.delete("/:id", authenticate, authorize("admin"), deleteMovie);

export default router;
