import { auth, db } from "../config/firebase";
import { User, AdoptionApplication, SavedSearch } from "../types";
import { sendInviteEmail } from "../services/emailService";
import { randomBytes } from "crypto";

const usersCollection = db.collection("users");
const auditLogCollection = db.collection("adminAuditLog");
const invitationsCollection = db.collection("invitations");

interface GetUsersParams {
	search?: string;
	role?: string;
	status?: string;
	page?: number;
	limit?: number;
}

interface UsersResponse {
	users: User[];
	total: number;
	lastDocSnapshot?: string;
}

export const getAllUsers = async (params: GetUsersParams): Promise<UsersResponse> => {
	const { search, role, status, page = 1, limit = 20 } = params;

	let query: FirebaseFirestore.Query = usersCollection;

	if (role) {
		query = query.where("role", "==", role);
	}

	if (status) {
		query = query.where("accountStatus", "==", status);
	}

	let filteredDocs: FirebaseFirestore.QueryDocumentSnapshot[] = [];

	if (search) {
		const searchLower = search.toLowerCase();
		const allDocs = await query.get();
		filteredDocs = allDocs.docs.filter((doc) => {
			const data = doc.data();
			const email = (data.email || "").toLowerCase();
			const displayName = (data.displayName || "").toLowerCase();
			return email.includes(searchLower) || displayName.includes(searchLower);
		});
	} else {
		const snapshot = await query.get();
		filteredDocs = snapshot.docs;
	}

	const total = filteredDocs.length;

	const sortedDocs = filteredDocs.sort((a, b) => {
		const dateA = a.data().createdAt?.toDate?.() || new Date(0);
		const dateB = b.data().createdAt?.toDate?.() || new Date(0);
		return dateB.getTime() - dateA.getTime();
	});

	const startIndex = (page - 1) * limit;
	const paginatedDocs = sortedDocs.slice(startIndex, startIndex + limit);

	const users: User[] = paginatedDocs.map((doc) => {
		const data = doc.data();
		return {
			id: doc.id,
			...data,
			createdAt: data.createdAt?.toDate(),
			updatedAt: data.updatedAt?.toDate(),
		} as User;
	});

	const lastDocSnapshot = paginatedDocs[paginatedDocs.length - 1]?.id || undefined;

	return { users, total, lastDocSnapshot };
};

export const getUserById = async (userId: string): Promise<User> => {
	const userDoc = await usersCollection.doc(userId).get();

	if (!userDoc.exists) {
		throw new Error("User not found");
	}

	const userData = userDoc.data();
	return {
		id: userDoc.id,
		...userData,
		createdAt: userData?.createdAt?.toDate(),
		updatedAt: userData?.updatedAt?.toDate(),
	} as User;
};

export const getUserActivityHistory = async (userId: string) => {
	const applicationsSnapshot = await db
		.collection("adoptionApplications")
		.where("adopterId", "==", userId)
		.get();

	const applications: AdoptionApplication[] = applicationsSnapshot.docs.map((doc) => {
		const data = doc.data();
		return {
			id: doc.id,
			...data,
			appliedAt: data.appliedAt?.toDate(),
			reviewedAt: data.reviewedAt?.toDate(),
		} as AdoptionApplication;
	});

	const savedSearchesSnapshot = await db
		.collection("savedSearches")
		.where("userId", "==", userId)
		.get();

	const savedSearches: SavedSearch[] = savedSearchesSnapshot.docs.map((doc) => {
		const data = doc.data();
		return {
			id: doc.id,
			...data,
			createdAt: data.createdAt?.toDate(),
		} as SavedSearch;
	});

	const userDoc = await usersCollection.doc(userId).get();
	const userData = userDoc.data();
	const loginCount = userData?.loginCount || 0;

	return {
		loginCount,
		applications,
		savedSearches,
		applicationCount: applications.length,
		savedSearchCount: savedSearches.length,
	};
};

export const updateUserRole = async (
	adminId: string,
	targetUserId: string,
	newRole: "visitor" | "admin"
): Promise<User> => {
	if (adminId === targetUserId) {
		throw new Error("Action Denied: You cannot modify your own administrative status");
	}

	const userDoc = await usersCollection.doc(targetUserId).get();

	if (!userDoc.exists) {
		throw new Error("User not found");
	}

	await usersCollection.doc(targetUserId).update({
		role: newRole,
		updatedAt: new Date(),
	});

	await logAdminAction(adminId, "UPDATE_ROLE", targetUserId, {
		previousRole: userDoc.data()?.role,
		newRole,
	});

	const updatedDoc = await usersCollection.doc(targetUserId).get();
	const userData = updatedDoc.data();
	return {
		id: updatedDoc.id,
		...userData,
		createdAt: userData?.createdAt?.toDate(),
		updatedAt: userData?.updatedAt?.toDate(),
	} as User;
};

