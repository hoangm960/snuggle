import { Router } from "express";
import {
	getShelterReviews,
	createReview,
	updateReviewStatus,
} from "../controllers/reviewController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/:shelterId", getShelterReviews);
router.post("/:shelterId", authenticate, createReview);
router.put("/:shelterId/:id/status", authenticate, updateReviewStatus);

export default router;
