"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminLayout } from "../_components/AdminLayout";
import api from "@/lib/api";
import { Check, X, Eye, Loader2, FileSignature } from "lucide-react";
import { contractsApi, CreateContractDto } from "@/lib/api";

interface Application {
	id: string;
	petId: string;
	petName: string;
	petThumbnail?: string;
	petSpecies?: string;
	adopterId: string;
	adopterName: string;
	adopterPhoto?: string;
	adopterEmail?: string;
	status: "pending" | "approved" | "rejected" | "completed";
	message?: string;
	adminNote?: string;
	appliedAt: string;
	reviewedAt?: string;
	reviewedBy?: string;
}

interface AppStats {
	all: number;
	pending: number;
	approved: number;
	rejected: number;
	completed: number;
}

const statusBadge: Record<string, string> = {
	pending: "bg-warning/15 text-warning",
	approved: "bg-success/15 text-success",
	rejected: "bg-destructive/15 text-destructive",
	completed: "bg-success text-primary-foreground",
};

const statusLabel: Record<string, string> = {
	pending: "Pending",
	approved: "Approved",
	rejected: "Rejected",
	completed: "Delivered",
};

function formatDate(dateStr: string): string {
	try {
		const date = new Date(dateStr);
		return date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	} catch {
		return dateStr;
	}
}

