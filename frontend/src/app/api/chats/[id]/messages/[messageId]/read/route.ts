import { proxyRequest } from "@/lib/proxy";

export async function PUT(request: Request) {
	return proxyRequest(request);
}
