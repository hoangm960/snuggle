"use client";

import { AppSidebar } from "./AppSidebar";
import { NotificationBell } from "./NotificationBell";

interface AdminLayoutProps {
	children: React.ReactNode;
	title?: string;
	subtitle?: string;
}

export function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
    return (
        <div
            className="flex h-screen overflow-hidden"
            style={{ background: "#F9F6F2", fontFamily: "'Poppins', sans-serif" }}
        >
            <AppSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Topbar */}
                <div
                    className="h-14 shrink-0 flex items-center justify-end px-6 border-b"
                    style={{ background: "#fff", borderColor: "#F0F0F0" }}
                >
                    <NotificationBell />
                </div>
                <header className="p-6 border-b" style={{ borderColor: "#F0F0F0" }}>
                    <h1 className="text-2xl font-bold">{title}</h1>
                    {subtitle && <p className="text-gray-600">{subtitle}</p>}
                </header>
                <main className="flex-1 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
}
