import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("proxyRequest", () => {
	beforeEach(() => {
		vi.stubGlobal("fetch", vi.fn());
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("should rewrite /api path to backend URL", async () => {
		const { proxyRequest } = await import("./proxy");

		(global.fetch as any).mockResolvedValue(
			new Response(JSON.stringify({ data: "ok" }), {
				status: 200,
				headers: { "content-type": "application/json" },
			})
		);

		const request = new Request("http://localhost:3000/api/pets");
		await proxyRequest(request);

		const fetchCall = (global.fetch as any).mock.calls[0];
		expect(fetchCall[0]).toBe("http://localhost:3001/api/pets");
	});

	it("should preserve query parameters", async () => {
		const { proxyRequest } = await import("./proxy");

		(global.fetch as any).mockResolvedValue(new Response("{}", { status: 200, headers: {} }));

		const request = new Request("http://localhost:3000/api/pets?species=dog&page=1");
		await proxyRequest(request);

		const fetchCall = (global.fetch as any).mock.calls[0];
		expect(fetchCall[0]).toBe("http://localhost:3001/api/pets?species=dog&page=1");
	});

	it("should forward method and body for POST requests", async () => {
		const { proxyRequest } = await import("./proxy");

		const mockResponse = new Response("{}", { status: 201, headers: {} });
		(global.fetch as any).mockResolvedValue(mockResponse);

		const request = new Request("http://localhost:3000/api/pets", {
			method: "POST",
			body: JSON.stringify({ name: "Buddy" }),
			headers: { "content-type": "application/json" },
		});
		await proxyRequest(request);

		const fetchCall = (global.fetch as any).mock.calls[0];
		expect(fetchCall[1].method).toBe("POST");
		expect(fetchCall[1].body).toBeTruthy();
	});

	it("should not forward body for GET requests", async () => {
		const { proxyRequest } = await import("./proxy");

		const mockResponse = new Response("{}", { status: 200, headers: {} });
		(global.fetch as any).mockResolvedValue(mockResponse);

		const request = new Request("http://localhost:3000/api/pets", { method: "GET" });
		await proxyRequest(request);

		const fetchCall = (global.fetch as any).mock.calls[0];
		expect(fetchCall[1].method).toBe("GET");
		expect(fetchCall[1].body).toBeUndefined();
	});

	it("should return response with same status code", async () => {
		const { proxyRequest } = await import("./proxy");

		(global.fetch as any).mockResolvedValue(
			new Response("Not found", { status: 404, headers: {} })
		);

		const request = new Request("http://localhost:3000/api/pets/123");
		const response = await proxyRequest(request);

		expect(response.status).toBe(404);
	});

	it("should strip host header from forwarded request", async () => {
		const { proxyRequest } = await import("./proxy");

		(global.fetch as any).mockResolvedValue(new Response("{}", { status: 200, headers: {} }));

		const request = new Request("http://localhost:3000/api/pets", {
			headers: { host: "localhost:3000", "x-custom": "value" },
		});
		await proxyRequest(request);

		const fetchCall = (global.fetch as any).mock.calls[0];
		const headers = fetchCall[1].headers;
		expect(headers.get("host")).toBeNull();
		expect(headers.get("x-custom")).toBe("value");
	});
});
