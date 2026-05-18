"use client";

import { useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { NotificationBell } from "./NotificationBell";
import { Menu } from "lucide-react";

interface AdminLayoutProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
}

export function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div
            className="flex h-screen overflow-hidden"
            style={{ background: "#F9F6F2", fontFamily: "'Poppins', sans-serif" }}
        >
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
            <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                {/* Topbar */}
                <div
                    className="h-14 shrink-0 flex items-center gap-3 px-4 border-b"
                    style={{ background: "#fff", borderColor: "#F0F0F0" }}
                >
                    <button
                        className="lg:hidden size-9 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors shrink-0"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Open menu"
                    >
                        <Menu className="size-5" style={{ color: "#666" }} />
                    </button>
                    {title && (
                        <p
                            className="lg:hidden flex-1 font-semibold text-sm truncate"
                            style={{ color: "#1C1C1C" }}
                        >
                            {title}
                        </p>
                    )}
                    <div className="ml-auto">
                        <NotificationBell />
                    </div>
                </div>
                {(title || subtitle) && (
                    <header
                        className="hidden lg:block px-6 py-4 border-b"
                        style={{ borderColor: "#F0F0F0" }}
                    >
                        {title && <h1 className="text-2xl font-bold">{title}</h1>}
                        {subtitle && <p className="text-gray-600">{subtitle}</p>}
                    </header>
                )}
                <main className="flex-1 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
}
