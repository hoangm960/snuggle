"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearAuthSession } from "@/lib/cookies";
import {
	LayoutDashboard, PawPrint, ClipboardList, Users, HeartHandshake,
	Settings, LogOut, Sparkles, ShieldCheck, HeartPulse, FileSignature, Star,
} from "lucide-react";

const navMain = [
	{ href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
	{ href: "/admin/pets", label: "Pets", icon: PawPrint },
	{ href: "/admin/requests", label: "Adoption Requests", icon: ClipboardList, badge: 12 },
	{ href: "/admin/users", label: "Users", icon: Users },
	{ href: "/admin/ekyc", label: "eKYC Management", icon: ShieldCheck },
	{ href: "/admin/health-records", label: "Health Records", icon: HeartPulse },
	{ href: "/admin/contracts", label: "Contracts", icon: FileSignature },
	{ href: "/admin/reviews", label: "Reviews", icon: Star },
	{ href: "/admin/donations", label: "Donations", icon: HeartHandshake },
];

const navSecondary = [{ href: "/admin/settings", label: "Settings", icon: Settings }];

function cn(...classes: (string | undefined | false)[]) {
	return classes.filter(Boolean).join(" ");
}

export function AppSidebar() {
	const pathname = usePathname();
	const router = useRouter();

	function handleLogout() {
		clearAuthSession();
		router.push("/login");
	}

	function isActive(href: string, exact = false) {
		if (exact) return pathname === href;
		return pathname === href || pathname.startsWith(href + "/");
	}

	return (
		<aside className="hidden lg:flex w-64 shrink-0 flex-col border-r" style={{ background: "#fff", borderColor: "#F0F0F0" }}>
			{/* Brand */}
			<div className="px-6 pt-7 pb-8">
				<div className="flex items-center gap-2.5">
					<div className="size-10 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #7AADA1, #216959)" }}>
						<PawPrint className="size-5 text-white" strokeWidth={2.5} />
					</div>
					<div>
						<h2 className="font-semibold leading-none" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "18px", color: "#1C1C1C" }}>Snuggle</h2>
						<p style={{ fontSize: "10px", color: "#999", marginTop: "2px", letterSpacing: "0.05em" }}>Admin Console</p>
					</div>
				</div>
			</div>

			{/* Main nav */}
			<nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
				<p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em", color: "#aaa", textTransform: "uppercase", padding: "0 12px", marginBottom: "6px" }}>Workspace</p>
				{navMain.map((item) => {
					const active = isActive(item.href, item.exact);
					return (
						<Link key={item.href} href={item.href}
							className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
							style={{ color: active ? "#216959" : "#666", background: active ? "#E8F4F1" : "transparent", fontWeight: active ? 600 : 400, fontFamily: "'Space Grotesk', sans-serif" }}>
							<item.icon className="size-[18px] shrink-0" />
							<span className="flex-1">{item.label}</span>
							{item.badge && (
								<span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white" style={{ background: "#7AADA1" }}>{item.badge}</span>
							)}
						</Link>
					);
				})}

				<p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em", color: "#aaa", textTransform: "uppercase", padding: "16px 12px 6px" }}>Account</p>
				{navSecondary.map((item) => {
					const active = isActive(item.href);
					return (
						<Link key={item.href} href={item.href}
							className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
							style={{ color: active ? "#216959" : "#666", background: active ? "#E8F4F1" : "transparent", fontFamily: "'Space Grotesk', sans-serif" }}>
							<item.icon className="size-[18px] shrink-0" />
							<span>{item.label}</span>
						</Link>
					);
				})}
			</nav>

			{/* Footer */}
			<div className="p-3">
				<div className="rounded-2xl p-4 relative overflow-hidden mb-2" style={{ background: "linear-gradient(135deg, #7AADA1, #216959)", color: "#fff" }}>
					<Sparkles className="absolute -top-1 -right-1 size-12 opacity-20" />
					<p style={{ fontSize: "10px", letterSpacing: "0.1em", opacity: 0.75, textTransform: "uppercase" }}>This week</p>
					<p className="font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "22px" }}>28 pets</p>
					<p style={{ fontSize: "11px", opacity: 0.85 }}>found loving homes 🐾</p>
				</div>
				<button onClick={handleLogout}
					className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors hover:bg-red-50"
					style={{ color: "#888", fontFamily: "'Space Grotesk', sans-serif", background: "none", border: "none", cursor: "pointer" }}>
					<LogOut className="size-[18px]" />
					Sign out
				</button>
			</div>
		</aside>
	);
}
