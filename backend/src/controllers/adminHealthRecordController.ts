import { Response } from "express";
import { db } from "../config/firebase";
import { HealthRecord, AuthRequest, ApiResponse, Pet } from "../types";
import { AppError } from "../middleware/errorHandler";
import { errorLogger } from "../utils/logger";
import { checkVaccinationConsistency } from "../utils/vaccinationAudit";

interface HealthRecordWithPet extends HealthRecord {
	petName: string;
	petSpecies: string;
}
// shared helper to convert Timestamps before sending

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
		let petData = petDoc.data() as Pet;

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
		// Auto sync vaccination status
		if (type === "vaccine") {
			await db.collection("pets").doc(petId).update({
				isVaccinated: true,
				updatedAt: new Date(),
			});
			petData = { ...petData, isVaccinated: true }; // Update local petData for consistency check
		}
		await checkVaccinationConsistency(petId, petData);

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

		const recordType = doc.data()?.type;

		// fetch pet once, reuse for consistency check
		const petDoc = await db.collection("pets").doc(petId).get();
		if (!petDoc.exists) throw new AppError("Pet not found", 404);
		let petData = petDoc.data() as Pet;

		await getHealthRecordsCollection(petId).doc(id).delete();

		// If the deleted record is a vaccine, check if there are any other vaccine records left. If not, update the pet's vaccination status
		if (recordType === "vaccine") {
			const remainingVaccines = await getHealthRecordsCollection(petId)
				.where("type", "==", "vaccine")
				.limit(1)
				.get();
			const newVaccinationStatus = !remainingVaccines.empty;
			await db.collection("pets").doc(petId).update({
				isVaccinated: newVaccinationStatus,
				updatedAt: new Date(),
			});
			petData = { ...petData, isVaccinated: newVaccinationStatus }; // Update local petData for consistency check
		}
		await checkVaccinationConsistency(petId, petData);

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

export const editHealthRecord = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		if (!req.user) throw new AppError("Unauthorized", 401);

		const { petId, id } = req.params;
		const { type, title, description, vetName, recordDate } = req.body;

		if (type && !["vaccine", "checkup", "treatment"].includes(type)) {
			throw new AppError("Invalid health record type", 400);
		}

		const doc = await getHealthRecordsCollection(petId).doc(id).get();
		if (!doc.exists) throw new AppError("Health record not found", 404);
		const oldType = doc.data()?.type;

		const petDoc = await db.collection("pets").doc(petId).get();
		if (!petDoc.exists) throw new AppError("Pet not found", 404);
		let petData = petDoc.data() as Pet;

		// separate updatedAt from Partial<HealthRecord> to avoid type conflict
		const updateData: Partial<HealthRecord> = {
			...(type && { type }),
			...(title !== undefined && { title }),
			...(description !== undefined && { description }),
			...(vetName !== undefined && { vetName }),
			...(recordDate && recordDate !== "" && { recordDate: new Date(recordDate) }),
		};

		await getHealthRecordsCollection(petId)
			.doc(id)
			.update({
				...updateData,
				updatedAt: new Date(), // outside typed object
			});

		const newType = type ?? oldType;
		const typeChanged = newType !== oldType;

		if (typeChanged) {
			if (newType === "vaccine") {
				await db.collection("pets").doc(petId).update({
					isVaccinated: true,
					updatedAt: new Date(),
				});
				petData = { ...petData, isVaccinated: true };
			} else if (oldType === "vaccine") {
				const remainingVaccines = await getHealthRecordsCollection(petId)
					.where("type", "==", "vaccine")
					.limit(1)
					.get();
				const newVaccinatedStatus = !remainingVaccines.empty;
				await db.collection("pets").doc(petId).update({
					isVaccinated: newVaccinatedStatus,
					updatedAt: new Date(),
				});
				petData = { ...petData, isVaccinated: newVaccinatedStatus };
			}
		}

		await checkVaccinationConsistency(petId, petData);

		// explicitly map fields instead of spread to avoid type conflict
		const updatedDoc = await getHealthRecordsCollection(petId).doc(id).get();
		const data = updatedDoc.data()!;
		const record: HealthRecord = {
			id: updatedDoc.id,
			petId,
			type: data.type,
			title: data.title,
			description: data.description,
			vetName: data.vetName,
			batchNumber: data.batchNumber,
			documentURL: data.documentURL,
			addedBy: data.addedBy,
			// convert Timestamps
			recordDate: data.recordDate?.toDate?.() ?? data.recordDate,
			createdAt: data.createdAt?.toDate?.() ?? data.createdAt,
		};

		res.status(200).json({
			success: true,
			data: record,
			message: "Health record updated successfully",
		});
	} catch (error) {
		if (error instanceof AppError) throw error;
		throw new AppError("Failed to update health record", 500);
	}
};
