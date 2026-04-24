import { db } from "../config/firebase";
import { User, KycVerification } from "../types";
import { sendKYCApprovedEmail, sendKYCRejectedEmail } from "../services/emailService";
import { logAdminAction } from "./adminController";

const kycCollection = db.collection("kycVerifications");
const usersCollection = db.collection("users");

export interface SubmitKYCParams {
	idDocumentURL: string;
	selfieURL: string;
	kycProvider?: string;
}

interface KYCBatch {
	kycVerifications: KycVerification[];
	total: number;
	pending: number;
	approved: number;
	rejected: number;
}

export const getPendingKYC = async (): Promise<KYCBatch> => {
	const snapshot = await kycCollection.orderBy("submittedAt", "desc").get();

	const kycVerifications: KycVerification[] = [];
	let pending = 0;
	let approved = 0;
	let rejected = 0;

	for (const doc of snapshot.docs) {
		const data = doc.data();
		const kyc: KycVerification = {
			id: doc.id,
			...data,
			submittedAt: data.submittedAt?.toDate(),
			reviewedAt: data.reviewedAt?.toDate(),
		} as KycVerification;

		kycVerifications.push(kyc);

		if (data.status === "pending") pending++;
		else if (data.status === "approved") approved++;
		else if (data.status === "rejected") rejected++;
	}

	return {
		kycVerifications,
		total: snapshot.size,
		pending,
		approved,
		rejected,
	};
};

export const getKYCById = async (kycId: string): Promise<KycVerification> => {
	const doc = await kycCollection.doc(kycId).get();

	if (!doc.exists) {
		throw new Error("KYC verification not found");
	}

	const data = doc.data();
	return {
		id: doc.id,
		...data,
		submittedAt: data?.submittedAt?.toDate(),
		reviewedAt: data?.reviewedAt?.toDate(),
	} as KycVerification;
};

export const getUserWithKYC = async (
	kycId: string
): Promise<{ kyc: KycVerification; user: User }> => {
	const kyc = await getKYCById(kycId);

	if (!kyc.userId) {
		throw new Error("KYC verification has no linked user");
	}

	const userDoc = await usersCollection.doc(kyc.userId).get();

	if (!userDoc.exists) {
		throw new Error("User not found");
	}

	const userData = userDoc.data();
	const user: User = {
		id: userDoc.id,
		...userData,
		createdAt: userData?.createdAt?.toDate(),
		updatedAt: userData?.updatedAt?.toDate(),
	} as User;

	return { kyc, user };
};

export const approveKYC = async (
	kycId: string,
	adminId: string
): Promise<KycVerification> => {
	const kyc = await getKYCById(kycId);

	if (kyc.status !== "pending") {
		throw new Error(`Cannot approve KYC with status: ${kyc.status}`);
	}

	await kycCollection.doc(kycId).update({
		status: "approved",
		reviewedBy: adminId,
		reviewedAt: new Date(),
	});

	if (kyc.userId) {
		await usersCollection.doc(kyc.userId).update({
			isKycVerified: true,
			updatedAt: new Date(),
		});
	}

	await logAdminAction(adminId, "APPROVE_KYC", kycId, {
		userId: kyc.userId,
	});

	const userDoc = kyc.userId ? await usersCollection.doc(kyc.userId).get() : null;
	const userData = userDoc?.data();

	if (userData?.email) {
		try {
			await sendKYCApprovedEmail({
				to: userData.email,
				displayName: userData.displayName || "User",
			});
		} catch (error) {
			console.error(`Failed to send KYC approval email:`, error);
		}
	}

	return {
		...kyc,
		status: "approved",
		reviewedBy: adminId,
		reviewedAt: new Date(),
	};
};

