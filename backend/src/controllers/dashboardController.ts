import { db } from "../config/firebase";
import { AdoptionApplication } from "../types";

interface DashboardStats {
	totalPets: number;
	pendingRequests: number;
	activeUsers: number;
	totalDonations: number;
	adoptionRate: number;
	petsAddedThisWeek: number;
	requestsAddedToday: number;
	usersAddedThisMonth: number;
	donationsThisWeek: number;
}

interface RecentRequest {
	id: string;
	petName: string;
	petThumbnail?: string;
	adopterName: string;
	adopterPhoto?: string;
	appliedAt: Date;
	status: AdoptionApplication["status"];
}

interface DashboardResponse {
	stats: DashboardStats;
	recentRequests: RecentRequest[];
}

const petsCollection = db.collection("pets");
const applicationsCollection = db.collection("adoptionApplications");
const usersCollection = db.collection("users");
const chatsCollection = db.collection("chats");

export const getDashboardStats = async (): Promise<DashboardStats> => {
	const now = new Date();
	const weekAgo = new Date(now);
	weekAgo.setDate(weekAgo.getDate() - 7);
	const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

	const [petsSnapshot, pendingSnapshot, usersSnapshot, allApplications] = await Promise.all([
		petsCollection.get(),
		applicationsCollection.where("status", "==", "pending").get(),
		usersCollection.where("accountStatus", "==", "active").get(),
		applicationsCollection.get(),
	]);

	const petsThisWeek = petsSnapshot.docs.filter((doc) => {
		const created = doc.data().createdAt;
		return created && new Date(created.toDate()) >= weekAgo;
	}).length;

	const requestsToday = pendingSnapshot.docs.filter((doc) => {
		const applied = doc.data().appliedAt;
		return applied && new Date(applied.toDate()) >= todayStart;
	}).length;

	const _usersThisMonth = await usersCollection
		.where("createdAt", ">=", monthStart)
		.get()
		.then((snap) => snap.size)
		.catch(() => 0);

	const totalApps = allApplications.size;
	const completedApps = allApplications.docs.filter(
		(doc) => doc.data().status === "completed"
	).length;
	const adoptionRate = totalApps > 0 ? Math.round((completedApps / totalApps) * 100) : 0;

	return {
		totalPets: petsSnapshot.size,
		pendingRequests: pendingSnapshot.size,
		activeUsers: usersSnapshot.size,
		totalDonations: 0,
		adoptionRate,
		petsAddedThisWeek: petsThisWeek,
		requestsAddedToday: requestsToday,
		usersAddedThisMonth: _usersThisMonth,
		donationsThisWeek: 0,
	};
};

export const getRecentApplications = async (limit: number = 5): Promise<RecentRequest[]> => {
	const snapshot = await applicationsCollection.orderBy("appliedAt", "desc").limit(limit).get();

	const results: RecentRequest[] = [];

	for (const doc of snapshot.docs) {
		const data = doc.data();
		const [petDoc, adopterDoc] = await Promise.all([
			data.petId ? petsCollection.doc(data.petId).get() : null,
			data.adopterId ? usersCollection.doc(data.adopterId).get() : null,
		]);

		results.push({
			id: doc.id,
			petName: data.name || petDoc?.data()?.name || "Unknown",
			petThumbnail: petDoc?.data()?.thumbnail || petDoc?.data()?.photoURLs?.[0],
			adopterName: data.adopterName || adopterDoc?.data()?.displayName || "Unknown",
			adopterPhoto:
				adopterDoc?.data()?.photoURL ||
				`https://ui-avatars.com/api/?name=${encodeURIComponent(data.adopterName || "U")}&background=random`,
			appliedAt: data.appliedAt?.toDate() || new Date(),
			status: data.status || "pending",
		});
	}

	return results;
};

export const getDashboardData = async (): Promise<DashboardResponse> => {
	const [stats, recentRequests] = await Promise.all([
		getDashboardStats(),
		getRecentApplications(5),
	]);

	return { stats, recentRequests };
};

interface SidebarStats {
	pendingRequests: number;
	pendingReviews: number;
	pendingChats: number;
	petsAdoptedThisWeek: number;
}

export const getSidebarStats = async (): Promise<SidebarStats> => {
	const now = new Date();
	const weekAgo = new Date(now);
	weekAgo.setDate(weekAgo.getDate() - 7);

	const [pendingRequestsSnap, pendingReviewsSnap, pendingChatsSnap, petsSnap] = await Promise.all(
		[
			applicationsCollection.where("status", "==", "pending").get(),
			db.collectionGroup("reviews").where("status", "==", "pending").get(),
			chatsCollection.where("type", "==", "support").where("claimedBy", "==", null).get(),
			petsCollection.where("status", "==", "adopted").get(),
		]
	);

	const petsAdoptedThisWeek = petsSnap.docs.filter((doc) => {
		const adoptedAt = doc.data().adoptedAt;
		return adoptedAt && new Date(adoptedAt.toDate()) >= weekAgo;
	}).length;

	return {
		pendingRequests: pendingRequestsSnap.size,
		pendingReviews: pendingReviewsSnap.size,
		pendingChats: pendingChatsSnap.size,
		petsAdoptedThisWeek,
	};
};
