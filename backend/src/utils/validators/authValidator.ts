import { z } from "zod";

export const registerSchema = z.object({
	email: z.string().email("Invalid email format"),
	password: z.string().min(6, "Password must be at least 6 characters"),
	displayName: z.string().max(100).optional(),
});

export const loginSchema = z.object({
	email: z.string().email("Invalid email format"),
	password: z.string().min(1, "Password is required"),
});

export const googleSignInSchema = z.object({
	idToken: z.string().min(1, "Google ID token is required"),
});

export const facebookSignInSchema = z.object({
	idToken: z.string().min(1, "Facebook access token is required"),
});

export const resendVerificationSchema = z.object({
	email: z.string().email("Invalid email format"),
});

export const verifyEmailSchema = z.object({
	oobCode: z.string().min(1, "Verification code is required"),
});

export const updateUserProfileSchema = z.object({
	displayName: z.string().max(100).optional(),
	photoURL: z.string().url().optional(),
	phone: z.string().max(20).optional(),
	bio: z.string().max(500).optional(),
});

export const changePasswordSchema = z.object({
	currentPassword: z.string().min(1, "Current password is required"),
	newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export const updateNotificationPrefsSchema = z.object({
	newRequest: z.boolean(),
	requestApproved: z.boolean(),
	newDonation: z.boolean(),
	newMessage: z.boolean(),
	weeklyReport: z.boolean(),
	systemAlerts: z.boolean(),
});

export const updateAppearanceSchema = z.object({
	darkMode: z.boolean(),
	compactView: z.boolean(),
	accentColor: z.string().regex(/^hsl\(/, "Invalid color format"),
});
