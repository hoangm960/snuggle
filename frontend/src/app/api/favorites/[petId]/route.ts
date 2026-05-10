import { proxyRequest } from "@/lib/proxy";

export async function POST(request: Request) {
	return proxyRequest(request);
}

export async function DELETE(request: Request) {
	return proxyRequest(request);
}
