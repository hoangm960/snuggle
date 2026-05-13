import { Response } from "express";
import { auth, db, storage } from "../config/firebase";
import { AuthRequest, ApiResponse, User, NotificationPrefs, AppearancePrefs } from "../types";
import { AppError } from "../middleware/errorHandler";
import { validateInviteToken, deleteInvite } from "./adminController";
import { sendVerificationEmail } from "../services/emailService";

const usersCollection = db.collection("users");

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
	const { email, password, displayName, inviteToken } = req.body;

	const existingUsers = await usersCollection.where("email", "==", email.toLowerCase()).get();
	if (!existingUsers.empty) {
		const response: ApiResponse = {
			success: false,
			message: "An account with this email already exists. Would you like to log in instead?",
		};
		res.status(400).json(response);
		return;
	}

	let role: "visitor" | "admin" = "visitor";

	if (inviteToken) {
		const invite = await validateInviteToken(inviteToken);
		if (invite && invite.email === email.toLowerCase()) {
			role = invite.role;
			await deleteInvite(inviteToken);
		}
	}

	const userRecord = await auth.createUser({
		email,
		password,
		displayName: displayName || "",
		emailVerified: false,
	});

	const userData: Omit<User, "id"> = {
		email,
		displayName: displayName || "",
		role,
		accountStatus: "active",
		authProvider: "email",
		emailVerified: false,
		isKycVerified: false,
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	await usersCollection.doc(userRecord.uid).set(userData);

	const verificationLink = await auth.generateEmailVerificationLink(email);

	sendVerificationEmail({
		to: email,
		displayName: displayName || "",
		verificationLink,
	}).catch((err) => {
		console.error(`Failed to send verification email to ${email}:`, err.message);
	});

	const response: ApiResponse = {
		success: true,
		message:
			role === "admin"
				? "Registration successful. Welcome to Snuggles Admin!"
				: "Registration successful. Please check your email to verify your account.",
	};

	res.status(201).json(response);
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
	const { email, password } = req.body;

	const firebaseApiKey = process.env.FIREBASE_API_KEY;
	if (!firebaseApiKey) {
		throw new AppError("Firebase API key not configured", 500);
	}

	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), 10000);

	const response = await fetch(
		`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseApiKey}`,
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				email,
				password,
				returnSecureToken: true,
			}),
			signal: controller.signal,
		}
	);

	clearTimeout(timeoutId);

	const data = (await response.json()) as {
		error?: { message?: string };
		localId?: string;
	};

	if (!response.ok) {
		const firebaseError = data.error?.message;
		console.error("Firebase login error:", firebaseError);

		switch (firebaseError) {
			case "INVALID_PASSWORD":
				throw new AppError(
					'Incorrect email or password. Try again or click "Forgot Password".',
					401
				);
			case "EMAIL_NOT_FOUND":
				throw new AppError("User not found", 404);
			case "USER_DISABLED":
				throw new AppError("This account has been disabled", 403);
			case "TOO_MANY_ATTEMPTS":
				throw new AppError("Too many login attempts. Please try again later.", 429);
			case "NETWORK_REQUEST_FAILED":
				throw new AppError("Network error. Please check your connection.", 500);
			default:
				console.error("Unknown Firebase login error:", data);
				throw new AppError("Login failed", 401);
		}
	}

	if (!data.localId) {
		console.error("Firebase login response missing localId:", data);
		throw new AppError("Login failed: Invalid response from authentication service", 401);
	}

	const uid = data.localId;
	const userDoc = await usersCollection.doc(uid).get();

	if (!userDoc.exists) {
		throw new AppError("User profile not found", 404);
	}

	const userData = userDoc.data() as User;

	const firebaseUser = await auth.getUser(uid);
	if (!firebaseUser.emailVerified) {
		const response: ApiResponse = {
			success: false,
			emailVerificationRequired: true,
			message: "Please verify your email before logging in.",
		};
		res.status(403).json(response);
		return;
	}

	if (userData.accountStatus === "suspended") {
		const response: ApiResponse = {
			success: false,
			message: "Your account has been suspended. Please contact an administrator.",
		};
		res.status(403).json(response);
		return;
	}

	usersCollection
		.doc(uid)
		.update({
			loginCount: (userData.loginCount || 0) + 1,
			lastLoginAt: new Date(),
			updatedAt: new Date(),
		})
		.catch(() => {});

	const customToken = await auth.createCustomToken(uid);
	const user: User = {
		id: userDoc.id,
		...userData,
		emailVerified: firebaseUser.emailVerified,
		loginCount: (userData.loginCount || 0) + 1,
	};

	const apiResponse: ApiResponse<{ user: User; token: string }> = {
		success: true,
		data: {
			user,
			token: customToken,
		},
		message: "Login successful",
	};

	res.status(200).json(apiResponse);
};

