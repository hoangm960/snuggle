import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "./useAuth";

vi.mock("@/lib/firebase", () => ({
	auth: {
		currentUser: null,
		onAuthStateChanged: vi.fn((auth, callback) => {
			callback(null);
			return vi.fn();
		}),
	},
}));

vi.mock("firebase/auth", () => ({
	onAuthStateChanged: vi.fn((auth, callback) => {
		callback(null);
		return vi.fn();
	}),
	GoogleAuthProvider: vi.fn(),
	FacebookAuthProvider: vi.fn(),
	signInWithPopup: vi.fn(),
	signOut: vi.fn(),
}));

vi.mock("@/lib/cookies", () => ({
	getStoredUser: vi.fn(() => null),
	clearAuthSession: vi.fn(),
	isAuthenticated: vi.fn(() => false),
	getToken: vi.fn(() => null),
}));

describe("useAuth", () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	it("should eventually set loading to false", async () => {
		const { result } = renderHook(() => useAuth(), {
			wrapper: AuthProvider,
		});

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});
	});

	it("should provide null user when not authenticated", async () => {
		const { result } = renderHook(() => useAuth(), {
			wrapper: AuthProvider,
		});

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.user).toBeNull();
	});

	it("should provide loginWithGoogle function", async () => {
		const { result } = renderHook(() => useAuth(), {
			wrapper: AuthProvider,
		});

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(typeof result.current.loginWithGoogle).toBe("function");
	});

	it("should provide loginWithFacebook function", async () => {
		const { result } = renderHook(() => useAuth(), {
			wrapper: AuthProvider,
		});

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(typeof result.current.loginWithFacebook).toBe("function");
	});

	it("should provide logout function", async () => {
		const { result } = renderHook(() => useAuth(), {
			wrapper: AuthProvider,
		});

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(typeof result.current.logout).toBe("function");
	});
});

describe("AuthProvider", () => {
	it("should render children", async () => {
		const { getByText } = renderHook(() => <div>Child Content</div>, {
			wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
		});
	});
});
