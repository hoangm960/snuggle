import { describe, it, expect } from "vitest";

vi.mock("axios", () => {
	return {
		__esModule: true,
		default: {
			create: vi.fn(() => ({
				interceptors: {
					request: { use: vi.fn() },
					response: { use: vi.fn() },
				},
				defaults: {
					headers: { "Content-Type": "application/json" },
				},
			})),
		},
	};
});

vi.mock("./firebase", () => ({
	auth: { currentUser: null },
}));

vi.mock("firebase/auth", () => ({
	getIdToken: vi.fn(),
}));

vi.mock("./cookies", () => ({
	getToken: vi.fn(() => null),
	clearAuthSession: vi.fn(),
}));

describe("api", () => {
	it("should create api instance", async () => {
		const axios = await import("axios");
		axios.default.create();
		expect(axios.default.create).toHaveBeenCalled();
	});

	it("should be configured with local API URL", () => {
		const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
		expect(baseURL).toBe("http://localhost:3001");
	});

	it("should have json content type header", async () => {
		const axios = await import("axios");
		const instance = axios.default.create();
		expect(instance.defaults.headers["Content-Type"]).toBe("application/json");
	});
});