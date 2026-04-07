import { Response, NextFunction } from "express";
import { auth } from "../config/firebase";
import { AuthRequest } from "../types";
import jwt from "jsonwebtoken";

const isCustomToken = (token: string): boolean => {
	try {
		const decoded = jwt.decode(token);
		return !!(decoded && typeof decoded === "object" && "uid" in decoded);
	} catch {
		return false;
	}
};

export const authenticate = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const authHeader = req.headers.authorization;

		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			res.status(401).json({
				success: false,
				error: "No token provided",
			});
			return;
		}

		const token = authHeader.split("Bearer ")[1];

		if (isCustomToken(token)) {
			const decoded = jwt.decode(token) as jwt.JwtPayload;
			const uid = decoded?.uid;

			if (!uid) {
				res.status(401).json({
					success: false,
					error: "Invalid token",
				});
				return;
			}

			try {
				const userRecord = await auth.getUser(uid);
				req.user = {
					uid: userRecord.uid,
					email: userRecord.email || undefined,
				};
				next();
			} catch {
				res.status(401).json({
					success: false,
					error: "Invalid token",
				});
			}
			return;
		}

		try {
			const decodedToken = await auth.verifyIdToken(token);
			req.user = {
				uid: decodedToken.uid,
				email: decodedToken.email,
			};
			next();
		} catch {
			res.status(401).json({
				success: false,
				error: "Invalid token",
			});
		}
	} catch {
		res.status(401).json({
			success: false,
			error: "Invalid token",
		});
	}
};

export const optionalAuth = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const authHeader = req.headers.authorization;

		if (authHeader && authHeader.startsWith("Bearer ")) {
			const token = authHeader.split("Bearer ")[1];

			if (isCustomToken(token)) {
				const decoded = jwt.decode(token) as jwt.JwtPayload;
				const uid = decoded?.uid;

				if (uid) {
					try {
						const userRecord = await auth.getUser(uid);
						req.user = {
							uid: userRecord.uid,
							email: userRecord.email || undefined,
						};
					} catch {
						// Ignore
					}
				}
			} else {
				try {
					const decodedToken = await auth.verifyIdToken(token);
					req.user = {
						uid: decodedToken.uid,
						email: decodedToken.email,
					};
				} catch {
					// Ignore
				}
			}
		}
	} catch {
		// Ignore
	}
	next();
};
