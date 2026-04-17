import { Router, Response } from "express";
import { AuthRequest } from "../types";
import {
	getAllUsers,
	getUserById,
	getUserActivityHistory,
	updateUserRole,
	updateUserStatus,
} from "../controllers/adminController";
import { authenticate } from "../middleware/auth";
import { requireAdmin } from "../middleware/admin";
import { asyncHandler } from "../middleware/asyncHandler";
import { AppError } from "../middleware/errorHandler";

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

router.get(
	"/users",
	asyncHandler(async (req: AuthRequest, res: Response) => {
		const { search, role, status, page, limit } = req.query;

		const result = await getAllUsers({
			search: search as string,
			role: role as string,
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

router.get(
	"/users/:id",
	asyncHandler(async (req: AuthRequest, res: Response) => {
		const { id } = req.params;

		const user = await getUserById(id);
		const activity = await getUserActivityHistory(id);

		res.status(200).json({
			success: true,
			data: {
				user,
				activity,
			},
		});
	})
);

router.put(
	"/users/:id",
	asyncHandler(async (req: AuthRequest, res: Response) => {
		const { id } = req.params;
		const { role, accountStatus } = req.body;
		const adminId = req.user?.uid;

		if (!adminId) {
			throw new AppError("Unauthorized", 401);
		}

		if (!role && !accountStatus) {
			throw new AppError("No valid fields to update", 400);
		}

		let updatedUser;

		if (role) {
			if (role !== "visitor" && role !== "admin") {
				throw new AppError("Invalid role value", 400);
			}
			updatedUser = await updateUserRole(adminId, id, role);
		}

		if (accountStatus) {
			if (accountStatus !== "active" && accountStatus !== "suspended") {
				throw new AppError("Invalid status value", 400);
			}
			updatedUser = await updateUserStatus(adminId, id, accountStatus);
		}

		res.status(200).json({
			success: true,
			data: updatedUser,
			message: "User updated successfully",
		});
	})
);

export default router;