export const googleSignIn = async (req: AuthRequest, res: Response): Promise<void> => {
	const { idToken } = req.body;

	const decodedToken = await auth.verifyIdToken(idToken, true);
	const uid = decodedToken.uid;
	const email = decodedToken.email || "";
	const displayName = decodedToken.name || decodedToken.displayName || "";
	const photoURL = decodedToken.picture || decodedToken.photoURL || "";

	let userDoc = await usersCollection.doc(uid).get();
	let user: User;

	if (!userDoc.exists) {
		const userData: Omit<User, "id"> = {
			email,
			displayName,
			photoURL,
			role: "visitor",
			accountStatus: "active",
			authProvider: "google",
			emailVerified: true,
			isKycVerified: false,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		await usersCollection.doc(uid).set(userData);
		user = { id: uid, ...userData };
	} else {
		const userData = userDoc.data() as User;
		if (userData.accountStatus === "suspended") {
			const response: ApiResponse = {
				success: false,
				message: "Your account has been suspended. Please contact an administrator.",
			};
			res.status(403).json(response);
			return;
		}

		await usersCollection.doc(uid).update({
			loginCount: (userData.loginCount || 0) + 1,
			lastLoginAt: new Date(),
			updatedAt: new Date(),
		});
		user = { id: userDoc.id, ...userData, loginCount: (userData.loginCount || 0) + 1 };
	}

	const customToken = await auth.createCustomToken(uid);

	const response: ApiResponse<{ user: User; token: string }> = {
		success: true,
		data: {
			user,
			token: customToken,
		},
		message: "Google sign-in successful",
	};

	res.status(200).json(response);
};

export const createUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
	if (!req.user) {
		throw new AppError("Unauthorized", 401);
	}

	const { displayName, photoURL } = req.body;

	const userDoc = await usersCollection.doc(req.user.uid).get();

	let user: User;

	if (!userDoc.exists) {
		const userData: Omit<User, "id"> = {
			email: req.user.email || "",
			displayName: displayName || "",
			photoURL: photoURL || "",
			role: "visitor",
			accountStatus: "active",
			authProvider: "email",
			emailVerified: true,
			isKycVerified: false,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		await usersCollection.doc(req.user.uid).set(userData);
		user = { id: req.user.uid, ...userData };

		const response: ApiResponse<User> = {
			success: true,
			data: user,
			message: "User profile created successfully",
		};

		res.status(201).json(response);
	} else {
		const updateData: Partial<User> = {
			updatedAt: new Date(),
		};

		if (displayName) updateData.displayName = displayName;
		if (photoURL) updateData.photoURL = photoURL;

		await usersCollection.doc(req.user.uid).update(updateData);

		const updatedDoc = await usersCollection.doc(req.user.uid).get();
		user = { id: updatedDoc.id, ...updatedDoc.data() } as User;

		const response: ApiResponse<User> = {
			success: true,
			data: user,
			message: "User profile updated successfully",
		};

		res.status(200).json(response);
	}
};

export const verifyToken = async (req: AuthRequest, res: Response): Promise<void> => {
	if (!req.user) {
		throw new AppError("Unauthorized", 401);
	}

	const userDoc = await usersCollection.doc(req.user.uid).get();

	let user: User | null = null;
	if (userDoc.exists) {
		user = { id: userDoc.id, ...userDoc.data() } as User;
	}

	const response: ApiResponse<{ uid: string; email?: string; user?: User }> = {
		success: true,
		data: {
			uid: req.user.uid,
			email: req.user.email,
			user: user || undefined,
		},
	};

	res.status(200).json(response);
};

export const getUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
	if (!req.user) {
		throw new AppError("Unauthorized", 401);
	}

	const userDoc = await usersCollection.doc(req.user.uid).get();

	if (!userDoc.exists) {
		throw new AppError("User profile not found", 404);
	}

	const user: User = { id: userDoc.id, ...userDoc.data() } as User;

	const response: ApiResponse<User> = {
		success: true,
		data: user,
	};

	res.status(200).json(response);
};

