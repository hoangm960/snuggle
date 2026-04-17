import { Response } from "express";
import { db } from "../config/firebase";
import { HealthRecord, AuthRequest, ApiResponse } from "../types";
import { AppError } from "../middleware/errorHandler";
import { errorLogger } from "../utils/logger";

const getHealthRecordsCollection = (petId: string) =>
	db.collection("pets").doc(petId).collection("healthRecords");

export const getPetHealthRecords = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		const { petId } = req.params;
		const { type } = req.query;

		let query: FirebaseFirestore.Query = getHealthRecordsCollection(petId);

		if (type) {
			query = query.where("type", "==", type);
		}

		const snapshot = await query.orderBy("recordDate", "desc").get();
		const records: HealthRecord[] = [];

		snapshot.forEach((doc) => {
			records.push({ id: doc.id, petId, ...doc.data() } as HealthRecord);
		});

		const response: ApiResponse<HealthRecord[]> = {
			success: true,
			data: records,
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

		const { petId } = req.params;
		const { type, description, vetName, batchNumber, documentURL, recordDate } = req.body;

		if (!type || !["vaccine", "checkup", "treatment"].includes(type)) {
			throw new AppError("Invalid health record type", 400);
		}

		const recordData: Omit<HealthRecord, "id"> = {
			petId,
			type,
			description,
			vetName,
			batchNumber,
			documentURL,
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
