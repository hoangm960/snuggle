import { Response } from "express";
import { db } from "../config/firebase";
import { AdoptionContract, AuthRequest, ApiResponse } from "../types";
import { AppError } from "../middleware/errorHandler";
import {
	sendContractCreatedEmail,
	sendContractSignedEmail,
	sendContractCompletedEmail,
} from "../services/emailService";
import { generateContractPdf } from "../services/contractPdfService";

const contractsCollection = db.collection("adoptionContracts");
const applicationsCollection = db.collection("adoptionApplications");
const petsCollection = db.collection("pets");
const usersCollection = db.collection("users");
const sheltersCollection = db.collection("shelters");

interface EnrichedContract {
	id: string;
	applicationId?: string;
	petName: string;
	adopter: string;
	adopterEmail: string;
	shelter: string;
	adopterSignedAt?: string;
	shelterSignedAt?: string;
	adopterSignedName?: string;
	shelterSignedName?: string;
	contractHash?: string;
	expiresAt: string;
	status: "active" | "pending_signature" | "expired" | "terminated";
	adoptionDate: string;
	adoptionDateRaw: Date;
	contractFileURL?: string;
}

function mapBackendStatusToFrontend(
	status: string
): "active" | "pending_signature" | "expired" | "terminated" {
	switch (status) {
		case "signed":
			return "active";
		case "draft":
			return "pending_signature";
		case "archived":
			return "terminated";
		default:
			return "pending_signature";
	}
}

function computeExpiryDate(createdAt: Date): string {
	const expiry = new Date(createdAt);
	expiry.setFullYear(expiry.getFullYear() + 1);
	return expiry.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function toDate(value: unknown): Date | undefined {
	if (!value) return undefined;
	if (typeof (value as { toDate?: () => Date }).toDate === "function") {
		return (value as { toDate: () => Date }).toDate();
	}
	if (value instanceof Date) return value;
	if (typeof value === "string" || typeof value === "number") return new Date(value);
	return undefined;
}

function formatDate(date: unknown): string | undefined {
	const d = toDate(date);
	if (!d) return undefined;
	return d.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

async function enrichContract(
	contract: AdoptionContract & { id: string }
): Promise<EnrichedContract> {
	let petName = "Unknown Pet";
	let shelter = "Unknown Shelter";
	let adopter = "Unknown Adopter";
	let adopterEmail = "N/A";

	if (contract.petId) {
		const petDoc = await petsCollection.doc(contract.petId).get();
		if (petDoc.exists) {
			const petData = petDoc.data();
			petName = petData?.name || petName;

			if (petData?.shelterId) {
				const shelterDoc = await sheltersCollection.doc(petData.shelterId).get();
				if (shelterDoc.exists) {
					shelter = shelterDoc.data()?.name || shelter;
				}
			}
		}
	}

	if (contract.adopterId) {
		const userDoc = await usersCollection.doc(contract.adopterId).get();
		if (userDoc.exists) {
			const userData = userDoc.data();
			adopter = userData?.displayName || adopter;
			adopterEmail = userData?.email || adopterEmail;
		}
	}

	const contractCreatedAt = toDate(contract.createdAt);
	const createdAt = contractCreatedAt ? contractCreatedAt : new Date();
	const adoptionDateStr = createdAt.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});

	return {
		id: contract.id,
		applicationId: contract.applicationId,
		petName,
		adopter,
		adopterEmail,
		shelter,
		adopterSignedAt: formatDate(contract.adopterSignedAt),
		shelterSignedAt: formatDate(contract.shelterSignedAt),
		adopterSignedName: contract.adopterSignedName,
		shelterSignedName: contract.shelterSignedName,
		contractHash: contract.contractHash,
		expiresAt: computeExpiryDate(createdAt),
		status: mapBackendStatusToFrontend(contract.status),
		adoptionDate: adoptionDateStr,
		adoptionDateRaw: createdAt,
		contractFileURL: contract.contractFileURL,
	};
}

export const getAllContracts = async (req: AuthRequest, res: Response): Promise<void> => {
	if (!req.user) {
		throw new AppError("Unauthorized", 401);
	}

	const { adopterId } = req.query;
	let query: FirebaseFirestore.Query = contractsCollection;

	if (adopterId) {
		query = query.where("adopterId", "==", adopterId);
	}

	const snapshot = await query.get();
	const contracts: AdoptionContract[] = [];

	snapshot.forEach((doc) => {
		contracts.push({ id: doc.id, ...doc.data() } as AdoptionContract);
	});

	const contractsWithId = contracts.filter((c): c is AdoptionContract & { id: string } => !!c.id);

	const enrichedContracts: EnrichedContract[] = await Promise.all(
		contractsWithId.map((contract) => enrichContract(contract))
	);

	const response: ApiResponse<EnrichedContract[]> = {
		success: true,
		data: enrichedContracts,
	};

	res.status(200).json(response);
};

