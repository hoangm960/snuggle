"use client";

import { AppSidebar } from "./AppSidebar";

export function AdminLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex h-screen overflow-hidden" style={{ background: "#F9F6F2", fontFamily: "'Poppins', sans-serif" }}>
			<AppSidebar />
			<main className="flex-1 overflow-y-auto">
				{children}
			</main>
		</div>
	);
}
