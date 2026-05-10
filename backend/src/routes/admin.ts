import { Router, Response } from "express";
import { AuthRequest, Review } from "../types";
import {
	getAllUsers,
	getUserById,
	getUserActivityHistory,
	updateUserRole,
	updateUserStatus,
	inviteUser,
	deleteUser,
} from "../controllers/adminController";
import {
	getAllChats,
	getChatMessages,
	getPendingChats,
	acceptChat,
} from "../controllers/chatController";
import { authenticate } from "../middleware/auth";
import { requireAdmin } from "../middleware/admin";
import { asyncHandler } from "../middleware/asyncHandler";
import { AppError } from "../middleware/errorHandler";
import { validate } from "../middleware/validate";
import { inviteUserSchema, updateUserSchema, updateReviewStatusSchema } from "../utils/validators/otherValidator";
import { db } from "../config/firebase";

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

router.post(
	"/invite",
	validate(inviteUserSchema),
	asyncHandler(async (req: AuthRequest, res: Response) => {
		const { email, role } = req.body;
		const adminId = req.user?.uid;

		if (!adminId) {
			throw new AppError("Unauthorized", 401);
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
	validate(updateUserSchema),
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
			updatedUser = await updateUserRole(adminId, id, role);
		}

		if (accountStatus) {
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

router.get(
	"/chats",
	asyncHandler(async (req: AuthRequest, res: Response) => {
		const { limit } = req.query;

		const chats = await getAllChats({
			limit: limit ? parseInt(limit as string, 10) : 20,
		});

		res.status(200).json({
			success: true,
			data: chats,
		});
	})
);

router.get(
	"/chats/pending",
	asyncHandler(async (req: AuthRequest, res: Response) => {
		const chats = await getPendingChats();

		res.status(200).json({
			success: true,
			data: chats,
		});
	})
);

router.get(
	"/chats/:id/messages",
	asyncHandler(async (req: AuthRequest, res: Response) => {
		const { id } = req.params;
		const { limit } = req.query;

		const messages = await getChatMessages({
			chatId: id,
			limit: limit ? parseInt(limit as string, 10) : 50,
		});

		res.status(200).json({
			success: true,
			data: messages,
		});
	})
);

router.post(
	"/chats/:id/accept",
	asyncHandler(async (req: AuthRequest, res: Response) => {
		await acceptChat(req, res);

		res.status(200).json({
			success: true,
			message: "Chat claimed successfully",
		});
	})
);

router.get(
	"/reviews",
	asyncHandler(async (req: AuthRequest, res: Response) => {
		const { status } = req.query;

		let query: FirebaseFirestore.Query = db.collectionGroup("reviews");

		if (status) {
			query = query.where("status", "==", status);
		}

		const snapshot = await query.orderBy("createdAt", "desc").get();

		const userIds = new Set<string>();
		snapshot.forEach((doc) => {
			const data = doc.data();
			if (data.reviewerId) userIds.add(data.reviewerId);
		});

		const userMap: Record<string, { displayName: string; email: string }> = {};
		await Promise.all(
			Array.from(userIds).map(async (uid) => {
				try {
					const userDoc = await db.collection("users").doc(uid).get();
					if (userDoc.exists) {
						const u = userDoc.data()!;
						userMap[uid] = { displayName: u.displayName || "", email: u.email || "" };
					}
				} catch {
					// skip
				}
			})
		);

		const reviews: Review[] = [];
		snapshot.forEach((doc) => {
			const data = doc.data();
			const shelterId = doc.ref.parent.parent?.id;
			const reviewer = userMap[data.reviewerId] || {};
			reviews.push({
				id: doc.id,
				shelterId,
				reviewerName: reviewer.displayName,
				reviewerEmail: reviewer.email,
				...data,
			} as Review);
		});

		res.status(200).json({ success: true, data: reviews });
	})
);

router.put(
	"/reviews/:shelterId/:id/status",
	validate(updateReviewStatusSchema),
	asyncHandler(async (req: AuthRequest, res: Response) => {
		const { shelterId, id } = req.params;
		const { status } = req.body;

		const reviewRef = db.collection("shelters").doc(shelterId).collection("reviews").doc(id);
		const doc = await reviewRef.get();

		if (!doc.exists) {
			throw new AppError("Review not found", 404);
		}

		await reviewRef.update({ status });

		if (status === "approved") {
			const snapshot = await db
				.collection("shelters")
				.doc(shelterId)
				.collection("reviews")
				.where("status", "==", "approved")
				.get();

			let totalRating = 0;
			let count = 0;
			snapshot.forEach((d) => {
				totalRating += d.data().rating;
				count++;
			});

			const trustScore = count > 0 ? totalRating / count : 0;
			await db.collection("shelters").doc(shelterId).update({
				trustScore: Math.round(trustScore * 10) / 10,
				totalReviews: count,
			});
		}

		const updated = await reviewRef.get();
		const review: Review = { id: updated.id, shelterId, ...updated.data() } as Review;

		res.status(200).json({ success: true, data: review, message: `Review ${status} successfully` });
	})
);

export default router;
