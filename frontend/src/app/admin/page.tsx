"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "./_components/AdminLayout";
import api from "@/lib/api";
import Image from "next/image";
import {
	PawPrint,
	ClipboardList,
	Users,
	TrendingUp,
	ArrowUpRight,
	Clock,
	CheckCircle2,
	XCircle,
	ShieldCheck,
	Loader2,
} from "lucide-react";

interface DashboardStats {
	totalPets: number;
	pendingRequests: number;
	pendingKyc: number;
	activeUsers: number;
	adoptionRate: number;
	petsAddedThisWeek: number;
	requestsAddedToday: number;
	usersAddedThisMonth: number;
}

interface RecentRequest {
	id: string;
	petName: string;
	petThumbnail?: string;
	adopterName: string;
	adopterPhoto?: string;
	appliedAt: string;
	status: "pending" | "approved" | "rejected" | "completed";
}

const statusConfig: Record<
	string,
	{ label: string; color: string; bg: string; icon: React.ElementType }
> = {
	pending: { label: "Pending", color: "#C4857A", bg: "#FAF0EE", icon: Clock },
	approved: { label: "Approved", color: "#216959", bg: "#E8F4F1", icon: CheckCircle2 },
	rejected: { label: "Rejected", color: "#999", bg: "#F4F4F4", icon: XCircle },
	completed: { label: "Completed", color: "#216959", bg: "#E8F4F1", icon: CheckCircle2 },
};

function formatDate(dateStr: string): string {
	try {
		const date = new Date(dateStr);
		return date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	} catch {
		return dateStr;
	}
}

function formatCount(value: number): string {
	if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
	if (value >= 100) return value.toString();
	return value.toLocaleString();
}