export const updateUserStatus = async (
	adminId: string,
	targetUserId: string,
	newStatus: "active" | "suspended"
): Promise<User> => {
	if (adminId === targetUserId) {
		throw new Error("Action Denied: You cannot modify your own administrative status");
	}

	const userDoc = await usersCollection.doc(targetUserId).get();

	if (!userDoc.exists) {
		throw new Error("User not found");
	}

	const previousStatus = userDoc.data()?.accountStatus;

	await usersCollection.doc(targetUserId).update({
		accountStatus: newStatus,
		updatedAt: new Date(),
	});

	await logAdminAction(adminId, "UPDATE_STATUS", targetUserId, {
		previousStatus,
		newStatus,
	});

	if (newStatus === "suspended") {
		await revokeUserSessions(targetUserId);
		await logAdminAction(adminId, "REVOKE_SESSIONS", targetUserId, {
			reason: "Account suspended",
		});
	}

	const updatedDoc = await usersCollection.doc(targetUserId).get();
	const userData = updatedDoc.data();
	return {
		id: updatedDoc.id,
		...userData,
		createdAt: userData?.createdAt?.toDate(),
		updatedAt: userData?.updatedAt?.toDate(),
	} as User;
};

export const revokeUserSessions = async (userId: string): Promise<void> => {
	try {
		await auth.revokeRefreshTokens(userId);
	} catch (error) {
		console.error(`Failed to revoke sessions for user ${userId}:`, error);
		throw new Error("Failed to revoke user sessions");
	}
};

export const logAdminAction = async (
	adminId: string,
	action: string,
	targetUserId: string,
	details?: Record<string, unknown>
): Promise<void> => {
	await auditLogCollection.add({
		adminId,
		action,
		targetUserId,
		details,
		createdAt: new Date(),
	});
};

function generateInviteToken(): string {
	return randomBytes(32).toString("hex");
}

export interface InviteUserParams {
	email: string;
	role: "visitor" | "admin";
	adminId: string;
	adminName: string;
}

export const inviteUser = async ({
	email,
	role,
	adminId,
	adminName,
}: InviteUserParams): Promise<{ success: boolean; message: string }> => {
	const emailLower = email.toLowerCase();

	const existingUsers = await usersCollection.where("email", "==", emailLower).get();
	if (!existingUsers.empty) {
		const existingUser = existingUsers.docs[0];
		const userData = existingUser.data() as User;
		await usersCollection.doc(existingUser.id).update({
			role,
			updatedAt: new Date(),
		});
		await logAdminAction(adminId, "INVITE_EXISTING_USER", existingUser.id, {
			email: emailLower,
			role,
		});
		return {
			success: true,
			message: `User with this email already exists. Their role has been updated to ${role}.`,
		};
	}

	const existingInvites = await invitationsCollection.where("email", "==", emailLower).get();
	if (!existingInvites.empty) {
		return {
			success: false,
			message: "An invitation has already been sent to this email.",
		};
	}

	const inviteToken = generateInviteToken();
	const expiresAt = new Date();
	expiresAt.setDate(expiresAt.getDate() + 7);

	await invitationsCollection.add({
		email: emailLower,
		role,
		invitedBy: adminId,
		inviteToken,
		expiresAt,
		createdAt: new Date(),
	});

	await logAdminAction(adminId, "SEND_INVITE", emailLower, { role });

	try {
		await sendInviteEmail({
			to: emailLower,
			inviteToken,
			role,
			invitedByName: adminName || "An administrator",
		});
	} catch (error) {
		console.error("Failed to send invite email:", error);
		return {
			success: false,
			message: "Failed to send invitation email. Please check SMTP configuration.",
		};
	}

	return {
		success: true,
		message: `Invitation sent successfully to ${email}.`,
	};
};

export const validateInviteToken = async (
	token: string
): Promise<{ email: string; role: "visitor" | "admin" } | null> => {
	const invites = await invitationsCollection.where("inviteToken", "==", token).get();

	if (invites.empty) {
		return null;
	}

	const inviteDoc = invites.docs[0];
	const inviteData = inviteDoc.data();

	if (new Date(inviteData.expiresAt) < new Date()) {
		await invitationsCollection.doc(inviteDoc.id).delete();
		return null;
	}

	return {
		email: inviteData.email,
		role: inviteData.role,
	};
};

export const deleteInvite = async (token: string): Promise<void> => {
	const invites = await invitationsCollection.where("inviteToken", "==", token).get();
	if (!invites.empty) {
		await invitationsCollection.doc(invites.docs[0].id).delete();
	}
};

export const deleteUser = async (
	adminId: string,
	targetUserId: string
): Promise<{ success: boolean; message: string }> => {
	if (adminId === targetUserId) {
		throw new Error("Action Denied: You cannot delete your own account");
	}

	const userDoc = await usersCollection.doc(targetUserId).get();

	if (!userDoc.exists) {
		throw new Error("User not found");
	}

	const userData = userDoc.data();
	const userEmail = userData?.email;

	await usersCollection.doc(targetUserId).delete();

	await logAdminAction(adminId, "DELETE_USER", targetUserId, {
		email: userEmail,
	});

	try {
		await auth.deleteUser(targetUserId);
	} catch (error) {
		console.error(`Failed to delete Firebase Auth user ${targetUserId}:`, error);
	}

	return {
		success: true,
		message: `User ${userEmail || targetUserId} has been deleted successfully`,
	};
};
