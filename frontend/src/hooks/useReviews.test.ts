import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useReviews } from "./useReviews";

vi.mock("@/lib/api", () => ({
	__esModule: true,
	default: {
		get: vi.fn(),
		put: vi.fn(),
	},
}));

const mockReviews = [
	{
		id: "rev-1",
		shelterId: "shelter-1",
		reviewerId: "user-1",
		reviewerName: "John",
		rating: 5,
		comment: "Great shelter",
		status: "pending" as const,
		createdAt: new Date().toISOString(),
	},
	{
		id: "rev-2",
		shelterId: "shelter-1",
		reviewerId: "user-2",
		reviewerName: "Jane",
		rating: 4,
		comment: "Good experience",
		status: "approved" as const,
		createdAt: new Date().toISOString(),
	},
];

describe("useReviews", () => {
	let apiModule: typeof import("@/lib/api");

	beforeEach(async () => {
		vi.resetModules();
		apiModule = await import("@/lib/api");
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("should fetch reviews on mount", async () => {
		apiModule.default.get = vi.fn().mockResolvedValue({
			data: { data: mockReviews },
		});

		const { result } = renderHook(() => useReviews());

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.reviews).toHaveLength(2);
		expect(result.current.reviews[0].reviewerName).toBe("John");
	});

	it("should return empty array when no data", async () => {
		apiModule.default.get = vi.fn().mockResolvedValue({ data: {} });

		const { result } = renderHook(() => useReviews());

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.reviews).toEqual([]);
	});

	it("should set error on fetch failure", async () => {
		apiModule.default.get = vi.fn().mockRejectedValue(new Error("Network error"));

		const { result } = renderHook(() => useReviews());

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.error).toBe("Network error");
	});

	it("should set generic error message on non-Error fetch failure", async () => {
		apiModule.default.get = vi.fn().mockRejectedValue("string error");

		const { result } = renderHook(() => useReviews());

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.error).toBe("Failed to fetch reviews");
	});

	it("should update local state on updateStatus success", async () => {
		apiModule.default.get = vi.fn().mockResolvedValue({
			data: { data: mockReviews },
		});
		const updatedReview = { ...mockReviews[0], status: "approved" as const };
		apiModule.default.put = vi.fn().mockResolvedValue({
			data: { data: updatedReview },
		});

		const { result } = renderHook(() => useReviews());

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		await act(async () => {
			await result.current.updateStatus("shelter-1", "rev-1", "approved");
		});

		expect(result.current.reviews[0].status).toBe("approved");
	});

	it("should return null from updateStatus on failure", async () => {
		apiModule.default.get = vi.fn().mockResolvedValue({
			data: { data: mockReviews },
		});
		apiModule.default.put = vi.fn().mockRejectedValue(new Error("Update failed"));

		const { result } = renderHook(() => useReviews());

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		const res = await result.current.updateStatus("shelter-1", "rev-1", "approved");
		expect(res).toBeNull();
		expect(result.current.reviews[0].status).toBe("pending");
	});

	it("should provide fetchReviews function", async () => {
		apiModule.default.get = vi.fn().mockResolvedValue({
			data: { data: mockReviews },
		});

		const { result } = renderHook(() => useReviews());

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(typeof result.current.fetchReviews).toBe("function");
	});

	it("should re-fetch on fetchReviews call", async () => {
		apiModule.default.get = vi.fn().mockResolvedValue({
			data: { data: [] },
		});

		const { result } = renderHook(() => useReviews());

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		apiModule.default.get = vi.fn().mockResolvedValue({
			data: { data: mockReviews },
		});

		await act(async () => {
			await result.current.fetchReviews();
		});

		expect(result.current.reviews).toHaveLength(2);
	});
});