export const getContractById = async (req: AuthRequest, res: Response): Promise<void> => {
	const { id } = req.params;
	const doc = await contractsCollection.doc(id).get();

	if (!doc.exists) {
		throw new AppError("Contract not found", 404);
	}

	const contract = { id: doc.id, ...doc.data() } as AdoptionContract;
	if (!contract.id) {
		throw new AppError("Contract not found", 404);
	}

	const enriched = await enrichContract(contract as AdoptionContract & { id: string });

	const response: ApiResponse<EnrichedContract> = {
		success: true,
		data: enriched,
	};

	res.status(200).json(response);
};

export const createContract = async (req: AuthRequest, res: Response): Promise<void> => {
	if (!req.user) {
		throw new AppError("Unauthorized", 401);
	}

	const { applicationId, petId, adopterId } = req.body;

	const appDoc = await applicationsCollection.doc(applicationId).get();
	if (!appDoc.exists) {
		throw new AppError("Application not found", 404);
	}

	const appData = appDoc.data();
	if (appData?.status !== "approved") {
		throw new AppError("Application must be approved before creating contract", 400);
	}

	const contractData: Omit<AdoptionContract, "id"> = {
		applicationId,
		petId: petId || appData?.petId,
		adopterId: adopterId || appData?.adopterId,
		status: "draft",
		createdAt: new Date(),
	};

	const docRef = await contractsCollection.add(contractData);
	const contract: AdoptionContract = { id: docRef.id, ...contractData };

	await petsCollection.doc(appData?.petId).update({ contractId: docRef.id });

	const petDoc = await petsCollection.doc(appData?.petId).get();
	const petData = petDoc.data();
	const adopterDoc = await usersCollection.doc(contractData.adopterId).get();
	const adopterData = adopterDoc.data();

	await sendContractCreatedEmail({
		to: adopterData?.email || "",
		displayName: adopterData?.displayName || "",
		petName: petData?.name || "Unknown",
		contractId: docRef.id,
	});

	const response: ApiResponse<AdoptionContract> = {
		success: true,
		data: contract,
		message: "Contract created successfully",
	};

	res.status(201).json(response);
};

export const signContract = async (req: AuthRequest, res: Response): Promise<void> => {
	if (!req.user) {
		throw new AppError("Unauthorized", 401);
	}

	const { id } = req.params;
	const { role, contractFileURL, contractHash, signedName } = req.body;

	const doc = await contractsCollection.doc(id).get();
	if (!doc.exists) {
		throw new AppError("Contract not found", 404);
	}

	const contractData = doc.data() as AdoptionContract;
	const updateData: Partial<AdoptionContract> = {};

	const userDoc = await usersCollection.doc(req.user.uid).get();
	const userData = userDoc.data();

	if (role === "adopter") {
		if (!userData || userData.role !== "adopter") {
			throw new AppError(
				"Only verified adopters can sign contracts as adopter. Please complete eKYC verification first.",
				403
			);
		}
		if (contractData.adopterId !== req.user.uid) {
			throw new AppError("Not authorized to sign as adopter", 403);
		}
		updateData.adopterSignedAt = new Date();
		if (signedName) updateData.adopterSignedName = signedName;
	} else if (role === "shelter") {
		if (!userData || (userData.role !== "shelter" && userData.role !== "admin")) {
			throw new AppError("Not authorized to sign as shelter", 403);
		}
		updateData.shelterSignedAt = new Date();
		if (signedName) updateData.shelterSignedName = signedName;
	}

	if (contractFileURL) updateData.contractFileURL = contractFileURL;
	if (contractHash) updateData.contractHash = contractHash;

	const fullySigned =
		(updateData.adopterSignedAt || contractData.adopterSignedAt) &&
		(updateData.shelterSignedAt || contractData.shelterSignedAt);

	if (fullySigned) {
		updateData.status = "signed";
		if (contractData.petId) {
			await petsCollection.doc(contractData.petId).update({ status: "adopted" });
		}
	}

	await contractsCollection.doc(id).update(updateData);

	const adopterDoc = await usersCollection.doc(contractData.adopterId).get();
	const adopterData = adopterDoc.data();
	const petDoc = contractData.petId ? await petsCollection.doc(contractData.petId).get() : null;
	const petData = petDoc?.data();

	await sendContractSignedEmail({
		to: adopterData?.email || "",
		displayName: adopterData?.displayName || "",
		petName: petData?.name || "Unknown",
		contractId: id,
		signedBy: role === "adopter" ? "you" : "the shelter",
	});

	const adopterSignedAtVal = updateData.adopterSignedAt || contractData.adopterSignedAt;
	const shelterSignedAtVal = updateData.shelterSignedAt || contractData.shelterSignedAt;

	if (contractData.petId && contractData.adopterId) {
		const pdfUrl = await generateContractPdf({
			contractId: id,
			petName: petData?.name || "Unknown",
			petSpecies: petData?.species || "",
			petBreed: petData?.breed || "",
			adopterName: adopterData?.displayName || "",
			adopterEmail: adopterData?.email || "",
			shelterName: "Shelter",
			adoptionDate: contractData.createdAt
				? new Date(contractData.createdAt).toLocaleDateString()
				: new Date().toLocaleDateString(),
			adopterSignedName: updateData.adopterSignedName || contractData.adopterSignedName,
			shelterSignedName: updateData.shelterSignedName || contractData.shelterSignedName,
			adopterSignedAt: adopterSignedAtVal
				? new Date(adopterSignedAtVal as Date).toLocaleDateString()
				: undefined,
			shelterSignedAt: shelterSignedAtVal
				? new Date(shelterSignedAtVal as Date).toLocaleDateString()
				: undefined,
			contractHash: updateData.contractHash || contractData.contractHash,
		});

		await contractsCollection.doc(id).update({ contractFileURL: pdfUrl });

		if (fullySigned) {
			await sendContractCompletedEmail({
				to: adopterData?.email || "",
				displayName: adopterData?.displayName || "",
				petName: petData?.name || "Unknown",
				contractId: id,
				pdfUrl,
			});
		}
	}

	const updatedDoc = await contractsCollection.doc(id).get();
	const updatedContract: AdoptionContract = {
		id: updatedDoc.id,
		...updatedDoc.data(),
	} as AdoptionContract;

	const response: ApiResponse<AdoptionContract> = {
		success: true,
		data: updatedContract,
		message: "Contract signed successfully",
	};

	res.status(200).json(response);
};

