import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useQuiz } from "./useQuiz";

vi.mock("@/lib/api", () => ({
	__esModule: true,
	default: {
		get: vi.fn(),
		post: vi.fn(),
	},
}));

const mockQuestions = [
	{
		id: "q-1",
		order: 1,
		category: "lifestyle",
		question: "What is your home type?",
		options: [{ value: "house", label: "House", icon: "house", weights: {} }],
		isActive: true,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
];

const mockMatches = [
	{
		pet: {
			id: "pet-1",
			name: "Buddy",
			species: "dog",
			breed: "Golden Retriever",
			ageMonths: 12,
			size: "large",
			gender: "male",
			status: "available",
		},
		pct: 95,
	},
];

describe("useQuiz", () => {
	let apiModule: typeof import("@/lib/api");

	beforeEach(async () => {
		vi.resetModules();
		apiModule = await import("@/lib/api");
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("should fetch questions on mount", async () => {
		apiModule.default.get = vi.fn().mockResolvedValue({
			data: { data: mockQuestions },
		});

		const { result } = renderHook(() => useQuiz());

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.questions).toHaveLength(1);
		expect(result.current.questions[0].category).toBe("lifestyle");
	});

	it("should return empty questions array when fetch fails silently", async () => {
		apiModule.default.get = vi.fn().mockRejectedValue(new Error("Network error"));

		const { result } = renderHook(() => useQuiz());

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.questions).toEqual([]);
		expect(result.current.matches).toBeNull();
	});

	it("should submit answers and return matches", async () => {
		apiModule.default.get = vi.fn().mockResolvedValue({
			data: { data: mockQuestions },
		});

		const { result } = renderHook(() => useQuiz());

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		apiModule.default.post = vi.fn().mockResolvedValue({
			data: { data: mockMatches },
		});

		await act(async () => {
			await result.current.submitAnswers({ q1: "house" });
		});

		expect(result.current.matching).toBe(false);
		expect(result.current.matches).toEqual(mockMatches);
	});

	it("should set empty matches array on submit failure", async () => {
		apiModule.default.get = vi.fn().mockResolvedValue({
			data: { data: mockQuestions },
		});

		const { result } = renderHook(() => useQuiz());

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		apiModule.default.post = vi.fn().mockRejectedValue(new Error("Match failed"));

		await act(async () => {
			await result.current.submitAnswers({ q1: "house" });
		});

		expect(result.current.matching).toBe(false);
		expect(result.current.matches).toEqual([]);
	});

	it("should set matching true during submission", async () => {
		apiModule.default.get = vi.fn().mockResolvedValue({
			data: { data: mockQuestions },
		});
		apiModule.default.post = vi.fn(() => new Promise((resolve) => setTimeout(resolve, 100)));

		const { result } = renderHook(() => useQuiz());

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		act(() => {
			result.current.submitAnswers({ q1: "house" });
		});

		expect(result.current.matching).toBe(true);
	});

	it("should reset matches to null on reset", async () => {
		apiModule.default.get = vi.fn().mockResolvedValue({
			data: { data: mockQuestions },
		});
		apiModule.default.post = vi.fn().mockResolvedValue({
			data: { data: mockMatches },
		});

		const { result } = renderHook(() => useQuiz());

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		await act(async () => {
			await result.current.submitAnswers({ q1: "house" });
		});

		expect(result.current.matches).toEqual(mockMatches);

		act(() => {
			result.current.reset();
		});

		expect(result.current.matches).toBeNull();
	});
});
