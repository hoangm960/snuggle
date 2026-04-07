import { z } from "zod";

export const registerSchema = z.object({
	email: z.string().email("Invalid email format"),
	password: z.string().min(6, "Password must be at least 6 characters"),
	displayName: z.string().max(100).optional(),
	role: z.enum(["visitor", "admin"]).default("visitor"),
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
	role: z.enum(["visitor", "admin"]).optional(),
});
