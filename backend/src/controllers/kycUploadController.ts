import { Response } from "express";
import { AuthRequest } from "../types";
import { AppError } from "../middleware/errorHandler";
import { uploadKycDocument } from "../services/kycUploadService";

export const uploadKycFile = async (req: AuthRequest, res: Response): Promise<void> => {
	const userId = req.user?.uid;

	if (!userId) {
		throw new AppError("Unauthorized", 401);
	}

	if (!req.file) {
		throw new AppError("No file provided", 400);
	}

	const fileType = (req.body.type as "id" | "financial") || "id";

	if (!["id", "financial"].includes(fileType)) {
		throw new AppError("Invalid file type. Must be 'id' or 'financial'", 400);
	}

	const url = await uploadKycDocument(userId, req.file, fileType);

	res.status(200).json({
		success: true,
		data: { url },
	});
};
