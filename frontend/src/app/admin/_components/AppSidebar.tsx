"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearAuthSession } from "@/lib/cookies";
import api from "@/lib/api";
import {
	LayoutDashboard,
	PawPrint,
	ClipboardList,
	Users,
	Settings,
	LogOut,
	Sparkles,
	ShieldCheck,
	HeartPulse,
	FileSignature,
	MessageCircle,
	Wand2,
	Building,
	X,
} from "lucide-react";

interface SidebarStats {
	pendingRequests: number;
	pendingChats: number;
	petsAdoptedThisWeek: number;
}

interface NavItem {
	href: string;
	label: string;
	icon: React.ElementType;
	exact?: boolean;
	badgeKey?: keyof SidebarStats;
}

const navMain: NavItem[] = [
	{ href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
	{ href: "/admin/pets", label: "Pets", icon: PawPrint },
	{
		href: "/admin/requests",
		label: "Adoption Requests",
		icon: ClipboardList,
		badgeKey: "pendingRequests",
	},
	{ href: "/admin/users", label: "Users", icon: Users },
	{ href: "/admin/ekyc", label: "eKYC Management", icon: ShieldCheck },
	{ href: "/admin/health-records", label: "Health Records", icon: HeartPulse },
	{ href: "/admin/contracts", label: "Contracts", icon: FileSignature },
	{ href: "/admin/chats", label: "Support Chats", icon: MessageCircle, badgeKey: "pendingChats" },
	{ href: "/admin/shelters", label: "Shelters", icon: Building },
	{ href: "/admin/quiz", label: "Pet Quiz", icon: Wand2 },
];

const navSecondary = [{ href: "/admin/settings", label: "Settings", icon: Settings }];

interface AppSidebarProps {
	isOpen: boolean;
	onClose: () => void;
}

export function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
	const pathname = usePathname();
	const router = useRouter();
	const [stats, setStats] = useState<SidebarStats>({
		pendingRequests: 0,
		pendingChats: 0,
		petsAdoptedThisWeek: 0,
	});

	useEffect(() => {
		const fetchStats = async () => {
			try {
				const res = await api.get("/admin/sidebar");
				setStats(res.data.data);
			} catch {
				// silently fail
			}
		};
		fetchStats();
	}, []);

	// Close sidebar on navigation (mobile)
	useEffect(() => {
		onClose();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pathname]);

	function handleLogout() {
		clearAuthSession();
		router.push("/login");
	}

	function isActive(href: string, exact: boolean = false) {
		if (exact) return pathname === href;
		return pathname === href || pathname.startsWith(href + "/");
	}

	return (
		<aside
			className={`fixed inset-y-0 left-0 z-40 w-64 flex flex-col border-r transition-transform duration-200 lg:relative lg:translate-x-0 lg:z-auto ${
				isOpen ? "translate-x-0" : "-translate-x-full"
			}`}
			style={{ background: "#fff", borderColor: "#F0F0F0" }}
		>
			{/* Brand */}
			<div className="px-6 pt-7 pb-5 flex items-start justify-between">
				<div className="flex items-center gap-2.5">
					<div
						className="size-10 rounded-2xl flex items-center justify-center"
						style={{ background: "linear-gradient(135deg, #7AADA1, #216959)" }}
					>
						<PawPrint className="size-5 text-white" strokeWidth={2.5} />
					</div>
					<div>
						<h2
							className="font-semibold leading-none"
							style={{
								fontFamily: "'Space Grotesk', sans-serif",
								fontSize: "18px",
								color: "#1C1C1C",
							}}
						>
							Snuggle
						</h2>
						<p
							style={{
								fontSize: "10px",
								color: "#999",
								marginTop: "2px",
								letterSpacing: "0.05em",
							}}
						>
							Admin Console
						</p>
					</div>
				</div>
				<button
					onClick={onClose}
					className="lg:hidden size-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
					aria-label="Close menu"
				>
					<X className="size-4" style={{ color: "#888" }} />
				</button>
			</div>

			{/* Main nav */}
			<nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
				<p
					style={{
						fontSize: "10px",
						fontWeight: 600,
						letterSpacing: "0.12em",
						color: "#aaa",
						textTransform: "uppercase",
						padding: "0 12px",
						marginBottom: "6px",
					}}
				>
					Workspace
				</p>
				{navMain.map((item) => {
					const active = isActive(item.href, item.exact);
					return (
						<Link
							key={item.href}
							href={item.href}
							className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
							style={{
								color: active ? "#216959" : "#666",
								background: active ? "#E8F4F1" : "transparent",
								fontWeight: active ? 600 : 400,
								fontFamily: "'Space Grotesk', sans-serif",
							}}
						>
							<item.icon className="size-[18px] shrink-0" />
							<span className="flex-1">{item.label}</span>
							{item.badgeKey && stats[item.badgeKey] > 0 && (
								<span
									className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
									style={{ background: "#7AADA1" }}
								>
									{stats[item.badgeKey]}
								</span>
							)}
						</Link>
					);
				})}

				<p
					style={{
						fontSize: "10px",
						fontWeight: 600,
						letterSpacing: "0.12em",
						color: "#aaa",
						textTransform: "uppercase",
						padding: "16px 12px 6px",
					}}
				>
					Account
				</p>
				{navSecondary.map((item) => {
					const active = isActive(item.href);
					return (
						<Link
							key={item.href}
							href={item.href}
							className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
							style={{
								color: active ? "#216959" : "#666",
								background: active ? "#E8F4F1" : "transparent",
								fontFamily: "'Space Grotesk', sans-serif",
							}}
						>
							<item.icon className="size-[18px] shrink-0" />
							<span>{item.label}</span>
						</Link>
					);
				})}
			</nav>

			{/* Footer */}
			<div className="p-3">
				{stats.petsAdoptedThisWeek > 0 && (
					<div
						className="rounded-2xl p-4 relative overflow-hidden mb-2"
						style={{
							background: "linear-gradient(135deg, #7AADA1, #216959)",
							color: "#fff",
						}}
					>
						<Sparkles className="absolute -top-1 -right-1 size-12 opacity-20" />
						<p
							style={{
								fontSize: "10px",
								letterSpacing: "0.1em",
								opacity: 0.75,
								textTransform: "uppercase",
							}}
						>
							This week
						</p>
						<p
							className="font-semibold"
							style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "22px" }}
						>
							{stats.petsAdoptedThisWeek} pets
						</p>
						<p style={{ fontSize: "11px", opacity: 0.85 }}>found loving homes 🐾</p>
					</div>
				)}
				<button
					onClick={handleLogout}
					className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors hover:bg-red-50"
					style={{
						color: "#888",
						fontFamily: "'Space Grotesk', sans-serif",
						background: "none",
						border: "none",
						cursor: "pointer",
					}}
				>
					<LogOut className="size-[18px]" />
					Sign out
				</button>
			</div>
		</aside>
	);
}
