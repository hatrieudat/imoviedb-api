import { Router } from "express";
import {
  addCountry,
  addListCountries,
  deleteCountry,
  updateCountry,
  getAllCountries,
} from "../controllers/countryController.js";
import { authenticate, authorize } from "../middlewares/authMiddleware.js";

const router = Router();

// ***** Public Routes **** //
router.get("/", getAllCountries);

// ***** Privated Routes **** //
router.post("/", authenticate, authorize("admin"), addCountry);
router.post("/list", authenticate, authorize("admin"), addListCountries);
router.put("/:id", authenticate, authorize("admin"), updateCountry);
router.delete("/:id", authenticate, authorize("admin"), deleteCountry);

export default router;
