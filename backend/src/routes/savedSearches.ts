import { Router } from "express";
import {
	getSavedSearches,
	createSavedSearch,
	deleteSavedSearch,
} from "../controllers/savedSearchController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, getSavedSearches);
router.post("/", authenticate, createSavedSearch);
router.delete("/:id", authenticate, deleteSavedSearch);

export default router;
