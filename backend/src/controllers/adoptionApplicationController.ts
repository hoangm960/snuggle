import { Response } from "express";
import { db } from "../config/firebase";
import { AdoptionApplication, AuthRequest, ApiResponse } from "../types";
import { AppError } from "../middleware/errorHandler";

const applicationsCollection = db.collection("adoptionApplications");
const petsCollection = db.collection("pets");
const usersCollection = db.collection("users");

export const getAllApplications = async (req: AuthRequest, res: Response): Promise<void> => {
	if (!req.user) {
		throw new AppError("Unauthorized", 401);
	}

	const { status, shelterId, adopterId } = req.query;
	let query: FirebaseFirestore.Query = applicationsCollection;

	if (status) {
		query = query.where("status", "==", status);
	}
	if (shelterId) {
		query = query.where("shelterId", "==", shelterId);
	}
	if (adopterId) {
		query = query.where("adopterId", "==", adopterId);
	}

	const snapshot = await query.get();
	const applications: AdoptionApplication[] = [];

	snapshot.forEach((doc) => {
		applications.push({ id: doc.id, ...doc.data() } as AdoptionApplication);
	});

	const response: ApiResponse<AdoptionApplication[]> = {
		success: true,
		data: applications,
	};

	res.status(200).json(response);
};

export const getApplicationById = async (req: AuthRequest, res: Response): Promise<void> => {
	const { id } = req.params;
	const doc = await applicationsCollection.doc(id).get();

	if (!doc.exists) {
		throw new AppError("Application not found", 404);
	}

	const response: ApiResponse<AdoptionApplication> = {
		success: true,
		data: { id: doc.id, ...doc.data() } as AdoptionApplication,
	};

	res.status(200).json(response);
};

export const createApplication = async (req: AuthRequest, res: Response): Promise<void> => {
	if (!req.user) {
		throw new AppError("Unauthorized", 401);
	}

	const { petId, message } = req.body;

	const petDoc = await petsCollection.doc(petId).get();
	if (!petDoc.exists) {
		throw new AppError("Pet not found", 404);
	}

	const petData = petDoc.data();
	const shelterId = petData?.shelterId;

	const userDoc = await usersCollection.doc(req.user.uid).get();
	const userData = userDoc.data();

	const applicationData: Omit<AdoptionApplication, "id"> = {
		petId,
		petName: petData?.name || "",
		adopterId: req.user.uid,
		adopterName: userData?.displayName || req.user.email || "",
		shelterId,
		status: "pending",
		message,
		appliedAt: new Date(),
	};

	const docRef = await applicationsCollection.add(applicationData);
	const application: AdoptionApplication = { id: docRef.id, ...applicationData };

	const response: ApiResponse<AdoptionApplication> = {
		success: true,
		data: application,
		message: "Application submitted successfully",
	};

	res.status(201).json(response);
};

export const updateApplicationStatus = async (req: AuthRequest, res: Response): Promise<void> => {
	if (!req.user) {
		throw new AppError("Unauthorized", 401);
	}

	const { id } = req.params;
	const { status, adminNote } = req.body;

	const validStatuses = ["pending", "approved", "rejected", "completed"];
	if (!status || !validStatuses.includes(status)) {
		throw new AppError("Invalid status", 400);
	}

	const doc = await applicationsCollection.doc(id).get();
	if (!doc.exists) {
		throw new AppError("Application not found", 404);
	}

	const applicationData = doc.data() as AdoptionApplication;

	if (status === "approved") {
		await petsCollection.doc(applicationData.petId).update({ status: "pending" });
	} else if (status === "completed") {
		await petsCollection.doc(applicationData.petId).update({ status: "adopted" });
	}

	const updateData: Partial<AdoptionApplication> = {
		status,
		reviewedBy: req.user.uid,
		reviewedAt: new Date(),
	};

	if (adminNote) updateData.adminNote = adminNote;

	await applicationsCollection.doc(id).update(updateData);

	const updatedDoc = await applicationsCollection.doc(id).get();
	const application: AdoptionApplication = {
		id: updatedDoc.id,
		...updatedDoc.data(),
	} as AdoptionApplication;

	const response: ApiResponse<AdoptionApplication> = {
		success: true,
		data: application,
		message: `Application ${status} successfully`,
	};

	res.status(200).json(response);
};

export const deleteApplication = async (req: AuthRequest, res: Response): Promise<void> => {
	if (!req.user) {
		throw new AppError("Unauthorized", 401);
	}

	const { id } = req.params;
	const doc = await applicationsCollection.doc(id).get();

	if (!doc.exists) {
		throw new AppError("Application not found", 404);
	}

	const applicationData = doc.data() as AdoptionApplication;
	if (applicationData.adopterId !== req.user.uid) {
		throw new AppError("Not authorized to delete this application", 403);
	}

	await applicationsCollection.doc(id).delete();

	const response: ApiResponse = {
		success: true,
		message: "Application deleted successfully",
	};

	res.status(200).json(response);
};
