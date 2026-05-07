"use client";

import { ReactNode, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function AdminRootLayout({ children }: { children: ReactNode }) {
	const { user, loading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!loading) {
			if (!user) {
				router.push("/login?redirect=/admin");
			} else if (user.role !== "admin") {
				router.push("/home");
			}
		}
	}, [user, loading, router]);

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
