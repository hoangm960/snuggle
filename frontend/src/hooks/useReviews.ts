import { useState, useEffect } from "react";
import api from "@/lib/api";

export interface Review {
	id?: string;
	shelterId?: string;
	reviewerId: string;
	reviewerName?: string;
	reviewerEmail?: string;
	rating: number;
	comment?: string;
	status: "pending" | "approved" | "flagged" | "removed";
	createdAt: Date | string;
}

interface UseReviewsReturn {
	reviews: Review[];
	loading: boolean;
	error: string | null;
	fetchReviews: () => Promise<void>;
	updateStatus: (shelterId: string, id: string, status: Review["status"]) => Promise<Review | null>;
}

export const useReviews = (): UseReviewsReturn => {
	const [reviews, setReviews] = useState<Review[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchReviews = async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await api.get("/admin/reviews");
			setReviews(res.data.data || []);
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : "Failed to fetch reviews");
		} finally {
			setLoading(false);
		}
	};

	const updateStatus = async (
		shelterId: string,
		id: string,
		status: Review["status"]
	): Promise<Review | null> => {
		try {
			const res = await api.put(`/admin/reviews/${shelterId}/${id}/status`, { status });
			const updated = res.data.data as Review;
			setReviews((prev) => prev.map((r) => (r.id === id ? updated : r)));
			return updated;
		} catch {
			return null;
		}
	};

	useEffect(() => {
		fetchReviews();
	}, []);

	return { reviews, loading, error, fetchReviews, updateStatus };
};
