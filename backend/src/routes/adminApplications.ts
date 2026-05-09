import { Router, Response } from "express";
import { AuthRequest } from "../types";
import {
	getAllAdminApplications,
	updateAdminApplicationStatus,
} from "../controllers/adminApplicationsController";
import { authenticate } from "../middleware/auth";
import { requireAdmin } from "../middleware/admin";
import { asyncHandler } from "../middleware/asyncHandler";
import { AppError } from "../middleware/errorHandler";

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

router.get(
	"/",
	asyncHandler(async (req: AuthRequest, res: Response) => {
		const { status, page, limit } = req.query;

		const result = await getAllAdminApplications({
			status: status as string,
			page: page ? parseInt(page as string, 10) : 1,
			limit: limit ? parseInt(limit as string, 10) : 20,
		});

		res.status(200).json({
			success: true,
			data: result,
		});
	})
);

router.put(
	"/:id/status",
	asyncHandler(async (req: AuthRequest, res: Response) => {
		const { id } = req.params;
		const { status, adminNote } = req.body;
		const adminId = req.user?.uid;

		if (!adminId) {
			throw new AppError("Unauthorized", 401);
		}

		const validStatuses = ["pending", "approved", "rejected", "completed"];
		if (!status || !validStatuses.includes(status)) {
			throw new AppError("Invalid status", 400);
		}

		const updated = await updateAdminApplicationStatus(
			id,
			status,
			adminId,
			adminNote
		);

		res.status(200).json({
			success: true,
			data: updated,
			message: `Application ${status} successfully`,
		});
	})
);

export default router;