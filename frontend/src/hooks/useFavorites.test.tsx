import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { FavoritesProvider, useFavorites } from "./useFavorites";

vi.mock("@/lib/api", () => ({
	__esModule: true,
	default: {
		get: vi.fn(),
		post: vi.fn(),
		delete: vi.fn(),
	},
}));

vi.mock("./useAuth", () => ({
	useAuth: vi.fn(() => ({ user: { uid: "user-1" } })),
}));

describe("useFavorites", () => {
	let apiModule: typeof import("@/lib/api");
	let useAuthModule: typeof import("./useAuth");

	beforeEach(async () => {
		vi.resetModules();
		apiModule = await import("@/lib/api");
		useAuthModule = await import("./useAuth");
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("should throw when used outside FavoritesProvider", () => {
		expect(() => renderHook(() => useFavorites())).toThrow(
			"useFavorites must be used inside FavoritesProvider"
		);
	});

	it("should fetch favorite IDs on mount when user is authenticated", async () => {
		(useAuthModule.useAuth as any).mockReturnValue({ user: { uid: "user-1" } });
		apiModule.default.get = vi.fn().mockResolvedValue({
			data: { data: [{ petId: "pet-1" }, { petId: "pet-2" }] },
		});

		const { result } = renderHook(() => useFavorites(), {
			wrapper: FavoritesProvider,
		});

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.favoriteIds).toEqual(new Set(["pet-1", "pet-2"]));
		expect(result.current.isFavorited("pet-1")).toBe(true);
		expect(result.current.isFavorited("pet-3")).toBe(false);
	});

	it("should not fetch when user is null", async () => {
		(useAuthModule.useAuth as any).mockReturnValue({ user: null });

		const { result } = renderHook(() => useFavorites(), {
			wrapper: FavoritesProvider,
		});

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.favoriteIds).toEqual(new Set());
		expect(apiModule.default.get).not.toHaveBeenCalled();
	});

	it("should call POST when favoriting a pet", async () => {
		(useAuthModule.useAuth as any).mockReturnValue({ user: { uid: "user-1" } });
		apiModule.default.get = vi.fn().mockResolvedValue({
			data: { data: [] },
		});
		apiModule.default.post = vi.fn().mockResolvedValue({});

		const { result } = renderHook(() => useFavorites(), {
			wrapper: FavoritesProvider,
		});

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		await act(async () => {
			await result.current.toggleFavorite("pet-1");
		});

		expect(apiModule.default.post).toHaveBeenCalledWith("/favorites/pet-1");
		expect(result.current.isFavorited("pet-1")).toBe(true);
	});

	it("should call DELETE when unfavoriting a pet", async () => {
		(useAuthModule.useAuth as any).mockReturnValue({ user: { uid: "user-1" } });
		apiModule.default.get = vi.fn().mockResolvedValue({
			data: { data: [{ petId: "pet-1" }] },
		});
		apiModule.default.delete = vi.fn().mockResolvedValue({});

		const { result } = renderHook(() => useFavorites(), {
			wrapper: FavoritesProvider,
		});

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.isFavorited("pet-1")).toBe(true);

		await act(async () => {
			await result.current.toggleFavorite("pet-1");
		});

		expect(apiModule.default.delete).toHaveBeenCalledWith("/favorites/pet-1");
		expect(result.current.isFavorited("pet-1")).toBe(false);
	});

	it("should rollback optimistic update on API error", async () => {
		(useAuthModule.useAuth as any).mockReturnValue({ user: { uid: "user-1" } });
		apiModule.default.get = vi.fn().mockResolvedValue({
			data: { data: [] },
		});
		apiModule.default.post = vi.fn().mockRejectedValue(new Error("Network error"));

		const { result } = renderHook(() => useFavorites(), {
			wrapper: FavoritesProvider,
		});

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.isFavorited("pet-1")).toBe(false);

		await act(async () => {
			await result.current.toggleFavorite("pet-1");
		});

		expect(result.current.isFavorited("pet-1")).toBe(false);
	});

	it("should do nothing on toggleFavorite when user is not authenticated", async () => {
		(useAuthModule.useAuth as any).mockReturnValue({ user: null });
		apiModule.default.get = vi.fn().mockResolvedValue({
			data: { data: [] },
		});

		const { result } = renderHook(() => useFavorites(), {
			wrapper: FavoritesProvider,
		});

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		await act(async () => {
			await result.current.toggleFavorite("pet-1");
		});

		expect(apiModule.default.post).not.toHaveBeenCalled();
		expect(result.current.isFavorited("pet-1")).toBe(false);
	});
});
