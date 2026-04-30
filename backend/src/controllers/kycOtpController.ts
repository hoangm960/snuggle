import { Response } from "express";
import { db } from "../config/firebase";
import { AuthRequest } from "../types";
import { AppError } from "../middleware/errorHandler";
import { generateAndSendOtp, verifyOtpCode } from "../services/otpService";

const usersCollection = db.collection("users");

export const sendOtpHandler = async (req: AuthRequest, res: Response): Promise<void> => {
	const userId = req.user?.uid;

	if (!userId) {
		throw new AppError("Unauthorized", 401);
	}

	const userDoc = await usersCollection.doc(userId).get();

	if (!userDoc.exists) {
		throw new AppError("User profile not found", 404);
	}

	const userData = userDoc.data();

	if (!userData?.email) {
		throw new AppError("No email associated with this account", 400);
	}

	await generateAndSendOtp(
		userId,
		userData.email,
		userData.displayName || "User"
	);

	res.status(200).json({
		success: true,
		message: "Verification code sent to your email",
	});
};

export const verifyOtpHandler = async (req: AuthRequest, res: Response): Promise<void> => {
	const userId = req.user?.uid;

	if (!userId) {
		throw new AppError("Unauthorized", 401);
	}

	const { code } = req.body;

	if (!code || typeof code !== "string") {
		throw new AppError("Verification code is required", 400);
	}

	const isValid = await verifyOtpCode(userId, code);

	if (!isValid) {
		throw new AppError("Invalid or expired verification code", 400);
	}

	res.status(200).json({
		success: true,
		message: "Verification code confirmed",
	});
};
