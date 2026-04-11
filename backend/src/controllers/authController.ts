import { Response } from "express";
import { auth, db } from "../config/firebase";
import { AuthRequest, ApiResponse, User } from "../types";
import { AppError } from "../middleware/errorHandler";

const usersCollection = db.collection("users");

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
	const { email, password, displayName } = req.body;

	const existingUsers = await usersCollection.where("email", "==", email.toLowerCase()).get();
	if (!existingUsers.empty) {
		const response: ApiResponse = {
			success: false,
			message: "An account with this email already exists. Would you like to log in instead?",
		};
		res.status(400).json(response);
		return;
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
		role: "visitor",
		accountStatus: "active",
		authProvider: "email",
		emailVerified: false,
		isKycVerified: false,
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	await usersCollection.doc(userRecord.uid).set(userData);

	const verificationLink = await auth.generateEmailVerificationLink(email);
	console.log(`Verification link for ${email}: ${verificationLink}`);

	const response: ApiResponse = {
		success: true,
		message: "Registration successful. Please check your email to verify your account.",
	};

	res.status(201).json(response);
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
	const { email, password } = req.body;

	const firebaseApiKey = process.env.FIREBASE_API_KEY;
	if (!firebaseApiKey) {
		throw new AppError("Firebase API key not configured", 500);
	}

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
		}
	);

	const data = (await response.json()) as {
		error?: { message?: string };
		localId?: string;
	};

	if (!response.ok) {
		if (data.error?.message === "INVALID_PASSWORD") {
			throw new AppError(
				'Incorrect email or password. Try again or click "Forgot Password".',
				401
			);
		}
		if (data.error?.message === "EMAIL_NOT_FOUND") {
			throw new AppError("User not found", 404);
		}
		throw new AppError("Login failed", 401);
	}

	if (!data.localId) {
		throw new AppError("Login failed", 401);
	}

	const uid = data.localId;
	const userDoc = await usersCollection.doc(uid).get();

	if (!userDoc.exists) {
		throw new AppError("User profile not found", 404);
	}

	const userData = userDoc.data() as User;
	if (!userData.emailVerified) {
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

	await usersCollection.doc(uid).update({
		loginCount: (userData.loginCount || 0) + 1,
		lastLoginAt: new Date(),
		updatedAt: new Date(),
	});

	const customToken = await auth.createCustomToken(uid);
	const user: User = { id: userDoc.id, ...userData, loginCount: (userData.loginCount || 0) + 1 };

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

	const { displayName } = req.body;
	const updateData: Partial<User> = {
		updatedAt: new Date(),
	};

	if (displayName) updateData.displayName = displayName;

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

	const response: ApiResponse = {
		success: true,
		message: "Verification email sent. Please check your inbox.",
	};

	res.status(200).json(response);
};

export const verifyEmail = async (req: AuthRequest, res: Response): Promise<void> => {
	const { oobCode } = req.body;

	try {
		await auth.verifyIdToken(oobCode);
	} catch {
		throw new AppError("Invalid or expired verification code", 400);
	}

	const response: ApiResponse = {
		success: true,
		message: "Email verified successfully. You can now log in.",
	};

	res.status(200).json(response);
};