export const updateUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
	if (!req.user) {
		throw new AppError("Unauthorized", 401);
	}

	const { displayName, phone, bio } = req.body;
	const updateData: Partial<User> = {
		updatedAt: new Date(),
	};

	if (displayName !== undefined) updateData.displayName = displayName;
	if (phone !== undefined) updateData.phone = phone;
	if (bio !== undefined) updateData.bio = bio;

	await usersCollection.doc(req.user.uid).update(updateData);

	const updatedDoc = await usersCollection.doc(req.user.uid).get();
	const user: User = { id: updatedDoc.id, ...updatedDoc.data() } as User;

	const response: ApiResponse<User> = {
		success: true,
		data: user,
		message: "User profile updated successfully",
	};

	res.status(200).json(response);
};

export const deleteUserAccount = async (req: AuthRequest, res: Response): Promise<void> => {
	if (!req.user) {
		throw new AppError("Unauthorized", 401);
	}

	await usersCollection.doc(req.user.uid).delete();
	await auth.deleteUser(req.user.uid);

	const response: ApiResponse = {
		success: true,
		message: "User account deleted successfully",
	};

	res.status(200).json(response);
};

export const facebookSignIn = async (req: AuthRequest, res: Response): Promise<void> => {
	const { idToken } = req.body;

	const decodedToken = await auth.verifyIdToken(idToken, true);
	const uid = decodedToken.uid;
	const email = decodedToken.email || "";
	const displayName = decodedToken.name || decodedToken.displayName || "";

	let userDoc = await usersCollection.doc(uid).get();
	let user: User;

	if (!userDoc.exists) {
		const userData: Omit<User, "id"> = {
			email,
			displayName,
			role: "visitor",
			accountStatus: "active",
			authProvider: "facebook",
			emailVerified: true,
			isKycVerified: false,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		await usersCollection.doc(uid).set(userData);
		user = { id: uid, ...userData };
	} else {
		const userData = userDoc.data() as User;
		if (userData.accountStatus === "suspended") {
			const response: ApiResponse = {
				success: false,
				message: "Your account has been suspended. Please contact an administrator.",
			};
			res.status(403).json(response);
			return;
		}

		await usersCollection.doc(uid).update({
			loginCount: (userData.loginCount || 0) + 1,
			lastLoginAt: new Date(),
			updatedAt: new Date(),
		});
		user = { id: userDoc.id, ...userData, loginCount: (userData.loginCount || 0) + 1 };
	}

	const customToken = await auth.createCustomToken(uid);

	const response: ApiResponse<{ user: User; token: string }> = {
		success: true,
		data: {
			user,
			token: customToken,
		},
		message: "Facebook sign-in successful",
	};

	res.status(200).json(response);
};

export const resendVerification = async (req: AuthRequest, res: Response): Promise<void> => {
	const { email } = req.body;

	const existingUsers = await usersCollection.where("email", "==", email.toLowerCase()).get();

	if (existingUsers.empty) {
		throw new AppError("No account found with this email", 404);
	}

	const userDoc = existingUsers.docs[0];
	const userData = userDoc.data() as User;

	if (userData.emailVerified) {
		const response: ApiResponse = {
			success: true,
			message: "This email is already verified. You can log in now.",
		};
		res.status(200).json(response);
		return;
	}

	const verificationLink = await auth.generateEmailVerificationLink(email);
	console.log(`Verification link for ${email}: ${verificationLink}`);

	await sendVerificationEmail({
		to: email,
		displayName: userData.displayName || "",
		verificationLink,
	});

	const response: ApiResponse = {
		success: true,
		message: "Verification email sent. Please check your inbox.",
	};

	res.status(200).json(response);
};

export const verifyEmail = async (req: AuthRequest, res: Response): Promise<void> => {
	const { oobCode } = req.body;

	const firebaseApiKey = process.env.FIREBASE_API_KEY;
	if (!firebaseApiKey) {
		throw new AppError("Firebase API key not configured", 500);
	}

	const response = await fetch(
		`https://identitytoolkit.googleapis.com/v1/accounts:update?key=${firebaseApiKey}`,
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ oobCode }),
		}
	);

	const data = (await response.json()) as {
		error?: { message?: string };
		localId?: string;
		email?: string;
	};

	if (!response.ok) {
		if (
			data.error?.message === "INVALID_OOB_CODE" ||
			data.error?.message === "EXPIRED_OOB_CODE"
		) {
			throw new AppError("Invalid or expired verification code", 400);
		}
		throw new AppError("Email verification failed", 400);
	}

	if (!data.localId) {
		throw new AppError("Email verification failed", 400);
	}

	await usersCollection.doc(data.localId).update({
		emailVerified: true,
		updatedAt: new Date(),
	});

	const apiResponse: ApiResponse = {
		success: true,
		message: "Email verified successfully. You can now log in.",
	};

	res.status(200).json(apiResponse);
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
	if (!req.user) {
		throw new AppError("Unauthorized", 401);
	}

	const { currentPassword, newPassword } = req.body;

	const userRecord = await auth.getUser(req.user.uid);
	if (userRecord.providerData.some((p) => p.providerId === "password")) {
		const firebaseApiKey = process.env.FIREBASE_API_KEY;
		if (!firebaseApiKey) {
			throw new AppError("Firebase API key not configured", 500);
		}

		const verifyRes = await fetch(
			`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseApiKey}`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: userRecord.email,
					password: currentPassword,
					returnSecureToken: true,
				}),
			}
		);

		const verifyData = (await verifyRes.json()) as { error?: { message?: string } };
		if (!verifyRes.ok) {
			if (verifyData.error?.message === "INVALID_PASSWORD") {
				throw new AppError("Current password is incorrect", 400);
			}
			throw new AppError("Failed to verify current password", 400);
		}
	}

	await auth.updateUser(req.user.uid, { password: newPassword });

	const response: ApiResponse = {
		success: true,
		message: "Password changed successfully",
	};

	res.status(200).json(response);
};

