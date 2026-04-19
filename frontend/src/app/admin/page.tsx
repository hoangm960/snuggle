"use client";

import { AdminLayout } from "./_components/AdminLayout";
import { StatCard } from "./_components/StatCard";
import { Users, PawPrint, HeartHandshake, Clock } from "lucide-react";
import {
	ResponsiveContainer,
	LineChart,
	Line,
	XAxis,
	YAxis,
	Tooltip,
	CartesianGrid,
	PieChart,
	Pie,
	Cell,
	BarChart,
	Bar,
} from "recharts";
import {
	stats,
	donationTrend,
	speciesSplit,
	adoptionWeek,
	customerMap,
	requests,
} from "./_lib/mockData";

const statusBadge = {
	Pending: "bg-warning/15 text-warning",
	Reviewing: "bg-primary-soft text-primary-deep",
	Approved: "bg-success/15 text-success",
	Rejected: "bg-destructive/15 text-destructive",
	Delivered: "bg-success text-primary-foreground",
} as const;

export default function AdminDashboard() {
	return (
		<AdminLayout
			title="Dashboard"
			subtitle="Welcome back, Samantha. Here's what's happening at Snuggle today."
		>
			{/* Stats */}
			<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
				<StatCard
					label="Total Users"
					value={stats.totalUsers.toLocaleString()}
					icon={Users}
					trend={{ value: "8.5%", up: true }}
					iconBg="primary"
				/>
				<StatCard
					label="Total Matches"
					value={stats.totalMatches.toString()}
					icon={PawPrint}
					trend={{ value: "1.3%", up: true }}
					iconBg="warm"
				/>
				<StatCard
					label="Total Donations"
					value={`$${(stats.totalDonations / 1000).toFixed(0)}K`}
					icon={HeartHandshake}
					trend={{ value: "4.3%", up: false }}
					iconBg="soft"
				/>
				<StatCard
					label="Total Pending"
					value={stats.totalPending.toString()}
					icon={Clock}
					trend={{ value: "1.8%", up: true }}
					highlight
				/>
			</div>

			{/* Charts row 1 */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
				{/* Pie */}
				<div className="lg:col-span-1 bg-card border border-border rounded-3xl p-6 shadow-card">
					<div className="flex items-center justify-between mb-2">
						<h3 className="font-display text-lg font-semibold">Species Split</h3>
					</div>
					<div className="h-[200px]">
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Pie
									data={speciesSplit}
									dataKey="value"
									innerRadius={50}
									outerRadius={80}
									paddingAngle={3}
								>
									{speciesSplit.map((entry, i) => (
										<Cell key={i} fill={entry.color} />
									))}
								</Pie>
								<Tooltip
									contentStyle={{
										background: "hsl(0 0% 100%)",
										border: "1px solid hsl(30 25% 88%)",
										borderRadius: "12px",
										fontSize: "12px",
									}}
								/>
							</PieChart>
						</ResponsiveContainer>
					</div>
					<div className="mt-4 grid grid-cols-3 gap-2 text-center">
						{speciesSplit.map((s) => (
							<div key={s.name}>
								<div
									className="size-2 rounded-full mx-auto mb-1.5"
									style={{ background: s.color }}
								/>
								<p className="font-display font-semibold text-lg">{s.value}%</p>
								<p className="text-[11px] text-muted-foreground">{s.name}</p>
							</div>
						))}
					</div>
				</div>

				{/* Adoption requests bar */}
				<div className="lg:col-span-2 bg-card border border-border rounded-3xl p-6 shadow-card">
					<div className="flex items-center justify-between mb-6">
						<div>
							<h3 className="font-display text-lg font-semibold">
								Adoption Requests
							</h3>
							<p className="text-xs text-muted-foreground">
								This week's adoption activity
							</p>
						</div>
						<button className="px-4 py-2 rounded-full text-xs font-semibold bg-primary-soft text-primary-deep hover:bg-primary hover:text-primary-foreground transition-colors">
							↓ Save Report
						</button>
					</div>
					<div className="h-[220px]">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={adoptionWeek}>
								<CartesianGrid
									strokeDasharray="3 3"
									stroke="hsl(30 25% 88%)"
									vertical={false}
								/>
								<XAxis
									dataKey="day"
									axisLine={false}
									tickLine={false}
									tick={{ fill: "hsl(24 15% 45%)", fontSize: 11 }}
								/>
								<YAxis
									axisLine={false}
									tickLine={false}
									tick={{ fill: "hsl(24 15% 45%)", fontSize: 11 }}
								/>
								<Tooltip
									cursor={{ fill: "hsl(170 30% 92%)" }}
									contentStyle={{
										background: "hsl(0 0% 100%)",
										border: "1px solid hsl(30 25% 88%)",
										borderRadius: "12px",
										fontSize: "12px",
									}}
								/>
								<Bar
									dataKey="value"
									fill="hsl(170 22% 58%)"
									radius={[8, 8, 0, 0]}
								/>
							</BarChart>
						</ResponsiveContainer>
					</div>
				</div>
			</div>

			{/* Charts row 2 */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
				<div className="lg:col-span-2 bg-card border border-border rounded-3xl p-6 shadow-card">
					<div className="flex items-center justify-between mb-6">
						<div>
							<h3 className="font-display text-lg font-semibold">Total Donations</h3>
							<p className="text-xs text-muted-foreground">
								Year over year comparison
							</p>
						</div>
						<div className="flex gap-3 text-xs">
							<span className="flex items-center gap-1.5">
								<div
									className="size-2.5 rounded-full"
									style={{ background: "hsl(170 22% 58%)" }}
								/>{" "}
								Current
							</span>
							<span className="flex items-center gap-1.5">
								<div
									className="size-2.5 rounded-full"
									style={{ background: "hsl(24 50% 58%)" }}
								/>{" "}
								Previous
							</span>
						</div>
					</div>
					<div className="h-[260px]">
						<ResponsiveContainer width="100%" height="100%">
							<LineChart data={donationTrend}>
								<CartesianGrid
									strokeDasharray="3 3"
									stroke="hsl(30 25% 88%)"
									vertical={false}
								/>
								<XAxis
									dataKey="month"
									axisLine={false}
									tickLine={false}
									tick={{ fill: "hsl(24 15% 45%)", fontSize: 11 }}
								/>
								<YAxis
									axisLine={false}
									tickLine={false}
									tick={{ fill: "hsl(24 15% 45%)", fontSize: 11 }}
								/>
								<Tooltip
									contentStyle={{
										background: "hsl(0 0% 100%)",
										border: "1px solid hsl(30 25% 88%)",
										borderRadius: "12px",
										fontSize: "12px",
									}}
								/>
								<Line
									type="monotone"
									dataKey="current"
									stroke="hsl(170 22% 58%)"
									strokeWidth={3}
									dot={{ r: 4, fill: "hsl(170 22% 58%)" }}
									activeDot={{ r: 6 }}
								/>
								<Line
									type="monotone"
									dataKey="previous"
									stroke="hsl(24 50% 58%)"
									strokeWidth={2}
									strokeDasharray="5 5"
									dot={false}
								/>
							</LineChart>
						</ResponsiveContainer>
					</div>
				</div>

				<div className="bg-card border border-border rounded-3xl p-6 shadow-card">
					<div className="flex items-center justify-between mb-6">
						<h3 className="font-display text-lg font-semibold">Customer Map</h3>
						<select className="text-xs bg-secondary border-0 rounded-full px-3 py-1.5 font-medium">
							<option>Weekly</option>
							<option>Monthly</option>
						</select>
					</div>
					<div className="h-[260px]">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={customerMap} layout="vertical">
								<CartesianGrid
									strokeDasharray="3 3"
									stroke="hsl(30 25% 88%)"
									horizontal={false}
								/>
								<XAxis
									type="number"
									axisLine={false}
									tickLine={false}
									tick={{ fill: "hsl(24 15% 45%)", fontSize: 11 }}
								/>
								<YAxis
									dataKey="region"
									type="category"
									axisLine={false}
									tickLine={false}
									tick={{ fill: "hsl(24 15% 45%)", fontSize: 11 }}
									width={60}
								/>
								<Tooltip
									cursor={{ fill: "hsl(170 30% 92%)" }}
									contentStyle={{
										background: "hsl(0 0% 100%)",
										border: "1px solid hsl(30 25% 88%)",
										borderRadius: "12px",
										fontSize: "12px",
									}}
								/>
								<Bar dataKey="value" fill="hsl(24 50% 58%)" radius={[0, 8, 8, 0]} />
							</BarChart>
						</ResponsiveContainer>
					</div>
				</div>
			</div>

			{/* Adoption requests table */}
			<div className="bg-card border border-border rounded-3xl shadow-card overflow-hidden">
				<div className="p-6 border-b border-border flex items-center justify-between">
					<h3 className="font-display text-lg font-semibold">Adoption Requests</h3>
					<select className="text-xs bg-secondary border-0 rounded-full px-3 py-1.5 font-medium">
						<option>October</option>
						<option>November</option>
						<option>December</option>
					</select>
				</div>
				<div className="overflow-x-auto">
					<table className="w-full text-left">
						<thead className="bg-secondary/40">
							<tr className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
								<th className="px-6 py-3.5">Pets</th>
								<th className="px-6 py-3.5">User name</th>
								<th className="px-6 py-3.5">Date · Time</th>
								<th className="px-6 py-3.5">Species</th>
								<th className="px-6 py-3.5">Status</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-border">
							{requests.map((r) => (
								<tr key={r.id} className="hover:bg-secondary/30 transition-colors">
									<td className="px-6 py-4">
										<div className="flex items-center gap-3">
											<img
												src={r.petImage}
												alt={r.petName}
												className="size-10 rounded-2xl object-cover"
											/>
											<span className="font-medium text-sm">{r.petName}</span>
										</div>
									</td>
									<td className="px-6 py-4 text-sm">{r.applicantName}</td>
									<td className="px-6 py-4 text-sm text-muted-foreground tabular-nums">
										{r.date}
									</td>
									<td className="px-6 py-4 text-sm text-muted-foreground">
										{r.species}
									</td>
									<td className="px-6 py-4">
										<span
											className={`px-3 py-1 rounded-full text-[11px] font-semibold ${statusBadge[r.status]}`}
										>
											{r.status}
										</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</AdminLayout>
	);
}
