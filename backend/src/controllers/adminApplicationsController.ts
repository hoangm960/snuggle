import { db } from "../config/firebase";
import { AdoptionApplication } from "../types";

interface AdminApplication {
	id: string;
	petId: string;
	petName: string;
	petThumbnail?: string;
	petSpecies?: string;
	adopterId: string;
	adopterName: string;
	adopterPhoto?: string;
	adopterEmail?: string;
	status: AdoptionApplication["status"];
	message?: string;
	adminNote?: string;
	appliedAt: Date;
	reviewedAt?: Date;
	reviewedBy?: string;
}

interface AdminApplicationsParams {
	status?: string;
	page?: number;
	limit?: number;
}

interface AdminApplicationsResponse {
	applications: AdminApplication[];
	total: number;
	stats: {
		all: number;
		pending: number;
		approved: number;
		rejected: number;
		completed: number;
	};
}

const applicationsCollection = db.collection("adoptionApplications");
const petsCollection = db.collection("pets");
const usersCollection = db.collection("users");

export const getAdminApplications = async (
	params: AdminApplicationsParams
): Promise<{ applications: AdminApplication[]; total: number }> => {
	const { status, page = 1, limit = 20 } = params;

	let query: FirebaseFirestore.Query = applicationsCollection;

	if (status && status !== "all") {
		query = query.where("status", "==", status);
	}

	const snapshot = await query.orderBy("appliedAt", "desc").get();
	const allDocs = snapshot.docs;
	const total = allDocs.length;

	const startIndex = (page - 1) * limit;
	const paginatedDocs = allDocs.slice(startIndex, startIndex + limit);

	const applications: AdminApplication[] = [];

	for (const doc of paginatedDocs) {
		const data = doc.data();
		const [petDoc, adopterDoc] = await Promise.all([
			data.petId ? petsCollection.doc(data.petId).get() : null,
			data.adopterId ? usersCollection.doc(data.adopterId).get() : null,
		]);

		const petData = petDoc?.data();
		const userData = adopterDoc?.data();

		applications.push({
			id: doc.id,
			petId: data.petId || "",
			petName: data.name || petData?.name || "Unknown",
			petThumbnail: petData?.thumbnail || petData?.photoURLs?.[0] || undefined,
			petSpecies: petData?.species || "",
			adopterId: data.adopterId || "",
			adopterName: data.adopterName || userData?.displayName || "Unknown",
			adopterPhoto: userData?.photoURL || undefined,
			adopterEmail: userData?.email || undefined,
			status: data.status || "pending",
			message: data.message || undefined,
			adminNote: data.adminNote || undefined,
			appliedAt: data.appliedAt?.toDate() || new Date(),
			reviewedAt: data.reviewedAt?.toDate() || undefined,
			reviewedBy: data.reviewedBy || undefined,
		});
	}

	return { applications, total };
};

export const updateAdminApplicationStatus = async (
	applicationId: string,
	status: "pending" | "approved" | "rejected" | "completed",
	reviewedBy: string,
	adminNote?: string
): Promise<AdoptionApplication> => {
	const docRef = applicationsCollection.doc(applicationId);
	const doc = await docRef.get();

	if (!doc.exists) {
		throw new Error("Application not found");
	}

	const applicationData = doc.data() as AdoptionApplication;

	if (status === "approved") {
		await petsCollection.doc(applicationData.petId).update({ status: "pending" });
	} else if (status === "completed") {
		await petsCollection.doc(applicationData.petId).update({ status: "adopted" });
	}

	const updateData: Partial<AdoptionApplication> = {
		status,
		reviewedBy,
		reviewedAt: new Date(),
	};

	if (adminNote) updateData.adminNote = adminNote;

	await docRef.update(updateData);

	const updatedDoc = await docRef.get();
	return { id: updatedDoc.id, ...updatedDoc.data() } as AdoptionApplication;
};

export const getApplicationStats = async (): Promise<{
	all: number;
	pending: number;
	approved: number;
	rejected: number;
	completed: number;
}> => {
	const snapshot = await applicationsCollection.get();
	const all = snapshot.size;

	const [pending, approved, rejected, completed] = await Promise.all([
		applicationsCollection.where("status", "==", "pending").count().get(),
		applicationsCollection.where("status", "==", "approved").count().get(),
		applicationsCollection.where("status", "==", "rejected").count().get(),
		applicationsCollection.where("status", "==", "completed").count().get(),
	]);

	return {
		all,
		pending: pending.data().count,
		approved: approved.data().count,
		rejected: rejected.data().count,
		completed: completed.data().count,
	};
};

export const getAllAdminApplications = async (
	params: AdminApplicationsParams
): Promise<AdminApplicationsResponse> => {
	const [appsResult, stats] = await Promise.all([
		getAdminApplications(params),
		getApplicationStats(),
	]);

	return {
		applications: appsResult.applications,
		total: appsResult.total,
		stats,
	};
};
