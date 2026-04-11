import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import { db } from "../config/firebase";
import { AppError } from "./errorHandler";

const usersCollection = db.collection("users");

export const requireAdmin = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		if (!req.user) {
			throw new AppError("Unauthorized", 401);
		}

		const userDoc = await usersCollection.doc(req.user.uid).get();

		if (!userDoc.exists) {
			throw new AppError("User profile not found", 404);
		}

		const userData = userDoc.data();
		if (userData?.role !== "admin") {
			throw new AppError("Forbidden: Admin access required", 403);
		}

		next();
	} catch (error) {
		next(error);
	}
};