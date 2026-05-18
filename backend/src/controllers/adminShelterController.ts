import { Response } from "express";
import { db } from "../config/firebase";
import { Shelter, AuthRequest, ApiResponse } from "../types";
import { AppError } from "../middleware/errorHandler";

const sheltersCollection = db.collection("shelters");

export const getAllSheltersAdmin = async (_req: AuthRequest, res: Response): Promise<void> => {
	const snapshot = await sheltersCollection.get();
	const shelters: Shelter[] = [];

	snapshot.forEach((doc) => {
		shelters.push({ id: doc.id, ...doc.data() } as Shelter);
	});

	const response: ApiResponse<Shelter[]> = {
		success: true,
		data: shelters,
	};

	res.status(200).json(response);
};

export const createShelterAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
	if (!req.user) {
		throw new AppError("Unauthorized", 401);
	}

	const shelterData: Omit<Shelter, "id"> = {
		name: req.body.name,
		adminUserId: req.body.adminUserId || req.user.uid,
		address: req.body.address,
		geoPoint: req.body.geoPoint,
		contactEmail: req.body.contactEmail || req.user.email || "",
		phone: req.body.phone,
		description: req.body.description,
		photoURLs: req.body.photoURLs,
		trustScore: 0,
		totalReviews: 0,
		status: "active",
		createdAt: new Date(),
	};

	const docRef = await sheltersCollection.add(shelterData);
	const shelter: Shelter = { id: docRef.id, ...shelterData };

	const response: ApiResponse<Shelter> = {
		success: true,
		data: shelter,
		message: "Shelter created successfully by admin",
	};

	res.status(201).json(response);
};

export const updateShelterAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
	if (!req.user) {
		throw new AppError("Unauthorized", 401);
	}

	const { id } = req.params;
	const doc = await sheltersCollection.doc(id).get();

	if (!doc.exists) {
		throw new AppError("Shelter not found", 404);
	}

	const updateData: Partial<Shelter> = {
		...req.body,
		updatedAt: new Date(),
	};

	delete updateData.id;
	delete updateData.createdAt;
	delete updateData.trustScore;
	delete updateData.totalReviews;

	await sheltersCollection.doc(id).update(updateData);

	const updatedDoc = await sheltersCollection.doc(id).get();
	const shelter: Shelter = { id: updatedDoc.id, ...updatedDoc.data() } as Shelter;

	const response: ApiResponse<Shelter> = {
		success: true,
		data: shelter,
		message: "Shelter updated successfully by admin",
	};

	res.status(200).json(response);
};

export const deleteShelterAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
	if (!req.user) {
		throw new AppError("Unauthorized", 401);
	}

	const { id } = req.params;
	const doc = await sheltersCollection.doc(id).get();

	if (!doc.exists) {
		throw new AppError("Shelter not found", 404);
	}

	await sheltersCollection.doc(id).update({ status: "suspended" });

	const response: ApiResponse = {
		success: true,
		message: "Shelter suspended successfully by admin",
	};

	res.status(200).json(response);
};

export const hardDeleteShelterAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
	if (!req.user) {
		throw new AppError("Unauthorized", 401);
	}

	const { id } = req.params;
	const doc = await sheltersCollection.doc(id).get();

	if (!doc.exists) {
		throw new AppError("Shelter not found", 404);
	}

	await sheltersCollection.doc(id).delete();

	const response: ApiResponse = {
		success: true,
		message: "Shelter deleted permanently by admin",
	};

	res.status(200).json(response);
};
