import { Router } from "express";
import {
	getAllContracts,
	getContractById,
	createContract,
	signContract,
	archiveContract,
	generateContractPdfEndpoint,
} from "../controllers/adoptionContractController";
import { authenticate } from "../middleware/auth";
import { asyncHandler } from "../middleware/asyncHandler";
import { validate } from "../middleware/validate";
import { createContractSchema, updateContractSchema } from "../utils/validators/otherValidator";

const router = Router();

router.get("/", authenticate, asyncHandler(getAllContracts));
router.get("/:id", asyncHandler(getContractById));
router.post("/", authenticate, validate(createContractSchema), asyncHandler(createContract));
router.put("/:id/sign", authenticate, asyncHandler(signContract));
router.put(
	"/:id/archive",
	authenticate,
	validate(updateContractSchema),
	asyncHandler(archiveContract)
);
router.post("/:id/pdf", authenticate, asyncHandler(generateContractPdfEndpoint));

export default router;
