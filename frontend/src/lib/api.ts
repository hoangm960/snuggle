import axios from "axios";
import { auth } from "./firebase";
import { getIdToken } from "firebase/auth";
import { getToken, clearAuthSession } from "./cookies";

const api = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
	headers: {
		"Content-Type": "application/json",
	},
});

api.interceptors.request.use(
	async (config) => {
		// Add backend token from cookies if available
		const backendToken = getToken();
		if (backendToken) {
			config.headers.Authorization = `Bearer ${backendToken}`;
		}

		// Add Firebase token if available (for Firebase-specific endpoints)
		const user = auth.currentUser;
		if (user) {
			const fbToken = await getIdToken(user);
			// Keep existing Firebase token or use it as secondary
			if (!config.headers.Authorization) {
				config.headers.Authorization = `Bearer ${fbToken}`;
			}
		}
		return config;
	},
	(error) => Promise.reject(error)
);

api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			// Clear auth session on 401
			clearAuthSession();
		}
		return Promise.reject(error);
	}
);

export interface HealthRecordWithPet {
	id: string;
	petId: string;
	petName: string;
	petSpecies: string;
	type: "vaccine" | "checkup" | "treatment";
	title?: string;
	description?: string;
	vetName?: string;
	recordDate: Date;
	createdAt: Date;
}

export interface CreateHealthRecordDto {
	petId: string;
	type: "vaccine" | "checkup" | "treatment";
	title?: string;
	description?: string;
	vetName?: string;
	recordDate?: string;
}

export const healthRecordsApi = {
	getAll: (type?: string) =>
		api.get<{ success: boolean; data: HealthRecordWithPet[] }>("/admin/health-records", {
			params: type && type !== "all" ? { type } : {},
		}),

	create: (data: CreateHealthRecordDto) =>
		api.post<{ success: boolean; data: HealthRecordWithPet }>("/admin/health-records", data),

	delete: (petId: string, recordId: string) =>
		api.delete<{ success: boolean }>(`/admin/health-records/${petId}/${recordId}`),
};

export const petsApi = {
	getAll: (limit = 100) =>
		api.get<{ success: boolean; data: any[] }>("/pets", {
			params: { limit },
		}),
};

export interface Contract {
	id: string;
	petName: string;
	adopter: string;
	adopterEmail: string;
	shelter: string;
	signedAt?: string;
	expiresAt: string;
	status: "active" | "pending_signature" | "expired" | "terminated";
	adoptionDate: string;
	petId?: string;
	adopterId?: string;
	applicationId?: string;
	contractFileURL?: string;
	adopterSignedAt?: string;
	shelterSignedAt?: string;
}

export interface CreateContractDto {
	applicationId: string;
	petId: string;
	adopterId: string;
}

export interface SignContractDto {
	role: "adopter" | "shelter";
	contractFileURL?: string;
	contractHash?: string;
	signedName?: string;
}

export const contractsApi = {
	getAll: () => api.get<{ success: boolean; data: Contract[] }>("/contracts"),

	getById: (id: string) => api.get<{ success: boolean; data: Contract }>(`/contracts/${id}`),

	create: (data: CreateContractDto) =>
		api.post<{ success: boolean; data: Contract }>("/contracts", data),

	sign: (id: string, data: SignContractDto) =>
		api.put<{ success: boolean; data: Contract }>(`/contracts/${id}/sign`, data),

	generatePdf: (id: string) =>
		api.post<{ success: boolean; data: { pdfUrl: string } }>(`/contracts/${id}/pdf`),
};

export interface Application {
	id: string;
	petId: string;
	name: string;
	adopterId: string;
	adopterName: string;
	shelterId: string;
	status: "pending" | "approved" | "rejected" | "completed";
	message?: string;
	adminNote?: string;
	appliedAt: string;
	reviewedAt?: string;
	petThumbnail?: string;
	petSpecies?: string;
}

export const applicationsApi = {
	getMyApplications: (adopterId: string) =>
		api.get<{ success: boolean; data: Application[] }>("/applications", {
			params: { adopterId },
		}),
};

export default api;