export const archiveContract = async (req: AuthRequest, res: Response): Promise<void> => {
	if (!req.user) {
		throw new AppError("Unauthorized", 401);
	}

	const { id } = req.params;

	await contractsCollection.doc(id).update({ status: "archived" });

	const response: ApiResponse = {
		success: true,
		message: "Contract archived successfully",
	};

	res.status(200).json(response);
};

export const generateContractPdfEndpoint = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	if (!req.user) {
		throw new AppError("Unauthorized", 401);
	}

	const { id } = req.params;
	const doc = await contractsCollection.doc(id).get();
	if (!doc.exists) {
		throw new AppError("Contract not found", 404);
	}

	const contract = { id: doc.id, ...doc.data() } as AdoptionContract;
	if (!contract.id) {
		throw new AppError("Contract not found", 404);
	}

	let petName = "Unknown Pet";
	let petSpecies = "";
	let petBreed = "";
	let shelterName = "Unknown Shelter";
	let adopterName = "Unknown Adopter";
	let adopterEmail = "N/A";

	if (contract.petId) {
		const petDoc = await petsCollection.doc(contract.petId).get();
		if (petDoc.exists) {
			const petData = petDoc.data();
			petName = petData?.name || petName;
			petSpecies = petData?.species || petSpecies;
			petBreed = petData?.breed || petBreed;

			if (petData?.shelterId) {
				const shelterDoc = await sheltersCollection.doc(petData.shelterId).get();
				if (shelterDoc.exists) {
					shelterName = shelterDoc.data()?.name || shelterName;
				}
			}
		}
	}

	if (contract.adopterId) {
		const userDoc = await usersCollection.doc(contract.adopterId).get();
		if (userDoc.exists) {
			const userData = userDoc.data();
			adopterName = userData?.displayName || adopterName;
			adopterEmail = userData?.email || adopterEmail;
		}
	}

	const adoptionDate = contract.createdAt
		? new Date(contract.createdAt).toLocaleDateString()
		: new Date().toLocaleDateString();

	const adopterSignedAtVal = toDate(contract.adopterSignedAt);
	const adopterSignedAt = adopterSignedAtVal
		? adopterSignedAtVal.toLocaleDateString()
		: undefined;
	const shelterSignedAtVal = toDate(contract.shelterSignedAt);
	const shelterSignedAt = shelterSignedAtVal
		? shelterSignedAtVal.toLocaleDateString()
		: undefined;

	const pdfUrl = await generateContractPdf({
		contractId: id,
		petName,
		petSpecies,
		petBreed,
		adopterName,
		adopterEmail,
		shelterName,
		adoptionDate,
		adopterSignedName: contract.adopterSignedName,
		shelterSignedName: contract.shelterSignedName,
		adopterSignedAt,
		shelterSignedAt,
		contractHash: contract.contractHash,
	});

	await contractsCollection.doc(id).update({ contractFileURL: pdfUrl });

	const response: ApiResponse<{ pdfUrl: string }> = {
		success: true,
		data: { pdfUrl },
	};

	res.status(200).json(response);
};
