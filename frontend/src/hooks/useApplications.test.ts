import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useApplications } from "./useApplications";

vi.mock("@/lib/api", () => ({
	__esModule: true,
	default: {
		get: vi.fn(),
		put: vi.fn(),
	},
}));

const mockApplications = [
	{
		id: "app-1",
		petId: "pet-1",
		name: "Buddy",
		adopterId: "user-1",
		adopterName: "John",
		shelterId: "shelter-1",
		status: "pending" as const,
		appliedAt: new Date().toISOString(),
	},
	{
		id: "app-2",
		petId: "pet-2",
		name: "Whiskers",
		adopterId: "user-2",
		adopterName: "Jane",
		shelterId: "shelter-1",
		status: "approved" as const,
		appliedAt: new Date().toISOString(),
	},
];

describe("useApplications", () => {
	let apiModule: typeof import("@/lib/api");

	beforeEach(async () => {
		vi.resetModules();
		apiModule = await import("@/lib/api");
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("should fetch applications on mount", async () => {
		apiModule.default.get = vi.fn().mockResolvedValue({
			data: { data: mockApplications },
		});

		const { result } = renderHook(() => useApplications());

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.applications).toHaveLength(2);
		expect(result.current.applications[0].name).toBe("Buddy");
	});

	it("should return empty array when no data", async () => {
		apiModule.default.get = vi.fn().mockResolvedValue({ data: {} });

		const { result } = renderHook(() => useApplications());

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.applications).toEqual([]);
	});

	it("should set error on fetch failure", async () => {
		apiModule.default.get = vi.fn().mockRejectedValue(new Error("Network error"));

		const { result } = renderHook(() => useApplications());

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.error).toBe("Network error");
	});

	it("should provide updateStatus function", async () => {
		apiModule.default.get = vi.fn().mockResolvedValue({
			data: { data: mockApplications },
		});
		apiModule.default.put = vi.fn().mockResolvedValue({
			data: {
				data: { ...mockApplications[0], status: "approved" as const },
			},
		});

		const { result } = renderHook(() => useApplications());

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(typeof result.current.updateStatus).toBe("function");
	});

	it("should update local state on updateStatus success", async () => {
		apiModule.default.get = vi.fn().mockResolvedValue({
			data: { data: mockApplications },
		});
		const updatedApp = { ...mockApplications[0], status: "approved" as const };
		apiModule.default.put = vi.fn().mockResolvedValue({
			data: { data: updatedApp },
		});

		const { result } = renderHook(() => useApplications());

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		await act(async () => {
			await result.current.updateStatus("app-1", "approved", "Looks good");
		});

		expect(result.current.applications[0].status).toBe("approved");
	});

	it("should return null from updateStatus on failure", async () => {
		apiModule.default.get = vi.fn().mockResolvedValue({
			data: { data: mockApplications },
		});
		apiModule.default.put = vi.fn().mockRejectedValue(new Error("Update failed"));

		const { result } = renderHook(() => useApplications());

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		const res = await result.current.updateStatus("app-1", "approved");
		expect(res).toBeNull();
	});

	it("should provide fetchApplications function", async () => {
		apiModule.default.get = vi.fn().mockResolvedValue({
			data: { data: mockApplications },
		});

		const { result } = renderHook(() => useApplications());

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(typeof result.current.fetchApplications).toBe("function");
	});

	it("should re-fetch on fetchApplications call", async () => {
		apiModule.default.get = vi.fn().mockResolvedValue({
			data: { data: [] },
		});

		const { result } = renderHook(() => useApplications());

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		apiModule.default.get = vi.fn().mockResolvedValue({
			data: { data: mockApplications },
		});

		await act(async () => {
			await result.current.fetchApplications();
		});

		expect(result.current.applications).toHaveLength(2);
	});
});