export default function AdminDashboard() {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [stats, setStats] = useState<DashboardStats | null>(null);
	const [recentRequests, setRecentRequests] = useState<RecentRequest[]>([]);

	useEffect(() => {
		const fetchDashboard = async () => {
			setLoading(true);
			setError(null);
			try {
				const res = await api.get("/admin/dashboard");
				const data = res.data.data;
				setStats(data.stats);
				setRecentRequests(data.recentRequests || []);
			} catch (err) {
				console.error("Failed to load dashboard:", err);
				setError("Failed to load dashboard data");
			} finally {
				setLoading(false);
			}
		};

		fetchDashboard();
	}, []);

	if (loading) {
		return (
			<AdminLayout>
				<div className="p-8 flex items-center justify-center h-64">
					<Loader2 className="size-8 animate-spin text-primary" />
				</div>
			</AdminLayout>
		);
	}

	if (error || !stats) {
		return (
			<AdminLayout>
				<div className="p-8 flex items-center justify-center h-64">
					<p className="text-destructive">{error || "Failed to load dashboard"}</p>
				</div>
			</AdminLayout>
		);
	}

	const statCards = [
		{
			label: "Total Pets",
			value: formatCount(stats.totalPets),
			change:
				stats.petsAddedThisWeek > 0
					? `+${stats.petsAddedThisWeek} this week`
					: "No new pets this week",
			icon: PawPrint,
			color: "#7AADA1",
			bg: "#E8F4F1",
			href: "/admin/pets",
		},
		{
			label: "Pending Requests",
			value: formatCount(stats.pendingRequests),
			change:
				stats.requestsAddedToday > 0
					? `+${stats.requestsAddedToday} today`
					: "No new requests today",
			icon: ClipboardList,
			color: "#C4857A",
			bg: "#FAF0EE",
			href: "/admin/requests",
		},
		{
			label: "Active Users",
			value: formatCount(stats.activeUsers),
			change:
				stats.usersAddedThisMonth > 0
					? `+${stats.usersAddedThisMonth} this month`
					: "No new users this month",
			icon: Users,
			color: "#216959",
			bg: "#E8F4F1",
			href: "/admin/users",
		},
	];

	const quickActions = [
		{
			label: "Review eKYC Submissions",
			href: "/admin/ekyc",
			icon: ShieldCheck,
			count: stats.pendingKyc,
		},
		{
			label: "Pending Requests",
			href: "/admin/requests",
			icon: ClipboardList,
			count: stats.pendingRequests,
		},
		{
			label: "Total Pets",
			href: "/admin/pets",
			icon: PawPrint,
			count: stats.totalPets,
		},
	];

	return (
		<AdminLayout>
			<div className="p-4 sm:p-6 lg:p-8 min-h-full flex flex-col">
				<div className="mb-6 lg:mb-8">
					<h1
						style={{
							fontFamily: "'Space Grotesk', sans-serif",
							fontSize: "28px",
							fontWeight: 700,
							color: "#1C1C1C",
						}}
					>
						Dashboard
					</h1>
					<p style={{ color: "#888", fontSize: "14px", marginTop: "4px" }}>
						Welcome back! Here{"'"}s what{"'"}s happening at Snuggle.
					</p>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6 lg:mb-8">
					{statCards.map((s) => (
						<a
							key={s.label}
							href={s.href}
							className="rounded-2xl p-5 block cursor-pointer transition-shadow hover:shadow-md"
							style={{ background: "#fff", border: "1px solid #F0F0F0" }}
						>
							<div className="flex items-start justify-between mb-4">
								<div
									className="size-10 rounded-xl flex items-center justify-center"
									style={{ background: s.bg }}
								>
									<s.icon className="size-5" style={{ color: s.color }} />
								</div>
								<ArrowUpRight className="size-4" style={{ color: "#ccc" }} />
							</div>
							<p
								style={{
									fontSize: "26px",
									fontWeight: 700,
									fontFamily: "'Space Grotesk', sans-serif",
									color: "#1C1C1C",
								}}
							>
								{s.value}
							</p>
							<p style={{ fontSize: "13px", color: "#888", marginTop: "2px" }}>
								{s.label}
							</p>
							<p
								style={{
									fontSize: "11px",
									color: s.color,
									marginTop: "6px",
									fontWeight: 500,
								}}
							>
								{s.change}
							</p>
						</a>
					))}
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1">
					<div
						className="lg:col-span-2 rounded-2xl p-6"
						style={{ background: "#fff", border: "1px solid #F0F0F0" }}
					>
						<div className="flex items-center justify-between mb-5">
							<h2
								style={{
									fontFamily: "'Space Grotesk', sans-serif",
									fontSize: "16px",
									fontWeight: 600,
									color: "#1C1C1C",
								}}
							>
								Recent Adoption Requests
							</h2>
							<a
								href="/admin/requests"
								style={{ fontSize: "12px", color: "#7AADA1", fontWeight: 500 }}
							>
								View all
							</a>
						</div>
						{recentRequests.length === 0 ? (
							<p
								style={{
									color: "#aaa",
									fontSize: "13px",
									textAlign: "center",
									padding: "20px 0",
								}}
							>
								No recent requests
							</p>
						) : (
							<div className="overflow-x-auto -mx-2">
						<table className="w-full min-w-[480px]">
								<thead>
									<tr>
										{["ID", "Pet", "Adopter", "Date", "Status"].map((h) => (
											<th
												key={h}
												className="text-left pb-3"
												style={{
													fontSize: "11px",
													fontWeight: 600,
													color: "#aaa",
													textTransform: "uppercase",
													letterSpacing: "0.08em",
												}}
											>
												{h}
											</th>
										))}
									</tr>
								</thead>
								<tbody>
									{recentRequests.map((r) => {
										const s = statusConfig[r.status] || statusConfig.pending;
										return (
											<tr
												key={r.id}
												style={{ borderTop: "1px solid #F8F8F8" }}
											>
												<td
													className="py-3"
													style={{ fontSize: "12px", color: "#aaa" }}
												>
													{r.id.slice(0, 8)}
												</td>
												<td className="py-3">
													<div className="flex items-center gap-2">
														{r.petThumbnail ? (
															<Image
																src={r.petThumbnail}
																alt={r.petName}
																width={32}
																height={32}
																className="size-8 rounded-lg object-cover"
															/>
														) : null}
														<span
															style={{
																fontSize: "13px",
																fontWeight: 500,
																color: "#1C1C1C",
															}}
														>
															{r.petName}
														</span>
													</div>
												</td>
												<td
													className="py-3"
													style={{ fontSize: "13px", color: "#666" }}
												>
													{r.adopterName}
												</td>
												<td
													className="py-3"
													style={{ fontSize: "12px", color: "#aaa" }}
												>
													{formatDate(r.appliedAt)}
												</td>
												<td className="py-3">
													<span
														className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full"
														style={{
															background: s.bg,
															color: s.color,
															fontSize: "11px",
															fontWeight: 600,
														}}
													>
														<s.icon className="size-3" />
														{s.label}
													</span>
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
						)}
					</div>

					<div
						className="rounded-2xl p-6"
						style={{ background: "#fff", border: "1px solid #F0F0F0" }}
					>
						<h2
							style={{
								fontFamily: "'Space Grotesk', sans-serif",
								fontSize: "16px",
								fontWeight: 600,
								color: "#1C1C1C",
								marginBottom: "20px",
							}}
						>
							Quick Actions
						</h2>
						<div className="space-y-3">
							{quickActions.map((item) => (
								<a
									key={item.href}
									href={item.href}
									className="flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-gray-50"
									style={{ border: "1px solid #F0F0F0" }}
								>
									<div
										className="size-9 rounded-lg flex items-center justify-center"
										style={{ background: "#E8F4F1" }}
									>
										<item.icon
											className="size-4"
											style={{ color: "#7AADA1" }}
										/>
									</div>
									<span
										className="flex-1"
										style={{ fontSize: "13px", color: "#444" }}
									>
										{item.label}
									</span>
									<span
										className="text-xs font-semibold px-2 py-0.5 rounded-full text-white"
										style={{ background: "#C4857A" }}
									>
										{item.count}
									</span>
								</a>
							))}
						</div>

						{stats.adoptionRate > 0 && (
							<div
								className="mt-6 rounded-xl p-4"
								style={{ background: "linear-gradient(135deg, #E8F4F1, #D0EBE5)" }}
							>
								<div className="flex items-center gap-2 mb-1">
									<TrendingUp className="size-4" style={{ color: "#216959" }} />
									<span
										style={{
											fontSize: "12px",
											fontWeight: 600,
											color: "#216959",
										}}
									>
										Adoption Rate
									</span>
								</div>
								<p
									style={{
										fontSize: "28px",
										fontWeight: 700,
										fontFamily: "'Space Grotesk', sans-serif",
										color: "#216959",
									}}
								>
									{stats.adoptionRate}%
								</p>
								<p style={{ fontSize: "11px", color: "#7AADA1", marginTop: "2px" }}>
									Based on total applications
								</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</AdminLayout>
	);
}
