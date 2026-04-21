"use client";

import { useState } from "react";
import { AdminLayout } from "../_components/AdminLayout";
import { requests, Request } from "../_lib/mockData";
import { Check, X, Eye } from "lucide-react";

const statusBadge: Record<Request["status"], string> = {
	Pending: "bg-warning/15 text-warning",
	Reviewing: "bg-primary-soft text-primary-deep",
	Approved: "bg-success/15 text-success",
	Rejected: "bg-destructive/15 text-destructive",
	Delivered: "bg-success text-primary-foreground",
};

export default function RequestsPage() {
	const [tab, setTab] = useState<string>("All");

	const filtered = tab === "All" ? requests : requests.filter((r) => r.status === tab);

	const counts = {
		All: requests.length,
		Pending: requests.filter((r) => r.status === "Pending").length,
		Reviewing: requests.filter((r) => r.status === "Reviewing").length,
		Approved: requests.filter((r) => r.status === "Approved").length,
		Delivered: requests.filter((r) => r.status === "Delivered").length,
	};

	return (
		<AdminLayout
			title="Adoption Requests"
			subtitle="Review applications, schedule visits and approve forever homes."
		>
			{/* Tabs */}
			<div className="flex gap-2 mb-6 overflow-x-auto pb-1">
				{(["All", "Pending", "Reviewing", "Approved", "Delivered"] as const).map((t) => (
					<button
						key={t}
						onClick={() => setTab(t)}
						className={`px-5 h-11 rounded-full text-sm font-semibold whitespace-nowrap flex items-center gap-2 transition-colors ${
							tab === t
								? "bg-primary text-primary-foreground shadow-glow"
								: "bg-card border border-border text-muted-foreground hover:text-foreground"
						}`}
					>
						{t}
						<span
							className={`text-[11px] px-2 py-0.5 rounded-full ${tab === t ? "bg-primary-foreground/20" : "bg-secondary"}`}
						>
							{counts[t as keyof typeof counts]}
						</span>
					</button>
				))}
			</div>

			{/* Cards */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
				{filtered.map((r) => (
					<article
						key={r.id}
						className="bg-card border border-border rounded-3xl p-6 shadow-card hover:shadow-soft transition-shadow"
					>
						<div className="flex items-start justify-between mb-4">
							<span className="text-[10px] font-mono text-muted-foreground">
								{r.id}
							</span>
							<span
								className={`px-3 py-1 rounded-full text-[11px] font-semibold ${statusBadge[r.status]}`}
							>
								{r.status}
							</span>
						</div>

						<div className="flex gap-4 items-center mb-5">
							<img
								src={r.petImage}
								alt={r.petName}
								className="size-16 rounded-2xl object-cover"
							/>
							<div className="flex-1 min-w-0">
								<h3 className="font-display text-lg font-semibold">{r.petName}</h3>
								<p className="text-xs text-muted-foreground">{r.species}</p>
							</div>
							<div className="text-right">
								<p className="text-[10px] uppercase text-muted-foreground tracking-widest">
									Submitted
								</p>
								<p className="text-xs font-medium tabular-nums">{r.date}</p>
							</div>
						</div>

						<div className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/40 mb-4">
							<img
								src={r.applicantAvatar}
								alt={r.applicantName}
								className="size-10 rounded-full object-cover"
							/>
							<div className="flex-1">
								<p className="text-sm font-semibold">{r.applicantName}</p>
								<p className="text-[11px] text-muted-foreground">Applicant</p>
							</div>
							<button className="size-9 rounded-full bg-card hover:bg-card/80 flex items-center justify-center text-muted-foreground">
								<Eye className="size-4" />
							</button>
						</div>

						<div className="flex gap-2">
							<button className="flex-1 h-10 rounded-full bg-success/15 text-success font-semibold text-sm hover:bg-success hover:text-primary-foreground transition-colors flex items-center justify-center gap-1.5">
								<Check className="size-4" /> Approve
							</button>
							<button className="flex-1 h-10 rounded-full bg-destructive/15 text-destructive font-semibold text-sm hover:bg-destructive hover:text-destructive-foreground transition-colors flex items-center justify-center gap-1.5">
								<X className="size-4" /> Reject
							</button>
						</div>
					</article>
				))}
			</div>
		</AdminLayout>
	);
}
