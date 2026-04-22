import { Router } from "express";
import {
	getAdopterProfile,
	createAdopterProfile,
	updateAdopterProfile,
} from "../controllers/adopterProfileController";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createAdopterProfileSchema, updateAdopterProfileSchema } from "../utils/validators/otherValidator";

const router = Router();

router.get("/", authenticate, getAdopterProfile);
router.post("/", authenticate, validate(createAdopterProfileSchema), createAdopterProfile);
router.put("/", authenticate, validate(updateAdopterProfileSchema), updateAdopterProfile);

export default router;
