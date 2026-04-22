import { Router } from "express";
import {
	getShelterReviews,
	createReview,
	updateReviewStatus,
} from "../controllers/reviewController";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createReviewSchema, updateReviewStatusSchema } from "../utils/validators/otherValidator";

const router = Router();

router.get("/:shelterId", getShelterReviews);
router.post("/:shelterId", authenticate, validate(createReviewSchema), createReview);
router.put("/:shelterId/:id/status", authenticate, validate(updateReviewStatusSchema), updateReviewStatus);

export default router;