export default function RequestsPage() {
	const [tab, setTab] = useState<string>("All");
	const [applications, setApplications] = useState<Application[]>([]);
	const [stats, setStats] = useState<AppStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [actionLoading, setActionLoading] = useState<string | null>(null);
	const [actionMsg, setActionMsg] = useState<{ type: "success" | "error"; text: string } | null>(
		null
	);

	const fetchApplications = useCallback(async (statusFilter?: string) => {
		setLoading(true);
		setError(null);
		try {
			const params = new URLSearchParams();
			if (statusFilter && statusFilter !== "All") {
				params.append("status", statusFilter.toLowerCase());
			}
			const res = await api.get(`/admin/applications?${params.toString()}`);
			setApplications(res.data.data.applications || []);
			setStats(res.data.data.stats || null);
		} catch (err) {
			console.error("Failed to fetch applications:", err);
			setError("Failed to load applications");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		const statusFilter = tab === "All" ? undefined : tab;
		fetchApplications(statusFilter);
	}, [tab, fetchApplications]);

	const handleStatusUpdate = async (id: string, newStatus: "approved" | "rejected") => {
		setActionLoading(id);
		setActionMsg(null);
		try {
			await api.put(`/admin/applications/${id}/status`, { status: newStatus });
			setActionMsg({
				type: "success",
				text: `Application ${newStatus === "approved" ? "approved" : "rejected"} successfully`,
			});
			fetchApplications(tab === "All" ? undefined : tab);
		} catch (err) {
			setActionMsg({ type: "error", text: "Failed to update application" });
		} finally {
			setActionLoading(null);
			setTimeout(() => setActionMsg(null), 3000);
		}
	};

	const handleGenerateContract = async (app: Application) => {
		setActionLoading(app.id);
		setActionMsg(null);
		try {
			const contractData: CreateContractDto = {
				applicationId: app.id,
				petId: app.petId,
				adopterId: app.adopterId,
			};
			await contractsApi.create(contractData);
			setActionMsg({
				type: "success",
				text: `Contract generated for ${app.petName}`,
			});
			fetchApplications(tab === "All" ? undefined : tab);
		} catch (err) {
			setActionMsg({ type: "error", text: "Failed to generate contract" });
		} finally {
			setActionLoading(null);
			setTimeout(() => setActionMsg(null), 3000);
		}
	};

	const counts = stats
		? {
				All: stats.all,
				Pending: stats.pending,
				Approved: stats.approved,
				Rejected: stats.rejected,
				Delivered: stats.completed,
			}
		: { All: 0, Pending: 0, Approved: 0, Rejected: 0, Delivered: 0 };

	const statusTabMap: Record<string, string> = {
		All: "All",
		Pending: "Pending",
		Approved: "Approved",
		Rejected: "Rejected",
		Delivered: "Completed",
	};

	return (
		<AdminLayout
			title="Adoption Requests"
			subtitle="Review applications, schedule visits and approve forever homes."
		>
			{/* Tabs */}
			<div className="flex gap-2 mb-6 overflow-x-auto pb-1">
				{(["All", "Pending", "Approved", "Rejected", "Delivered"] as const).map((t) => (
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
							className={`text-[11px] px-2 py-0.5 rounded-full ${
								tab === t ? "bg-primary-foreground/20" : "bg-secondary"
							}`}
						>
							{counts[t as keyof typeof counts]}
						</span>
					</button>
				))}
			</div>

			{loading ? (
				<div className="flex items-center justify-center py-20">
					<Loader2 className="size-8 animate-spin text-primary" />
				</div>
			) : error ? (
				<div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg">
					{error}
				</div>
			) : applications.length === 0 ? (
				<div className="text-center py-20 text-muted-foreground">No requests found</div>
			) : (
				/* Cards */
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
					{applications.map((r) => (
						<article
							key={r.id}
							className="bg-card border border-border rounded-3xl p-6 shadow-card hover:shadow-soft transition-shadow"
						>
							<div className="flex items-start justify-between mb-4">
								<span className="text-[10px] font-mono text-muted-foreground">
									{r.id.slice(0, 12)}
								</span>
								<span
									className={`px-3 py-1 rounded-full text-[11px] font-semibold ${statusBadge[r.status]}`}
								>
									{statusLabel[r.status]}
								</span>
							</div>

							<div className="flex gap-4 items-center mb-5">
								<img
									src={r.petThumbnail || "/images/placeholder.png"}
									alt={r.petName}
									className="size-16 rounded-2xl object-cover"
								/>
								<div className="flex-1 min-w-0">
									<h3 className="font-display text-lg font-semibold">
										{r.petName}
									</h3>
									<p className="text-xs text-muted-foreground">
										{r.petSpecies || "Pet"}
									</p>
								</div>
								<div className="text-right">
									<p className="text-[10px] uppercase text-muted-foreground tracking-widest">
										Submitted
									</p>
									<p className="text-xs font-medium tabular-nums">
										{formatDate(r.appliedAt)}
									</p>
								</div>
							</div>

							<div className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/40 mb-4">
								<img
									src={
										r.adopterPhoto ||
										`https://ui-avatars.com/api/?name=${encodeURIComponent(r.adopterName)}&background=random`
									}
									alt={r.adopterName}
									className="size-10 rounded-full object-cover"
								/>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-semibold truncate">
										{r.adopterName}
									</p>
									<p className="text-[11px] text-muted-foreground">
										{r.adopterEmail || "Applicant"}
									</p>
								</div>
								<button className="size-9 rounded-full bg-card hover:bg-card/80 flex items-center justify-center text-muted-foreground">
									<Eye className="size-4" />
								</button>
							</div>

							{r.message && (
								<p className="text-xs text-muted-foreground mb-4 line-clamp-2 px-3 py-2 bg-secondary/30 rounded-xl">
									"{r.message}"
								</p>
							)}

							<div className="flex gap-2">
								{r.status === "pending" && (
									<>
										<button
											onClick={() => handleStatusUpdate(r.id, "approved")}
											disabled={actionLoading === r.id}
											className="flex-1 h-10 rounded-full bg-success/15 text-success font-semibold text-sm hover:bg-success hover:text-primary-foreground transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
										>
											{actionLoading === r.id ? (
												<Loader2 className="size-4 animate-spin" />
											) : (
												<Check className="size-4" />
											)}{" "}
											Approve
										</button>
										<button
											onClick={() => handleStatusUpdate(r.id, "rejected")}
											disabled={actionLoading === r.id}
											className="flex-1 h-10 rounded-full bg-destructive/15 text-destructive font-semibold text-sm hover:bg-destructive hover:text-destructive-foreground transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
										>
											{actionLoading === r.id ? (
												<Loader2 className="size-4 animate-spin" />
											) : (
												<X className="size-4" />
											)}{" "}
											Reject
										</button>
									</>
								)}
								{r.status === "approved" && (
									<button
										onClick={() => handleGenerateContract(r)}
										disabled={actionLoading === r.id}
										className="flex-1 h-10 rounded-full bg-primary/15 text-primary font-semibold text-sm hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
									>
										{actionLoading === r.id ? (
											<Loader2 className="size-4 animate-spin" />
										) : (
											<FileSignature className="size-4" />
										)}{" "}
										Generate Contract
									</button>
								)}
							</div>
						</article>
					))}
				</div>
			)}

			{actionMsg && (
				<div
					className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-3 rounded-lg text-sm z-50 ${
						actionMsg.type === "success"
							? "bg-success/10 text-success"
							: "bg-destructive/10 text-destructive"
					}`}
				>
					{actionMsg.text}
				</div>
			)}
		</AdminLayout>
	);
}
