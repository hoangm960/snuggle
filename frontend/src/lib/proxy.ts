const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

export async function proxyRequest(request: Request): Promise<Response> {
	const url = new URL(request.url);
	const backendUrl = `${BACKEND_URL}/api${url.pathname.replace(/^\/api/, "")}${url.search}`;

	const headers = new Headers(request.headers);
	headers.delete("host");

	const body =
		request.method !== "GET" && request.method !== "HEAD"
			? await request.arrayBuffer()
			: undefined;

	const backendResponse = await fetch(backendUrl, {
		method: request.method,
		headers,
		body,
	});

	const responseBody = await backendResponse.arrayBuffer();
	const responseHeaders = new Headers(backendResponse.headers);
	responseHeaders.delete("transfer-encoding");
	responseHeaders.delete("connection");

	return new Response(responseBody, {
		status: backendResponse.status,
		statusText: backendResponse.statusText,
		headers: responseHeaders,
	});
}
