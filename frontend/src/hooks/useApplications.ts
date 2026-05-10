import { useState, useEffect } from "react";
import api from "@/lib/api";
import type { AdoptionApplication } from "@/types";

interface UseApplicationsReturn {
	applications: AdoptionApplication[];
	loading: boolean;
	error: string | null;
	fetchApplications: () => Promise<void>;
	updateStatus: (
		id: string,
		status: AdoptionApplication["status"],
		adminNote?: string
	) => Promise<AdoptionApplication | null>;
}

export const useApplications = (): UseApplicationsReturn => {
	const [applications, setApplications] = useState<AdoptionApplication[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchApplications = async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await api.get("/applications");
			setApplications(res.data.data || []);
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : "Failed to fetch applications");
		} finally {
			setLoading(false);
		}
	};

	const updateStatus = async (
		id: string,
		status: AdoptionApplication["status"],
		adminNote?: string
	): Promise<AdoptionApplication | null> => {
		try {
			const res = await api.put(`/applications/${id}/status`, { status, adminNote });
			const updated = res.data.data as AdoptionApplication;
			setApplications((prev) => prev.map((a) => (a.id === id ? updated : a)));
			return updated;
		} catch {
			return null;
		}
	};

	useEffect(() => {
		fetchApplications();
	}, []);

	return { applications, loading, error, fetchApplications, updateStatus };
};
