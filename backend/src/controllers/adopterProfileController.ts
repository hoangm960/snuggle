import { Response } from "express";
import { db } from "../config/firebase";
import { AdopterProfile, AuthRequest, ApiResponse } from "../types";
import { AppError } from "../middleware/errorHandler";
import { errorLogger } from "../utils/logger";

const getAdopterProfileCollection = (userId: string) =>
	db.collection("users").doc(userId).collection("adopterProfile");

export const getAdopterProfile = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		if (!req.user) {
			throw new AppError("Unauthorized", 401);
		}

		const snapshot = await getAdopterProfileCollection(req.user.uid).limit(1).get();

		let profile: AdopterProfile | null = null;
		snapshot.forEach((doc) => {
			profile = { id: doc.id, userId: req.user?.uid, ...doc.data() } as AdopterProfile;
		});

		const response: ApiResponse<AdopterProfile | null> = {
			success: true,
			data: profile,
		};

		res.status(200).json(response);
	} catch (err) {
		errorLogger.error({ message: (err as Error).message, stack: (err as Error).stack });
		res.status(500).json({ success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch adopter profile" } });
	}
};

export const createAdopterProfile = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		if (!req.user) {
			throw new AppError("Unauthorized", 401);
		}

		const existingSnapshot = await getAdopterProfileCollection(req.user.uid).limit(1).get();
		if (!existingSnapshot.empty) {
			throw new AppError("Adopter profile already exists", 400);
		}

		const profileData: Omit<AdopterProfile, "id"> = {
			userId: req.user.uid,
			homeType: req.body.homeType,
			hasChildren: req.body.hasChildren,
			hasOtherPets: req.body.hasOtherPets,
			activityLevel: req.body.activityLevel,
			preferredPetSize: req.body.preferredPetSize,
			preferredSpecies: req.body.preferredSpecies,
			locationName: req.body.locationName,
			geoPoint: req.body.geoPoint,
			lifestyleAnswers: req.body.lifestyleAnswers,
			updatedAt: new Date(),
		};

		const docRef = await getAdopterProfileCollection(req.user.uid).add(profileData);
		const profile: AdopterProfile = { id: docRef.id, ...profileData };

		const response: ApiResponse<AdopterProfile> = {
			success: true,
			data: profile,
			message: "Adopter profile created successfully",
		};

		res.status(201).json(response);
	} catch (error) {
		if (error instanceof AppError) throw error;
		throw new AppError("Failed to create adopter profile", 500);
	}
};

export const updateAdopterProfile = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		if (!req.user) {
			throw new AppError("Unauthorized", 401);
		}

		const snapshot = await getAdopterProfileCollection(req.user.uid).limit(1).get();

		if (snapshot.empty) {
			throw new AppError("Adopter profile not found", 404);
		}

		const docId = snapshot.docs[0].id;
		const updateData = {
			...req.body,
			updatedAt: new Date(),
		};

		delete updateData.id;
		delete updateData.userId;
		delete updateData.completedAt;

		await getAdopterProfileCollection(req.user.uid).doc(docId).update(updateData);

		const updatedDoc = await getAdopterProfileCollection(req.user.uid).doc(docId).get();
		const profile: AdopterProfile = {
			id: updatedDoc.id,
			...updatedDoc.data(),
		} as AdopterProfile;

		const response: ApiResponse<AdopterProfile> = {
			success: true,
			data: profile,
			message: "Adopter profile updated successfully",
		};

		res.status(200).json(response);
	} catch (error) {
		if (error instanceof AppError) throw error;
		throw new AppError("Failed to update adopter profile", 500);
	}
};
