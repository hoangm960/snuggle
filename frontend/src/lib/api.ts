import axios from "axios";
import { auth } from "./firebase";
import { getIdToken } from "firebase/auth";
import { getToken, clearAuthSession } from "./cookies";

const api = axios.create({
	baseURL: "/api",
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

export default api;