export const rejectKYC = async (
	kycId: string,
	adminId: string,
	rejectionReason: string
): Promise<KycVerification> => {
	const kyc = await getKYCById(kycId);

	if (kyc.status !== "pending") {
		throw new Error(`Cannot reject KYC with status: ${kyc.status}`);
	}

	await kycCollection.doc(kycId).update({
		status: "rejected",
		rejectionReason,
		reviewedBy: adminId,
		reviewedAt: new Date(),
	});

	await logAdminAction(adminId, "REJECT_KYC", kycId, {
		userId: kyc.userId,
		reason: rejectionReason,
	});

	await kycCollection.doc(kycId).update({
		attemptCount: (kyc.attemptCount || 0) + 1,
	});

	const userDoc = kyc.userId ? await usersCollection.doc(kyc.userId).get() : null;
	const userData = userDoc?.data();

	if (userData?.email) {
		try {
			await sendKYCRejectedEmail({
				to: userData.email,
				displayName: userData.displayName || "User",
				reason: rejectionReason,
			});
		} catch (error) {
			console.error(`Failed to send KYC rejection email:`, error);
		}
	}

	return {
		...kyc,
		status: "rejected",
		rejectionReason,
		reviewedBy: adminId,
		reviewedAt: new Date(),
		attemptCount: (kyc.attemptCount || 0) + 1,
	};
};

export const getKYCStats = async (): Promise<{
	total: number;
	pending: number;
	approved: number;
	rejected: number;
	approvedToday: number;
	rejectedToday: number;
}> => {
	const snapshot = await kycCollection.get();

	const today = new Date();
	today.setHours(0, 0, 0, 0);

	let pending = 0;
	let approved = 0;
	let rejected = 0;
	let approvedToday = 0;
	let rejectedToday = 0;

	for (const doc of snapshot.docs) {
		const data = doc.data();

		if (data.status === "pending") pending++;
		else if (data.status === "approved") {
			approved++;
			const reviewedAt = data.reviewedAt?.toDate();
			if (reviewedAt && reviewedAt >= today) {
				approvedToday++;
			}
		} else if (data.status === "rejected") {
			rejected++;
			const reviewedAt = data.reviewedAt?.toDate();
			if (reviewedAt && reviewedAt >= today) {
				rejectedToday++;
			}
		}
	}

	return {
		total: snapshot.size,
		pending,
		approved,
		rejected,
		approvedToday,
		rejectedToday,
	};
};

export const getUserKYC = async (userId: string): Promise<KycVerification | null> => {
	const snapshot = await kycCollection
		.where("userId", "==", userId)
		.orderBy("submittedAt", "desc")
		.limit(1)
		.get();

	if (snapshot.empty) {
		return null;
	}

	const doc = snapshot.docs[0];
	const data = doc.data();

	return {
		id: doc.id,
		...data,
		submittedAt: data.submittedAt?.toDate(),
		reviewedAt: data.reviewedAt?.toDate(),
	} as KycVerification;
};

export const submitKYC = async (
	userId: string,
	params: SubmitKYCParams
): Promise<KycVerification> => {
	const existingSnapshot = await kycCollection
		.where("userId", "==", userId)
		.where("status", "==", "pending")
		.get();

	if (!existingSnapshot.empty) {
		throw new Error("You already have a pending KYC verification");
	}

	const docRef = await kycCollection.add({
		userId,
		status: "pending",
		idDocumentURL: params.idDocumentURL,
		selfieURL: params.selfieURL,
		kycProvider: params.kycProvider || "manual",
		rejectionReason: null,
		attemptCount: 1,
		reviewedBy: null,
		submittedAt: new Date(),
		reviewedAt: null,
	});

	const doc = await docRef.get();
	const data = doc.data();

	return {
		id: doc.id,
		...data,
		submittedAt: data?.submittedAt?.toDate(),
		reviewedAt: data?.reviewedAt?.toDate(),
	} as KycVerification;
};

export const getUserKYCWithProfile = async (userId: string) => {
	const kyc = await getUserKYC(userId);

	const userDoc = await usersCollection.doc(userId).get();
	const userData = userDoc.data();

	return {
		kyc,
		user: userData
			? {
					id: userDoc.id,
					email: userData.email,
					displayName: userData.displayName,
					photoURL: userData.photoURL,
					isKycVerified: userData.isKycVerified,
				}
			: null,
	};
};