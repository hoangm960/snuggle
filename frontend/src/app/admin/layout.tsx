"use client";

import { ReactNode, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function AdminRootLayout({ children }: { children: ReactNode }) {
	const { user, loading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!loading && !user) {
			router.push("/login?redirect=/admin");
		}
	}, [user, loading, router]);

	if (loading || !user) {
		return null;
	}

	return (
		<div
			data-admin
			className="min-h-screen"
			style={{ fontFamily: "'Public Sans', system-ui, sans-serif" }}
		>
			{children}
		</div>
	);
}
