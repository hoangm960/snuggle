import { db } from "../config/firebase";
import { sendOtpEmail } from "./emailService";

const otpCollection = db.collection("kycOtpTokens");

const OTP_EXPIRY_MINUTES = 10;

export const generateAndSendOtp = async (
	userId: string,
	email: string,
	displayName: string
): Promise<void> => {
	const existingSnapshot = await otpCollection
		.where("userId", "==", userId)
		.where("expiresAt", ">", new Date())
		.limit(1)
		.get();

	if (!existingSnapshot.empty) {
		throw new Error("A valid OTP code is already active. Please check your email.");
	}

	const expiredSnapshot = await otpCollection
		.where("userId", "==", userId)
		.where("expiresAt", "<=", new Date())
		.get();

	for (const doc of expiredSnapshot.docs) {
		await doc.ref.delete();
	}

	const code = Math.floor(100000 + Math.random() * 900000).toString();
	const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

	await otpCollection.add({
		userId,
		code,
		email,
		expiresAt,
		createdAt: new Date(),
	});

	try {
		await sendOtpEmail({ to: email, displayName, code });
	} catch (error) {
		console.error("Failed to send OTP email, cleaning up token:", error);
		const cleanupSnapshot = await otpCollection
			.where("userId", "==", userId)
			.where("code", "==", code)
			.limit(1)
			.get();

		for (const doc of cleanupSnapshot.docs) {
			await doc.ref.delete();
		}
		throw new Error("Failed to send verification code email");
	}
};

export const verifyOtpCode = async (
	userId: string,
	code: string
): Promise<boolean> => {
	const snapshot = await otpCollection
		.where("userId", "==", userId)
		.where("code", "==", code)
		.where("expiresAt", ">", new Date())
		.limit(1)
		.get();

	if (snapshot.empty) {
		return false;
	}

	await snapshot.docs[0].ref.delete();

	return true;
};
