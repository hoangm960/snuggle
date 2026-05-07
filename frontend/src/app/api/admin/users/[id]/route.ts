import { proxyRequest } from "@/lib/proxy";

export async function GET(request: Request) {
	return proxyRequest(request);
}

export async function PUT(request: Request) {
	return proxyRequest(request);
}

export async function DELETE(request: Request) {
	return proxyRequest(request);
}
