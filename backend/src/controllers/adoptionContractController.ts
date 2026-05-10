import { Response } from "express";
import { db } from "../config/firebase";
import { AdoptionContract, AuthRequest, ApiResponse } from "../types";
import { AppError } from "../middleware/errorHandler";

const contractsCollection = db.collection("adoptionContracts");
const applicationsCollection = db.collection("adoptionApplications");
const petsCollection = db.collection("pets");
const usersCollection = db.collection("users");
const sheltersCollection = db.collection("shelters");

interface EnrichedContract {
	id: string;
	petName: string;
	adopter: string;
	adopterEmail: string;
	shelter: string;
	signedAt?: string;
	expiresAt: string;
	status: "active" | "pending_signature" | "expired" | "terminated";
	adoptionDate: string;
	adoptionDateRaw: Date;
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

function formatDate(date: Date | undefined): string | undefined {
	if (!date) return undefined;
	return new Date(date).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
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
		contractsWithId.map(async (contract) => {
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
					adopter =
						`${userData?.firstName || ""} ${userData?.lastName || ""}`.trim() ||
						adopter;
					adopterEmail = userData?.email || adopterEmail;
				}
			}

			const createdAt = contract.createdAt ? new Date(contract.createdAt) : new Date();
			const adoptionDateStr = createdAt.toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
				year: "numeric",
			});

			return {
				id: contract.id,
				petName,
				adopter,
				adopterEmail,
				shelter,
				signedAt: formatDate(contract.adopterSignedAt),
				expiresAt: computeExpiryDate(createdAt),
				status: mapBackendStatusToFrontend(contract.status),
				adoptionDate: adoptionDateStr,
				adoptionDateRaw: createdAt,
			};
		})
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

	const response: ApiResponse<AdoptionContract> = {
		success: true,
		data: { id: doc.id, ...doc.data() } as AdoptionContract,
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
	const { role, contractFileURL, contractHash } = req.body;

	const doc = await contractsCollection.doc(id).get();
	if (!doc.exists) {
		throw new AppError("Contract not found", 404);
	}

	const contractData = doc.data() as AdoptionContract;
	const updateData: Partial<AdoptionContract> = {};

	if (role === "adopter") {
		if (contractData.adopterId !== req.user.uid) {
			throw new AppError("Not authorized to sign as adopter", 403);
		}
		updateData.adopterSignedAt = new Date();
	} else if (role === "shelter") {
		updateData.shelterSignedAt = new Date();
	}

	if (contractFileURL) updateData.contractFileURL = contractFileURL;
	if (contractHash) updateData.contractHash = contractHash;

	if (contractData.adopterSignedAt && updateData.shelterSignedAt) {
		updateData.status = "signed";
	}

	await contractsCollection.doc(id).update(updateData);

	const updatedDoc = await contractsCollection.doc(id).get();
	const contract: AdoptionContract = {
		id: updatedDoc.id,
		...updatedDoc.data(),
	} as AdoptionContract;

	const response: ApiResponse<AdoptionContract> = {
		success: true,
		data: contract,
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
