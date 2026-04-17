import { describe, it, expect, beforeEach, vi } from "vitest";
import {
	setCookie,
	getCookie,
	deleteCookie,
	setAuthSession,
	clearAuthSession,
	getToken,
	getStoredUser,
	isAuthenticated,
} from "./cookies";

describe("cookies", () => {
	beforeEach(() => {
		vi.stubGlobal("document", {
			cookie: "",
		});
	});

	describe("setCookie", () => {
		it("should set a cookie with value", () => {
			setCookie("test", "value");
			expect(document.cookie).toContain("test=value");
		});

		it("should set a cookie with expiration", () => {
			setCookie("test", "value", 7);
			expect(document.cookie).toContain("expires=");
		});
	});

	describe("getCookie", () => {
		it("should return null when cookie does not exist", () => {
			vi.stubGlobal("document", { cookie: "other=value" });
			expect(getCookie("test")).toBeNull();
		});

		it("should return cookie value when it exists", () => {
			vi.stubGlobal("document", { cookie: "test=value; other=thing" });
			expect(getCookie("test")).toBe("value");
		});
	});

	describe("deleteCookie", () => {
		it("should set cookie with expired date", () => {
			deleteCookie("test");
			expect(document.cookie).toContain("expires=Thu, 01 Jan 1970");
		});
	});

	describe("setAuthSession", () => {
		it("should set token and user cookies", () => {
			const user = {
				email: "test@example.com",
				displayName: "Test User",
				role: "adopter" as const,
				createdAt: new Date(),
				updatedAt: new Date(),
			};
			setAuthSession("token123", user);
			expect(document.cookie).toContain("auth_user=");
		});
	});

	describe("clearAuthSession", () => {
		it("should delete both token and user cookies", () => {
			clearAuthSession();
			expect(document.cookie).toMatch(/auth_(token|user)=/);
		});
	});

	describe("getToken", () => {
		it("should return null when no token", () => {
			vi.stubGlobal("document", { cookie: "other=value" });
			expect(getToken()).toBeNull();
		});

		it("should return token when exists", () => {
			vi.stubGlobal("document", { cookie: "auth_token=mytoken" });
			expect(getToken()).toBe("mytoken");
		});
	});

	describe("getStoredUser", () => {
		it("should return null when no user", () => {
			vi.stubGlobal("document", { cookie: "auth_token=token" });
			expect(getStoredUser()).toBeNull();
		});

		it("should parse and return user when exists", () => {
			const userObj = {
				email: "test@example.com",
				displayName: "Test",
				role: "adopter" as const,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			vi.stubGlobal("document", {
				cookie: `auth_user=${JSON.stringify(userObj)}`,
			});
			const user = getStoredUser();
			expect(user?.email).toBe("test@example.com");
		});
	});

	describe("isAuthenticated", () => {
		it("should return false when no token", () => {
			vi.stubGlobal("document", { cookie: "" });
			expect(isAuthenticated()).toBe(false);
		});

		it("should return true when token and user exist", () => {
			const userObj = {
				email: "test@example.com",
				displayName: "Test",
				role: "adopter" as const,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			vi.stubGlobal("document", {
				cookie: `auth_token=token; auth_user=${JSON.stringify(userObj)}`,
			});
			expect(isAuthenticated()).toBe(true);
		});
	});
});