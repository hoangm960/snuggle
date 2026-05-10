"use client";

import { useState } from "react";
import { AdminLayout } from "../_components/AdminLayout";
import { Check, X, ChevronDown, ChevronUp, Loader2, RefreshCw } from "lucide-react";
import { useApplications } from "@/hooks/useApplications";
import { usePets } from "@/hooks/usePets";
import type { AdoptionApplication } from "@/types";

type StatusFilter = "all" | AdoptionApplication["status"];

const statusConfig: Record<
	AdoptionApplication["status"],
	{ label: string; badge: string }
> = {
	pending: { label: "Pending", badge: "bg-warning/15 text-warning" },
	approved: { label: "Approved", badge: "bg-success/15 text-success" },
	rejected: { label: "Rejected", badge: "bg-destructive/15 text-destructive" },
	completed: { label: "Completed", badge: "bg-success text-primary-foreground" },
};

const TABS: { key: StatusFilter; label: string }[] = [
	{ key: "all", label: "All" },
	{ key: "pending", label: "Pending" },
	{ key: "approved", label: "Approved" },
	{ key: "rejected", label: "Rejected" },
	{ key: "completed", label: "Completed" },
];

function formatDate(date: Date | string | undefined) {
	if (!date) return "—";
	return new Date(date).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

function Initials({ name, size = 10 }: { name: string; size?: number }) {
	const letters = name
		.split(" ")
		.map((w) => w[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();
	return (
		<div
			className="rounded-full bg-primary-soft flex items-center justify-center font-semibold text-primary-deep shrink-0 font-display"
			style={{ width: size * 4, height: size * 4, fontSize: size * 1.4 }}
		>
			{letters}
		</div>
	);
}

export default function RequestsPage() {
	const { applications, loading, error, fetchApplications, updateStatus } = useApplications();
	const { pets } = usePets();

	const [tab, setTab] = useState<StatusFilter>("all");
	const [updating, setUpdating] = useState<string | null>(null);
	const [expanded, setExpanded] = useState<string | null>(null);
	const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});

	const filtered =
		tab === "all" ? applications : applications.filter((a) => a.status === tab);

	const counts: Record<StatusFilter, number> = {
		all: applications.length,
		pending: applications.filter((a) => a.status === "pending").length,
		approved: applications.filter((a) => a.status === "approved").length,
		rejected: applications.filter((a) => a.status === "rejected").length,
		completed: applications.filter((a) => a.status === "completed").length,
	};

	const getPet = (petId: string) => pets.find((p) => p.id === petId);

	const handleAction = async (
		id: string,
		status: AdoptionApplication["status"]
	) => {
		setUpdating(id);
		const note = noteInputs[id];
		await updateStatus(id, status, note);
		setUpdating(null);
		setExpanded(null);
	};

	return (
		<AdminLayout
			title="Adoption Requests"
			subtitle="Review applications and approve forever homes."
		>
			{/* Tabs */}
			<div className="flex gap-2 mb-6 overflow-x-auto pb-1">
				{TABS.map(({ key, label }) => (
					<button
						key={key}
						onClick={() => setTab(key)}
						className={`px-5 h-11 rounded-full text-sm font-semibold whitespace-nowrap flex items-center gap-2 transition-colors ${
							tab === key
								? "bg-primary text-primary-foreground shadow-glow"
								: "bg-card border border-border text-muted-foreground hover:text-foreground"
						}`}
					>
						{label}
						<span
							className={`text-[11px] px-2 py-0.5 rounded-full ${
								tab === key ? "bg-primary-foreground/20" : "bg-secondary"
							}`}
						>
							{counts[key]}
						</span>
					</button>
				))}
				<button
					onClick={fetchApplications}
					className="ml-auto size-11 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0"
					title="Refresh"
				>
					<RefreshCw className="size-4" />
				</button>
			</div>

			{/* States */}
			{loading ? (
				<div className="flex items-center justify-center py-20">
					<Loader2 className="size-6 animate-spin text-muted-foreground" />
				</div>
			) : error ? (
				<div className="text-center py-20">
					<p className="text-destructive text-sm mb-3">{error}</p>
					<button
						onClick={fetchApplications}
						className="text-sm font-semibold text-primary-deep hover:underline"
					>
						Try again
					</button>
				</div>
			) : filtered.length === 0 ? (
				<div className="text-center py-20">
					<p className="text-muted-foreground text-sm">No {tab === "all" ? "" : tab} applications yet.</p>
				</div>
			) : (
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
					{filtered.map((app) => {
						const pet = getPet(app.petId);
						const cfg = statusConfig[app.status];
						const isUpdating = updating === app.id;
						const isExpanded = expanded === app.id;

						return (
							<article
								key={app.id}
								className="bg-card border border-border rounded-3xl p-6 shadow-card hover:shadow-soft transition-shadow"
							>
								{/* Header */}
								<div className="flex items-start justify-between mb-4">
									<span className="text-[10px] font-mono text-muted-foreground">
										{app.id?.slice(0, 8).toUpperCase()}
									</span>
									<span className={`px-3 py-1 rounded-full text-[11px] font-semibold ${cfg.badge}`}>
										{cfg.label}
									</span>
								</div>

								{/* Pet info */}
								<div className="flex gap-4 items-center mb-5">
									{pet?.thumbnail ? (
										<img
											src={pet.thumbnail}
											alt={app.name}
											className="size-16 rounded-2xl object-cover shrink-0"
										/>
									) : (
										<div className="size-16 rounded-2xl bg-muted flex items-center justify-center text-2xl shrink-0">
											🐾
										</div>
									)}
									<div className="flex-1 min-w-0">
										<h3 className="font-display text-lg font-semibold truncate">
											{app.name}
										</h3>
										<p className="text-xs text-muted-foreground">
											{pet ? `${pet.breed} · ${pet.species}` : "Pet details unavailable"}
										</p>
									</div>
									<div className="text-right shrink-0">
										<p className="text-[10px] uppercase text-muted-foreground tracking-widest">
											Submitted
										</p>
										<p className="text-xs font-medium tabular-nums">
											{formatDate(app.appliedAt)}
										</p>
									</div>
								</div>

								{/* Applicant */}
								<div className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/40 mb-4">
									<Initials name={app.adopterName || "?"} size={10} />
									<div className="flex-1 min-w-0">
										<p className="text-sm font-semibold truncate">{app.adopterName}</p>
										<p className="text-[11px] text-muted-foreground">Applicant</p>
									</div>
								</div>

								{/* Message preview */}
								{app.message && (
									<button
										onClick={() => setExpanded(isExpanded ? null : app.id!)}
										className="w-full text-left mb-4"
									>
										<div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
											<span className="font-medium">Message</span>
											{isExpanded ? (
												<ChevronUp className="size-3" />
											) : (
												<ChevronDown className="size-3" />
											)}
										</div>
										{isExpanded ? (
											<p className="text-sm text-foreground/80 leading-relaxed">
												{app.message}
											</p>
										) : (
											<p className="text-sm text-foreground/60 truncate">
												{app.message}
											</p>
										)}
									</button>
								)}

								{/* Admin note (shown if set) */}
								{app.adminNote && (
									<div className="mb-4 px-3 py-2 rounded-xl bg-muted text-xs text-muted-foreground">
										<span className="font-semibold">Note: </span>
										{app.adminNote}
									</div>
								)}

								{/* Actions */}
								{app.status === "pending" && (
									<div className="space-y-2">
										<textarea
											value={noteInputs[app.id!] || ""}
											onChange={(e) =>
												setNoteInputs((prev) => ({
													...prev,
													[app.id!]: e.target.value,
												}))
											}
											placeholder="Admin note (optional)..."
											rows={2}
											className="w-full rounded-2xl border border-input bg-secondary/40 px-3 py-2 text-xs resize-none outline-none focus:ring-2 focus:ring-ring"
										/>
										<div className="flex gap-2">
											<button
												onClick={() => handleAction(app.id!, "approved")}
												disabled={isUpdating}
												className="flex-1 h-10 rounded-full bg-success/15 text-success font-semibold text-sm hover:bg-success hover:text-primary-foreground transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
											>
												{isUpdating ? (
													<Loader2 className="size-4 animate-spin" />
												) : (
													<Check className="size-4" />
												)}
												Approve
											</button>
											<button
												onClick={() => handleAction(app.id!, "rejected")}
												disabled={isUpdating}
												className="flex-1 h-10 rounded-full bg-destructive/15 text-destructive font-semibold text-sm hover:bg-destructive hover:text-destructive-foreground transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
											>
												{isUpdating ? (
													<Loader2 className="size-4 animate-spin" />
												) : (
													<X className="size-4" />
												)}
												Reject
											</button>
										</div>
									</div>
								)}

								{app.status === "approved" && (
									<button
										onClick={() => handleAction(app.id!, "completed")}
										disabled={isUpdating}
										className="w-full h-10 rounded-full bg-primary/15 text-primary-deep font-semibold text-sm hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
									>
										{isUpdating ? (
											<Loader2 className="size-4 animate-spin" />
										) : (
											<Check className="size-4" />
										)}
										Mark as Completed
									</button>
								)}
							</article>
						);
					})}
				</div>
			)}
		</AdminLayout>
	);
}
