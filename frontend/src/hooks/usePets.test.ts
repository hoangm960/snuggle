import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { usePets } from "./usePets";

vi.mock("@/lib/api", () => ({
	__esModule: true,
	default: {
		get: vi.fn(),
		post: vi.fn(),
		put: vi.fn(),
		delete: vi.fn(),
	},
}));

const mockPets = [
	{
		id: "1",
		name: "Buddy",
		species: "dog" as const,
		breed: "Golden Retriever",
		age: 3,
		gender: "male" as const,
		description: "Friendly dog",
		imageUrl: "https://example.com/dog.jpg",
		shelterId: "shelter1",
		status: "available" as const,
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		id: "2",
		name: "Whiskers",
		species: "cat" as const,
		breed: "Persian",
		age: 2,
		gender: "female" as const,
		description: "Calm cat",
		imageUrl: "https://example.com/cat.jpg",
		shelterId: "shelter1",
		status: "available" as const,
		createdAt: new Date(),
		updatedAt: new Date(),
	},
];

describe("usePets", () => {
	let apiModule: typeof import("@/lib/api");

	beforeEach(async () => {
		vi.resetModules();
		apiModule = await import("@/lib/api");
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("should return empty pets array initially", async () => {
		apiModule.default.get = vi.fn().mockResolvedValue({ data: { data: [] } });

		const { result } = renderHook(() => usePets());

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.pets).toEqual([]);
	});

	it("should fetch pets on mount", async () => {
		apiModule.default.get = vi.fn().mockResolvedValue({
			data: { data: mockPets },
		});

		const { result } = renderHook(() => usePets());

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.pets).toHaveLength(2);
		expect(result.current.pets[0].name).toBe("Buddy");
	});

	it("should set error on fetch failure", async () => {
		apiModule.default.get = vi.fn().mockRejectedValue(new Error("Network error"));

		const { result } = renderHook(() => usePets());

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.error).toBe("Network error");
	});

	it("should provide fetchPets function", async () => {
		apiModule.default.get = vi.fn().mockResolvedValue({ data: { data: [] } });

		const { result } = renderHook(() => usePets());

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(typeof result.current.fetchPets).toBe("function");
	});

	it("should provide createPet function", async () => {
		const newPet = {
			name: "Max",
			species: "dog" as const,
			breed: "Labrador",
			age: 1,
			gender: "male" as const,
			description: "Puppy",
			imageUrl: "https://example.com/max.jpg",
			shelterId: "shelter1",
			status: "available" as const,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		apiModule.default.post = vi.fn().mockResolvedValue({
			data: { data: { id: "3", ...newPet } },
		});

		const { result } = renderHook(() => usePets());

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(typeof result.current.createPet).toBe("function");
	});

	it("should provide updatePet function", async () => {
		apiModule.default.get = vi.fn().mockResolvedValue({
			data: { data: mockPets },
		});

		const { result } = renderHook(() => usePets());

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(typeof result.current.updatePet).toBe("function");
	});

	it("should provide deletePet function", async () => {
		apiModule.default.get = vi.fn().mockResolvedValue({
			data: { data: mockPets },
		});

		const { result } = renderHook(() => usePets());

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(typeof result.current.deletePet).toBe("function");
	});

	it("should provide getPetById function", async () => {
		apiModule.default.get = vi.fn().mockResolvedValue({
			data: { data: mockPets[0] },
		});

		const { result } = renderHook(() => usePets());

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(typeof result.current.getPetById).toBe("function");
	});
});
