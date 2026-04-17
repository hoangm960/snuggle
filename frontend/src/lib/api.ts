import axios from "axios";
import { auth } from "./firebase";
import { getIdToken } from "firebase/auth";

const api = axios.create({
	baseURL: (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001") + "/api",
	headers: {
		"Content-Type": "application/json",
	},
});

api.interceptors.request.use(
	async (config) => {
		const user = auth.currentUser;
		if (user) {
			const token = await getIdToken(user);
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => Promise.reject(error)
);

api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			auth.signOut();
		}
		return Promise.reject(error);
	}
);

export default api;
