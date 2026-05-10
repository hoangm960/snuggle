import { Router } from "express";
import { Response } from "express";
import { authenticate } from "../middleware/auth";
import { asyncHandler } from "../middleware/asyncHandler";
import { AppError } from "../middleware/errorHandler";
import { db } from "../config/firebase";
import { AuthRequest, ApiResponse } from "../types";

const router = Router();

router.get(
	"/",
	authenticate,
	asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
		if (!req.user) throw new AppError("Unauthorized", 401);
		const snap = await db
			.collection("users")
			.doc(req.user.uid)
			.collection("favorites")
			.orderBy("savedAt", "desc")
			.get();
		const favorites = snap.docs.map((doc) => ({
			petId: doc.id,
			savedAt: doc.data().savedAt,
		}));
		const response: ApiResponse<{ petId: string; savedAt: Date }[]> = {
			success: true,
			data: favorites,
		};
		res.status(200).json(response);
	})
);

router.post(
	"/:petId",
	authenticate,
	asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
		if (!req.user) throw new AppError("Unauthorized", 401);
		const { petId } = req.params;
		const petDoc = await db.collection("pets").doc(petId).get();
		if (!petDoc.exists) throw new AppError("Pet not found", 404);
		await db
			.collection("users")
			.doc(req.user.uid)
			.collection("favorites")
			.doc(petId)
			.set({ petId, savedAt: new Date() });
		const response: ApiResponse = { success: true, message: "Added to favorites" };
		res.status(201).json(response);
	})
);

router.delete(
	"/:petId",
	authenticate,
	asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
		if (!req.user) throw new AppError("Unauthorized", 401);
		const { petId } = req.params;
		await db
			.collection("users")
			.doc(req.user.uid)
			.collection("favorites")
			.doc(petId)
			.delete();
		const response: ApiResponse = { success: true, message: "Removed from favorites" };
		res.status(200).json(response);
	})
);

export default router;
