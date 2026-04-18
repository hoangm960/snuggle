import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";

export interface User {
	id: string;
	email: string;
	displayName: string | null;
	photoURL: string | null;
	role: "visitor" | "admin";
	accountStatus: "active" | "suspended";
	createdAt: string;
	updatedAt?: string;
}

interface UseUsersParams {
	search?: string;
	role?: string;
	status?: string;
	page?: number;
	limit?: number;
}

interface UseUsersReturn {
	users: User[];
	loading: boolean;
	error: string | null;
	total: number;
	fetchUsers: (params?: UseUsersParams) => Promise<void>;
	updateUserRole: (userId: string, role: "visitor" | "admin") => Promise<boolean>;
	updateUserStatus: (userId: string, status: "active" | "suspended") => Promise<boolean>;
}

export const useUsers = (): UseUsersReturn => {
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [total, setTotal] = useState(0);

	const fetchUsers = useCallback(async (params?: UseUsersParams) => {
		setLoading(true);
		setError(null);
		try {
			const queryParams = new URLSearchParams();
			if (params?.search) queryParams.append("search", params.search);
			if (params?.role) queryParams.append("role", params.role);
			if (params?.status) queryParams.append("status", params.status);
			if (params?.page) queryParams.append("page", params.page.toString());
			if (params?.limit) queryParams.append("limit", params.limit.toString());

			const response = await api.get(`/admin/users?${queryParams.toString()}`);
			setUsers(response.data.data.users || []);
			setTotal(response.data.data.total || 0);
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : "Failed to fetch users");
		} finally {
			setLoading(false);
		}
	}, []);

	const updateUserRole = async (userId: string, role: "visitor" | "admin"): Promise<boolean> => {
		try {
			await api.put(`/admin/users/${userId}`, { role });
			setUsers((prev) =>
				prev.map((u) => (u.id === userId ? { ...u, role } : u))
			);
			return true;
		} catch {
			return false;
		}
	};

	const updateUserStatus = async (userId: string, status: "active" | "suspended"): Promise<boolean> => {
		try {
			await api.put(`/admin/users/${userId}`, { accountStatus: status });
			setUsers((prev) =>
				prev.map((u) => (u.id === userId ? { ...u, accountStatus: status } : u))
			);
			return true;
		} catch {
			return false;
		}
	};

	return { users, loading, error, total, fetchUsers, updateUserRole, updateUserStatus };
};