import { Router, Response } from "express";
import { AuthRequest } from "../types";
import {
	getAllUsers,
	getUserById,
	getUserActivityHistory,
	updateUserRole,
	updateUserStatus,
	inviteUser,
	deleteUser,
} from "../controllers/adminController";
import { authenticate } from "../middleware/auth";
import { requireAdmin } from "../middleware/admin";
import { asyncHandler } from "../middleware/asyncHandler";
import { AppError } from "../middleware/errorHandler";

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

router.post(
	"/invite",
	asyncHandler(async (req: AuthRequest, res: Response) => {
		const { email, role } = req.body;
		const adminId = req.user?.uid;

		if (!adminId) {
			throw new AppError("Unauthorized", 401);
		}

		if (!email || !role) {
			throw new AppError("Email and role are required", 400);
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			throw new AppError("Invalid email format", 400);
		}

		if (role !== "visitor" && role !== "admin") {
			throw new AppError("Invalid role value", 400);
		}

		const adminName = req.user?.displayName || "Admin";
		const result = await inviteUser({
			email,
			role,
			adminId,
			adminName,
		});

		res.status(result.success ? 200 : 400).json({
			success: result.success,
			message: result.message,
		});
	})
);

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

router.delete(
	"/users/:id",
	asyncHandler(async (req: AuthRequest, res: Response) => {
		const { id } = req.params;
		const adminId = req.user?.uid;

		if (!adminId) {
			throw new AppError("Unauthorized", 401);
		}

		const result = await deleteUser(adminId, id);

		res.status(200).json({
			success: result.success,
			message: result.message,
		});
	})
);

export default router;
