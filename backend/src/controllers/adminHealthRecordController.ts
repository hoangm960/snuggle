import { Response } from "express";
import { db } from "../config/firebase";
import { HealthRecord, AuthRequest, ApiResponse, Pet } from "../types";
import { AppError } from "../middleware/errorHandler";
import { errorLogger } from "../utils/logger";

interface HealthRecordWithPet extends HealthRecord {
	petName: string;
	petSpecies: string;
}

const getHealthRecordsCollection = (petId: string) =>
	db.collection("pets").doc(petId).collection("healthRecords");

export const getAllHealthRecords = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		const { type } = req.query;

		const petsSnapshot = await db.collection("pets").get();

		const allRecords: HealthRecordWithPet[] = [];

		for (const petDoc of petsSnapshot.docs) {
			const petData = petDoc.data() as Pet;
			const petId = petDoc.id;

			let query: FirebaseFirestore.Query = getHealthRecordsCollection(petId);
			if (type) {
				query = query.where("type", "==", type);
			}

			const recordsSnapshot = await query.orderBy("recordDate", "desc").get();

			recordsSnapshot.forEach((doc) => {
				const recordData = doc.data();
				allRecords.push({
					id: doc.id,
					petId,
					type: recordData.type,
					title: recordData.title,
					description: recordData.description,
					vetName: recordData.vetName,
					batchNumber: recordData.batchNumber,
					documentURL: recordData.documentURL,
					recordDate: recordData.recordDate?.toDate?.() ?? recordData.recordDate,
					createdAt: recordData.createdAt?.toDate?.() ?? recordData.createdAt,
					petName: petData.name,
					petSpecies: petData.species,
				});
			});
		}

		allRecords.sort(
			(a, b) => new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime()
		);

		const response: ApiResponse<HealthRecordWithPet[]> = {
			success: true,
			data: allRecords,
		};

		res.status(200).json(response);
	} catch (err) {
		errorLogger.error({ message: (err as Error).message, stack: (err as Error).stack });
		res.status(500).json({
			success: false,
			error: { code: "INTERNAL_ERROR", message: "Failed to fetch health records" },
		});
	}
};

export const createHealthRecord = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		if (!req.user) {
			throw new AppError("Unauthorized", 401);
		}

		const { petId, type, title, description, vetName, recordDate } = req.body;

		if (!petId) {
			throw new AppError("Pet ID is required", 400);
		}

		if (!type || !["vaccine", "checkup", "treatment"].includes(type)) {
			throw new AppError("Invalid health record type", 400);
		}

		const petDoc = await db.collection("pets").doc(petId).get();
		if (!petDoc.exists) {
			throw new AppError("Pet not found", 404);
		}

		const recordData: Omit<HealthRecord, "id"> = {
			petId,
			type,
			title,
			description,
			vetName,
			addedBy: req.user.uid,
			recordDate: recordDate ? new Date(recordDate) : new Date(),
			createdAt: new Date(),
		};

		const docRef = await getHealthRecordsCollection(petId).add(recordData);
		const record: HealthRecord = { id: docRef.id, ...recordData };

		const response: ApiResponse<HealthRecord> = {
			success: true,
			data: record,
			message: "Health record added successfully",
		};

		res.status(201).json(response);
	} catch (error) {
		if (error instanceof AppError) throw error;
		throw new AppError("Failed to create health record", 500);
	}
};

export const deleteHealthRecord = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		if (!req.user) {
			throw new AppError("Unauthorized", 401);
		}

		const { petId, id } = req.params;

		const doc = await getHealthRecordsCollection(petId).doc(id).get();
		if (!doc.exists) {
			throw new AppError("Health record not found", 404);
		}

		await getHealthRecordsCollection(petId).doc(id).delete();

		const response: ApiResponse = {
			success: true,
			message: "Health record deleted successfully",
		};

		res.status(200).json(response);
	} catch (error) {
		if (error instanceof AppError) throw error;
		throw new AppError("Failed to delete health record", 500);
	}
};
