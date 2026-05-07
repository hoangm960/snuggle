import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const authHeader = request.headers.get("Authorization");
	const token = authHeader?.replace("Bearer ", "") || null;
	const { id } = await params;
	const body = await request.json();

	const response = await fetch(`${BACKEND_URL}/api/kyc/${id}/reject`, {
		method: "POST",
		headers: {
			Authorization: token ? `Bearer ${token}` : "",
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
	});

	const data = await response.json();
	return NextResponse.json(data, { status: response.status });
}