export const updateNotificationPrefs = async (req: AuthRequest, res: Response): Promise<void> => {
	if (!req.user) {
		throw new AppError("Unauthorized", 401);
	}

	const prefs = req.body as NotificationPrefs;
	await usersCollection.doc(req.user.uid).update({
		notificationPrefs: prefs,
		updatedAt: new Date(),
	});

	const response: ApiResponse<{ notificationPrefs: NotificationPrefs }> = {
		success: true,
		data: { notificationPrefs: prefs },
		message: "Notification preferences updated",
	};

	res.status(200).json(response);
};

export const updateAppearance = async (req: AuthRequest, res: Response): Promise<void> => {
	if (!req.user) {
		throw new AppError("Unauthorized", 401);
	}

	const appearance = req.body as AppearancePrefs;
	await usersCollection.doc(req.user.uid).update({
		appearance,
		updatedAt: new Date(),
	});

	const response: ApiResponse<{ appearance: AppearancePrefs }> = {
		success: true,
		data: { appearance },
		message: "Appearance settings updated",
	};

	res.status(200).json(response);
};

export const uploadAvatar = async (req: AuthRequest, res: Response): Promise<void> => {
	if (!req.user) {
		throw new AppError("Unauthorized", 401);
	}

	const file = req.file;
	if (!file) {
		throw new AppError("No file provided", 400);
	}

	const bucket = storage.bucket();
	const timestamp = Date.now();
	const ext = file.originalname.split(".").pop() || "jpg";
	const filename = `avatars/${req.user.uid}/${timestamp}.${ext}`;

	const blob = bucket.file(filename);
	const blobStream = blob.createWriteStream({
		metadata: {
			contentType: file.mimetype,
			cacheControl: "public, max-age=31536000",
		},
	});

	await new Promise<void>((resolve, reject) => {
		blobStream.on("error", reject);
		blobStream.on("finish", async () => {
			try {
				await blob.makePublic();
				resolve();
			} catch (err) {
				reject(err);
			}
		});
		blobStream.end(file.buffer);
	});

	const photoURL = `https://storage.googleapis.com/${bucket.name}/${filename}`;

	await usersCollection.doc(req.user.uid).update({
		photoURL,
		updatedAt: new Date(),
	});

	const response: ApiResponse<{ photoURL: string }> = {
		success: true,
		data: { photoURL },
		message: "Avatar uploaded successfully",
	};

	res.status(200).json(response);
};
