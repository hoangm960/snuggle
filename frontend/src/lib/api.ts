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

export default api;
