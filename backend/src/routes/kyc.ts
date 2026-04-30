import { Router, Response } from "express";
import { AuthRequest } from "../types";
import {
	getPendingKYC,
	getUserWithKYC,
	approveKYC,
	rejectKYC,
	getKYCStats,
	getUserKYCWithProfile,
	submitKYC,
	SubmitKYCParams,
} from "../controllers/kycController";
import { uploadKycFile } from "../controllers/kycUploadController";
import { sendOtpHandler, verifyOtpHandler } from "../controllers/kycOtpController";
import { authenticate } from "../middleware/auth";
import { requireAdmin } from "../middleware/admin";
import { asyncHandler } from "../middleware/asyncHandler";
import { AppError } from "../middleware/errorHandler";
import { upload } from "../middleware/upload";

const router = Router();

router.use(authenticate);

router.get(
	"/me",
	asyncHandler(async (req: AuthRequest, res: Response) => {
		const userId = req.user?.uid;

		if (!userId) {
			throw new AppError("Unauthorized", 401);
		}

		const result = await getUserKYCWithProfile(userId);

		res.status(200).json({
			success: true,
			data: result,
		});
	})
);

router.post(
	"/upload",
	upload.single("file"),
	asyncHandler(async (req: AuthRequest, res: Response) => {
		await uploadKycFile(req, res);
	})
);

router.post(
	"/me",
	asyncHandler(async (req: AuthRequest, res: Response) => {
		const userId = req.user?.uid;

		if (!userId) {
			throw new AppError("Unauthorized", 401);
		}

		const body = req.body as SubmitKYCParams;

		const requiredFields: (keyof SubmitKYCParams)[] = [
			"fullName",
			"dateOfBirth",
			"idNumber",
			"phone",
			"idDocumentURL",
			"financialDocumentURL",
		];

		for (const field of requiredFields) {
			if (!body[field] || typeof body[field] !== "string") {
				throw new AppError(`${field} is required`, 400);
			}
		}

		const kyc = await submitKYC(userId, body);

		res.status(201).json({
			success: true,
			message: "KYC verification submitted successfully",
			data: kyc,
		});
	})
);

router.post(
	"/otp/send",
	asyncHandler(async (req: AuthRequest, res: Response) => {
		await sendOtpHandler(req, res);
	})
);

router.post(
	"/otp/verify",
	asyncHandler(async (req: AuthRequest, res: Response) => {
		await verifyOtpHandler(req, res);
	})
);

router.use(requireAdmin);

router.get(
	"/pending",
	asyncHandler(async (req: AuthRequest, res: Response) => {
		const result = await getPendingKYC();

		res.status(200).json({
			success: true,
			data: result,
		});
	})
);

router.get(
	"/stats",
	asyncHandler(async (_req: AuthRequest, res: Response) => {
		const stats = await getKYCStats();

		res.status(200).json({
			success: true,
			data: stats,
		});
	})
);

router.get(
	"/:id",
	asyncHandler(async (req: AuthRequest, res: Response) => {
		const { id } = req.params;

		const { kyc, user } = await getUserWithKYC(id);

		res.status(200).json({
			success: true,
			data: {
				kyc,
				user: {
					id: user.id,
					email: user.email,
					displayName: user.displayName,
					photoURL: user.photoURL,
				},
			},
		});
	})
);

router.post(
	"/:id/approve",
	asyncHandler(async (req: AuthRequest, res: Response) => {
		const { id } = req.params;
		const adminId = req.user?.uid;

		if (!adminId) {
			throw new AppError("Unauthorized", 401);
		}

		const kyc = await approveKYC(id, adminId);

		res.status(200).json({
			success: true,
			message: "KYC verification approved",
			data: kyc,
		});
	})
);

router.post(
	"/:id/reject",
	asyncHandler(async (req: AuthRequest, res: Response) => {
		const { id } = req.params;
		const { reason } = req.body;
		const adminId = req.user?.uid;

		if (!adminId) {
			throw new AppError("Unauthorized", 401);
		}

		if (!reason || typeof reason !== "string") {
			throw new AppError("Rejection reason is required", 400);
		}

		const kyc = await rejectKYC(id, adminId, reason);

		res.status(200).json({
			success: true,
			message: "KYC verification rejected",
			data: kyc,
		});
	})
);

export default router;