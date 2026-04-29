import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useUsers } from "./useUsers";

vi.mock("@/lib/api", () => ({
	__esModule: true,
	default: {
		get: vi.fn(),
		put: vi.fn(),
		post: vi.fn(),
		delete: vi.fn(),
	},
}));

const mockUsers = [
	{
		id: "1",
		email: "user1@example.com",
		displayName: "User One",
		photoURL: null,
		role: "visitor" as const,
		accountStatus: "active" as const,
		createdAt: new Date().toISOString(),
	},
	{
		id: "2",
		email: "admin@example.com",
		displayName: "Admin User",
		photoURL: null,
		role: "admin" as const,
		accountStatus: "active" as const,
		createdAt: new Date().toISOString(),
	},
];

describe("useUsers", () => {
	let apiModule: typeof import("@/lib/api");

	beforeEach(async () => {
		vi.resetModules();
		apiModule = await import("@/lib/api");
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("should initialize with empty users", () => {
		const { result } = renderHook(() => useUsers());

		expect(result.current.users).toEqual([]);
		expect(result.current.total).toBe(0);
		expect(result.current.loading).toBe(false);
	});

	it("should initialize with empty users and loading false", async () => {
		(apiModule.default.get as any).mockResolvedValue({ data: { data: { users: [], total: 0 } } });

		const { result } = renderHook(() => useUsers());

		await act(async () => {
			await result.current.fetchUsers();
		});

		expect(result.current.loading).toBe(false);
		expect(result.current.users).toEqual([]);
		expect(result.current.total).toBe(0);
	});

	it("should fetch users when fetchUsers is called", async () => {
		(apiModule.default.get as any).mockResolvedValue({
			data: { data: { users: mockUsers, total: 2 } },
		});

		const { result } = renderHook(() => useUsers());

		await act(async () => {
			await result.current.fetchUsers();
		});

		expect(result.current.users).toHaveLength(2);
		expect(result.current.total).toBe(2);
	});

	it("should fetch users with search params", async () => {
		(apiModule.default.get as any).mockResolvedValue({
			data: { data: { users: [mockUsers[0]], total: 1 } },
		});

		const { result } = renderHook(() => useUsers());

		await act(async () => {
			await result.current.fetchUsers({ search: "user1", role: "visitor", status: "active", page: 1, limit: 10 });
		});

		expect(apiModule.default.get).toHaveBeenCalledWith(expect.stringContaining("search=user1"));
	});

	it("should set error on fetch failure", async () => {
		(apiModule.default.get as any).mockRejectedValue(new Error("Network error"));

		const { result } = renderHook(() => useUsers());

		await act(async () => {
			await result.current.fetchUsers();
		});

		expect(result.current.error).toBe("Network error");
	});

	it("should update user role successfully", async () => {
		(apiModule.default.get as any).mockResolvedValue({
			data: { data: { users: mockUsers, total: 2 } },
		});
		(apiModule.default.put as any).mockResolvedValue({});

		const { result } = renderHook(() => useUsers());

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		let success: boolean;
		await act(async () => {
			success = await result.current.updateUserRole("1", "admin");
		});

		expect(success!).toBe(true);
		expect(apiModule.default.put).toHaveBeenCalledWith("/admin/users/1", { role: "admin" });
	});

	it("should return false on role update failure", async () => {
		(apiModule.default.get as any).mockResolvedValue({
			data: { data: { users: mockUsers, total: 2 } },
		});
		(apiModule.default.put as any).mockRejectedValue(new Error("Update failed"));

		const { result } = renderHook(() => useUsers());

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		let success: boolean;
		await act(async () => {
			success = await result.current.updateUserRole("1", "admin");
		});

		expect(success!).toBe(false);
	});

	it("should update user status successfully", async () => {
		(apiModule.default.get as any).mockResolvedValue({
			data: { data: { users: mockUsers, total: 2 } },
		});
		(apiModule.default.put as any).mockResolvedValue({});

		const { result } = renderHook(() => useUsers());

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		let success: boolean;
		await act(async () => {
			success = await result.current.updateUserStatus("1", "suspended");
		});

		expect(success!).toBe(true);
		expect(apiModule.default.put).toHaveBeenCalledWith("/admin/users/1", { accountStatus: "suspended" });
	});

	it("should invite user successfully", async () => {
		(apiModule.default.post as any).mockResolvedValue({
			data: { success: true, message: "Invitation sent" },
		});

		const { result } = renderHook(() => useUsers());

		let response: { success: boolean; message: string };
		await act(async () => {
			response = await result.current.inviteUser("new@example.com", "admin");
		});

		expect(response!.success).toBe(true);
		expect(apiModule.default.post).toHaveBeenCalledWith("/admin/invite", {
			email: "new@example.com",
			role: "admin",
		});
	});

	it("should handle invite error", async () => {
		(apiModule.default.post as any).mockRejectedValue(new Error("Invite failed"));

		const { result } = renderHook(() => useUsers());

		let response: { success: boolean; message: string };
		await act(async () => {
			response = await result.current.inviteUser("new@example.com", "admin");
		});

		expect(response!.success).toBe(false);
		expect(response!.message).toBe("Invite failed");
	});

	it("should delete user successfully", async () => {
		(apiModule.default.get as any).mockResolvedValue({
			data: { data: { users: mockUsers, total: 2 } },
		});
		(apiModule.default.delete as any).mockResolvedValue({
			data: { success: true, message: "User deleted" },
		});

		const { result } = renderHook(() => useUsers());

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		let response: { success: boolean; message: string };
		await act(async () => {
			response = await result.current.deleteUser("1");
		});

		expect(response!.success).toBe(true);
		expect(apiModule.default.delete).toHaveBeenCalledWith("/admin/users/1");
	});
});
