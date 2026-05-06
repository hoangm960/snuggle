import { Router } from "express";
import {
	getSavedSearches,
	createSavedSearch,
	deleteSavedSearch,
} from "../controllers/savedSearchController";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createSavedSearchSchema } from "../utils/validators/otherValidator";

const router = Router();

router.get("/", authenticate, getSavedSearches);
router.post("/", authenticate, validate(createSavedSearchSchema), createSavedSearch);
router.delete("/:id", authenticate, deleteSavedSearch);

export default router;
