"use client";

import { AdminLayout } from "./_components/AdminLayout";
import { PawPrint, ClipboardList, Users, HeartHandshake, TrendingUp, ArrowUpRight, Clock, CheckCircle2, XCircle, ShieldCheck } from "lucide-react";

const stats = [
	{ label: "Total Pets", value: "248", change: "+12 this week", icon: PawPrint, color: "#7AADA1", bg: "#E8F4F1" },
	{ label: "Pending Requests", value: "34", change: "+5 today", icon: ClipboardList, color: "#C4857A", bg: "#FAF0EE" },
	{ label: "Active Users", value: "1,204", change: "+89 this month", icon: Users, color: "#216959", bg: "#E8F4F1" },
	{ label: "Total Donations", value: "$8,450", change: "+$320 this week", icon: HeartHandshake, color: "#9A7768", bg: "#F5EFEB" },
];

const recentRequests = [
	{ id: "REQ-001", pet: "Mochi", adopter: "Sarah Johnson", date: "Apr 28, 2026", status: "pending" },
	{ id: "REQ-002", pet: "Luna", adopter: "David Kim", date: "Apr 27, 2026", status: "approved" },
	{ id: "REQ-003", pet: "Charlie", adopter: "Emily Chen", date: "Apr 27, 2026", status: "rejected" },
	{ id: "REQ-004", pet: "Bella", adopter: "James Wilson", date: "Apr 26, 2026", status: "pending" },
	{ id: "REQ-005", pet: "Max", adopter: "Olivia Davis", date: "Apr 26, 2026", status: "approved" },
];

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
	pending: { label: "Pending", color: "#C4857A", bg: "#FAF0EE", icon: Clock },
	approved: { label: "Approved", color: "#216959", bg: "#E8F4F1", icon: CheckCircle2 },
	rejected: { label: "Rejected", color: "#999", bg: "#F4F4F4", icon: XCircle },
};

export default function AdminDashboard() {
	return (
		<AdminLayout>
			<div className="p-8">
				<div className="mb-8">
					<h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "28px", fontWeight: 700, color: "#1C1C1C" }}>Dashboard</h1>
					<p style={{ color: "#888", fontSize: "14px", marginTop: "4px" }}>Welcome back! Here's what's happening at Snuggle.</p>
				</div>

				<div className="grid grid-cols-4 gap-5 mb-8">
					{stats.map((s) => (
						<div key={s.label} className="rounded-2xl p-5" style={{ background: "#fff", border: "1px solid #F0F0F0" }}>
							<div className="flex items-start justify-between mb-4">
								<div className="size-10 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
									<s.icon className="size-5" style={{ color: s.color }} />
								</div>
								<ArrowUpRight className="size-4" style={{ color: "#ccc" }} />
							</div>
							<p style={{ fontSize: "26px", fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: "#1C1C1C" }}>{s.value}</p>
							<p style={{ fontSize: "13px", color: "#888", marginTop: "2px" }}>{s.label}</p>
							<p style={{ fontSize: "11px", color: s.color, marginTop: "6px", fontWeight: 500 }}>{s.change}</p>
						</div>
					))}
				</div>

				<div className="grid grid-cols-3 gap-5">
					<div className="col-span-2 rounded-2xl p-6" style={{ background: "#fff", border: "1px solid #F0F0F0" }}>
						<div className="flex items-center justify-between mb-5">
							<h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "16px", fontWeight: 600, color: "#1C1C1C" }}>Recent Adoption Requests</h2>
							<a href="/admin/requests" style={{ fontSize: "12px", color: "#7AADA1", fontWeight: 500 }}>View all</a>
						</div>
						<table className="w-full">
							<thead>
								<tr>
									{["ID", "Pet", "Adopter", "Date", "Status"].map((h) => (
										<th key={h} className="text-left pb-3" style={{ fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</th>
									))}
								</tr>
							</thead>
							<tbody>
								{recentRequests.map((r) => {
									const s = statusConfig[r.status];
									return (
										<tr key={r.id} style={{ borderTop: "1px solid #F8F8F8" }}>
											<td className="py-3" style={{ fontSize: "12px", color: "#aaa" }}>{r.id}</td>
											<td className="py-3" style={{ fontSize: "13px", fontWeight: 500, color: "#1C1C1C" }}>{r.pet}</td>
											<td className="py-3" style={{ fontSize: "13px", color: "#666" }}>{r.adopter}</td>
											<td className="py-3" style={{ fontSize: "12px", color: "#aaa" }}>{r.date}</td>
											<td className="py-3">
												<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full" style={{ background: s.bg, color: s.color, fontSize: "11px", fontWeight: 600 }}>
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

					<div className="rounded-2xl p-6" style={{ background: "#fff", border: "1px solid #F0F0F0" }}>
						<h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "16px", fontWeight: 600, color: "#1C1C1C", marginBottom: "20px" }}>Quick Actions</h2>
						<div className="space-y-3">
							{[
								{ label: "Review eKYC Submissions", href: "/admin/ekyc", icon: ShieldCheck, count: 7 },
								{ label: "Pending Requests", href: "/admin/requests", icon: ClipboardList, count: 34 },
								{ label: "New Pet Listings", href: "/admin/pets", icon: PawPrint, count: 3 },
							].map((item) => (
								<a key={item.href} href={item.href}
									className="flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-gray-50"
									style={{ border: "1px solid #F0F0F0" }}>
									<div className="size-9 rounded-lg flex items-center justify-center" style={{ background: "#E8F4F1" }}>
										<item.icon className="size-4" style={{ color: "#7AADA1" }} />
									</div>
									<span className="flex-1" style={{ fontSize: "13px", color: "#444" }}>{item.label}</span>
									<span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white" style={{ background: "#C4857A" }}>{item.count}</span>
								</a>
							))}
						</div>

						<div className="mt-6 rounded-xl p-4" style={{ background: "linear-gradient(135deg, #E8F4F1, #D0EBE5)" }}>
							<div className="flex items-center gap-2 mb-1">
								<TrendingUp className="size-4" style={{ color: "#216959" }} />
								<span style={{ fontSize: "12px", fontWeight: 600, color: "#216959" }}>Adoption Rate</span>
							</div>
							<p style={{ fontSize: "28px", fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: "#216959" }}>82%</p>
							<p style={{ fontSize: "11px", color: "#7AADA1", marginTop: "2px" }}>↑ 6% from last month</p>
						</div>
					</div>
				</div>
			</div>
		</AdminLayout>
	);
}
