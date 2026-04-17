import { Response } from "express";
import { db } from "../config/firebase";
import { SavedSearch, AuthRequest, ApiResponse } from "../types";
import { AppError } from "../middleware/errorHandler";
import { errorLogger } from "../utils/logger";

const getSavedSearchesCollection = (userId: string) =>
	db.collection("users").doc(userId).collection("savedSearches");

export const getSavedSearches = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		if (!req.user) {
			throw new AppError("Unauthorized", 401);
		}

		const snapshot = await getSavedSearchesCollection(req.user.uid).get();
		const searches: SavedSearch[] = [];

		snapshot.forEach((doc) => {
			searches.push({ id: doc.id, userId: req.user?.uid, ...doc.data() } as SavedSearch);
		});

		const response: ApiResponse<SavedSearch[]> = {
			success: true,
			data: searches,
		};

		res.status(200).json(response);
	} catch (err) {
		errorLogger.error({ message: (err as Error).message, stack: (err as Error).stack });
		res.status(500).json({
			success: false,
			error: { code: "INTERNAL_ERROR", message: "Failed to fetch saved searches" },
		});
	}
};

export const createSavedSearch = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		if (!req.user) {
			throw new AppError("Unauthorized", 401);
		}

		const searchData: Omit<SavedSearch, "id"> = {
			userId: req.user.uid,
			species: req.body.species,
			breed: req.body.breed,
			size: req.body.size,
			maxDistanceKm: req.body.maxDistanceKm,
			notifyOnMatch: req.body.notifyOnMatch ?? false,
			createdAt: new Date(),
		};

		const docRef = await getSavedSearchesCollection(req.user.uid).add(searchData);
		const search: SavedSearch = { id: docRef.id, ...searchData };

		const response: ApiResponse<SavedSearch> = {
			success: true,
			data: search,
			message: "Saved search created successfully",
		};

		res.status(201).json(response);
	} catch (error) {
		if (error instanceof AppError) throw error;
		throw new AppError("Failed to create saved search", 500);
	}
};

export const deleteSavedSearch = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		if (!req.user) {
			throw new AppError("Unauthorized", 401);
		}

		const { id } = req.params;
		await getSavedSearchesCollection(req.user.uid).doc(id).delete();

		const response: ApiResponse = {
			success: true,
			message: "Saved search deleted successfully",
		};

		res.status(200).json(response);
	} catch (error) {
		if (error instanceof AppError) throw error;
		throw new AppError("Failed to delete saved search", 500);
	}
};
