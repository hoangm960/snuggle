import { Router, Response } from "express";
import {
	getAllPets,
	getPetById,
	createPet,
	updatePet,
	deletePet,
} from "../controllers/petController";
import { authenticate } from "../middleware/auth";
import { asyncHandler } from "../middleware/asyncHandler";
import { validate } from "../middleware/validate";
import { upload } from "../middleware/upload";
import { createPetSchema, updatePetSchema, petQuerySchema } from "../utils/validators/petValidator";
import { validateQuery } from "../middleware/validate";
import {
	createHealthRecord,
	deleteHealthRecord,
	getPetHealthRecords,
} from "../controllers/healthRecordController";
import { AuthRequest, ApiResponse } from "../types";
import { AppError } from "../middleware/errorHandler";
import { uploadThumbnail } from "../services/thumbnailService";

const router = Router();

router.get("/", validateQuery(petQuerySchema), asyncHandler(getAllPets));
router.get("/:id", asyncHandler(getPetById));
router.post("/", authenticate, validate(createPetSchema), asyncHandler(createPet));
router.put("/:id", authenticate, validate(updatePetSchema), asyncHandler(updatePet));
router.delete("/:id", authenticate, asyncHandler(deletePet));

router.post(
	"/:id/thumbnail",
	authenticate,
	upload.single("thumbnail"),
	asyncHandler(async (req: AuthRequest, res: Response) => {
		const { id } = req.params;

		if (!req.file) {
			throw new AppError("No file uploaded", 400);
		}

		const thumbnailUrl = await uploadThumbnail(id, req.file);

		const response: ApiResponse<{ thumbnailUrl: string }> = {
			success: true,
			data: { thumbnailUrl },
		};

		res.status(200).json(response);
	})
);

router.get("/:petId/health-records", getPetHealthRecords);
router.post("/:petId/health-records", authenticate, createHealthRecord);
router.delete("/:petId/health-records/:id", authenticate, deleteHealthRecord);

export default router;
