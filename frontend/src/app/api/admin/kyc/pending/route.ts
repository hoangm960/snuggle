import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function GET(request: Request) {
	const authHeader = request.headers.get("Authorization");
	const token = authHeader?.replace("Bearer ", "") || null;
	const url = new URL(request.url);
	const query = url.search;

	const response = await fetch(`${BACKEND_URL}/api/kyc/pending${query}`, {
		method: "GET",
		headers: {
			Authorization: token ? `Bearer ${token}` : "",
			"Content-Type": "application/json",
		},
	});

	const data = await response.json();
	return NextResponse.json(data, { status: response.status });
}
