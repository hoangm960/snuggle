import { Router } from "express";
import {
	getAllApplications,
	getApplicationById,
	createApplication,
	updateApplicationStatus,
	deleteApplication,
} from "../controllers/adoptionApplicationController";
import { authenticate } from "../middleware/auth";
import { asyncHandler } from "../middleware/asyncHandler";
import { validate } from "../middleware/validate";
import {
	createApplicationSchema,
	updateApplicationSchema,
} from "../utils/validators/otherValidator";

const router = Router();

router.get("/", authenticate, asyncHandler(getAllApplications));
router.get("/:id", asyncHandler(getApplicationById));
router.post("/", authenticate, validate(createApplicationSchema), asyncHandler(createApplication));
router.put(
	"/:id/status",
	authenticate,
	validate(updateApplicationSchema),
	asyncHandler(updateApplicationStatus)
);
router.delete("/:id", authenticate, asyncHandler(deleteApplication));

export default router;
