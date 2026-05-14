"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "../_components/AdminLayout";
import { ekycApi } from "@/lib/ekycApi";
import { KycVerification, KycStats, KycWithUser } from "@/types";
import {
	Search,
	Loader2,
	X,
	CheckCircle,
	XCircle,
	Clock,
	Eye,
	ExternalLink,
	Shield,
	ShieldOff,
	AlertCircle,
	Filter,
} from "lucide-react";

type StatusFilter = "all" | "pending" | "approved" | "rejected";

const statusConfig: Record<
	KycVerification["status"],
	{ label: string; color: string; icon: typeof Clock }
> = {
	pending: { label: "Pending", color: "bg-amber-500/15 text-amber-600", icon: Clock },
	approved: { label: "Approved", color: "bg-success/15 text-success", icon: CheckCircle },
	rejected: { label: "Rejected", color: "bg-destructive/15 text-destructive", icon: XCircle },
};

export default function KycPage() {
	const [kycData, setKycData] = useState<KycVerification[]>([]);
	const [stats, setStats] = useState<KycStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
	const [search, setSearch] = useState("");
	const [selectedKyc, setSelectedKyc] = useState<KycWithUser | null>(null);
	const [showDetailModal, setShowDetailModal] = useState(false);
	const [actionLoading, setActionLoading] = useState<string | null>(null);
	const [actionMessage, setActionMessage] = useState<{
		type: "success" | "error";
		text: string;
	} | null>(null);
	const [showRejectModal, setShowRejectModal] = useState(false);
	const [rejectReason, setRejectReason] = useState("");
	const [rejectTarget, setRejectTarget] = useState<string | null>(null);

	const fetchData = async () => {
		try {
			setLoading(true);
			const [kycBatch, kycStats] = await Promise.all([
				ekycApi.getPendingKyc(),
				ekycApi.getKycStats(),
			]);
			setKycData(kycBatch.kycVerifications);
			setStats(kycStats);
		} catch (err) {
			setError("Failed to load KYC data");
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	const handleApprove = async (kycId: string) => {
		setActionLoading(kycId);
		try {
			await ekycApi.approveKyc(kycId);
			setActionMessage({ type: "success", text: "KYC approved successfully" });
			setShowDetailModal(false);
			setSelectedKyc(null);
			fetchData();
		} catch (err) {
			setActionMessage({ type: "error", text: "Failed to approve KYC" });
		} finally {
			setActionLoading(null);
			setTimeout(() => setActionMessage(null), 3000);
		}
	};

	const handleReject = async () => {
		if (!rejectTarget || !rejectReason.trim()) return;
		setActionLoading(rejectTarget);
		try {
			await ekycApi.rejectKyc(rejectTarget, rejectReason);
			setActionMessage({ type: "success", text: "KYC rejected successfully" });
			setShowRejectModal(false);
			setShowDetailModal(false);
			setSelectedKyc(null);
			setRejectReason("");
			setRejectTarget(null);
			fetchData();
		} catch (err) {
			setActionMessage({ type: "error", text: "Failed to reject KYC" });
		} finally {
			setActionLoading(null);
			setTimeout(() => setActionMessage(null), 3000);
		}
	};

	const openDetailModal = async (kyc: KycVerification) => {
		try {
			const data = await ekycApi.getKycById(kyc.id!);
			setSelectedKyc(data);
			setShowDetailModal(true);
		} catch (err) {
			setActionMessage({ type: "error", text: "Failed to load KYC details" });
		}
	};

	const openRejectModal = (kycId: string) => {
		setRejectTarget(kycId);
		setShowRejectModal(true);
	};

	const filteredKyc = kycData.filter((kyc) => {
		const matchesStatus = statusFilter === "all" || kyc.status === statusFilter;
		const searchLower = search.toLowerCase();
		const matchesSearch =
			!search ||
			(kyc.fullName?.toLowerCase().includes(searchLower) ?? false) ||
			(kyc.idNumber?.toLowerCase().includes(searchLower) ?? false);
		return matchesStatus && matchesSearch;
	});

	const formatDate = (date: Date | string | undefined) => {
		if (!date) return "-";
		return new Date(date).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<>
			<AdminLayout title="eKYC Verification" subtitle="Verify user identity documents">
				<div className="p-8">
					{stats && (
						<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
							<div className="bg-card border border-border rounded-2xl p-5 shadow-card">
								<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
									Total
								</p>
								<p className="font-display text-3xl font-semibold">{stats.total}</p>
							</div>
							<div className="bg-card border border-border rounded-2xl p-5 shadow-card">
								<div className="flex items-center gap-2 mb-1">
									<div className="size-2 rounded-full bg-amber-500" />
									<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
										Pending
									</p>
								</div>
								<p className="font-display text-3xl font-semibold">
									{stats.pending}
								</p>
							</div>
							<div className="bg-card border border-border rounded-2xl p-5 shadow-card">
								<div className="flex items-center gap-2 mb-1">
									<div className="size-2 rounded-full bg-success" />
									<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
										Approved
									</p>
								</div>
								<p className="font-display text-3xl font-semibold">
									{stats.approved}
								</p>
							</div>
							<div className="bg-card border border-border rounded-2xl p-5 shadow-card">
								<div className="flex items-center gap-2 mb-1">
									<div className="size-2 rounded-full bg-destructive" />
									<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
										Rejected
									</p>
								</div>
								<p className="font-display text-3xl font-semibold">
									{stats.rejected}
								</p>
							</div>
						</div>
					)}

					<div className="flex flex-col lg:flex-row gap-3 mb-6">
						<div className="relative flex-1">
							<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
							<input
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								placeholder="Search by name or ID number..."
								className="w-full pl-10 h-11 rounded-full bg-card border border-border shadow-card text-sm px-4 outline-none focus:ring-2 focus:ring-ring"
							/>
						</div>
						<div className="flex gap-2 overflow-x-auto">
							<Filter className="size-4 text-muted-foreground shrink-0" />
							{(["all", "pending", "approved", "rejected"] as StatusFilter[]).map(
								(status) => (
									<button
										key={status}
										onClick={() => setStatusFilter(status)}
										className={`px-4 h-11 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${statusFilter === status ? "bg-primary text-primary-foreground shadow-glow" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}
									>
										{status === "all"
											? "All"
											: status.charAt(0).toUpperCase() + status.slice(1)}
									</button>
								)
							)}
						</div>
					</div>

					{loading && (
						<div className="flex items-center justify-center py-20">
							<Loader2 className="size-8 animate-spin text-primary" />
						</div>
					)}

					{error && (
						<div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg mb-4">
							{error}
						</div>
					)}

					{!loading && !error && (
						<div className="bg-card border border-border rounded-3xl shadow-card overflow-hidden">
							<div className="overflow-x-auto">
								<table className="w-full text-left">
									<thead className="bg-secondary/40">
										<tr className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
											<th className="px-6 py-3.5">Applicant</th>
											<th className="px-6 py-3.5">ID Number</th>
											<th className="px-6 py-3.5">Submitted</th>
											<th className="px-6 py-3.5">Status</th>
											<th className="px-6 py-3.5">Documents</th>
											<th className="px-6 py-3.5"></th>
										</tr>
									</thead>
									<tbody className="divide-y divide-border">
										{filteredKyc.length === 0 ? (
											<tr>
												<td
													colSpan={6}
													className="px-6 py-12 text-center text-muted-foreground"
												>
													No KYC applications found
												</td>
											</tr>
										) : (
											filteredKyc.map((kyc) => {
												const StatusIcon = statusConfig[kyc.status].icon;
												return (
													<tr
														key={kyc.id}
														className="hover:bg-secondary/30 transition-colors"
													>
														<td className="px-6 py-4">
															<p className="font-medium text-sm">
																{kyc.fullName || "Unknown"}
															</p>
															<p className="text-xs text-muted-foreground">
																{kyc.phone || "-"}
															</p>
														</td>
														<td className="px-6 py-4 text-sm font-mono">
															{kyc.idNumber || "-"}
														</td>
														<td className="px-6 py-4 text-sm text-muted-foreground tabular-nums">
															{formatDate(kyc.submittedAt)}
														</td>
														<td className="px-6 py-4">
															<span
																className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusConfig[kyc.status].color}`}
															>
																<StatusIcon className="size-3" />
																{statusConfig[kyc.status].label}
															</span>
														</td>
														<td className="px-6 py-4">
															<div className="flex gap-2">
																{kyc.idDocumentURL && (
																	<a
																		href={kyc.idDocumentURL}
																		target="_blank"
																		rel="noopener noreferrer"
																		className="text-xs text-primary hover:underline flex items-center gap-1"
																	>
																		ID{" "}
																		<ExternalLink className="size-3" />
																	</a>
																)}
																{kyc.financialDocumentURL && (
																	<a
																		href={
																			kyc.financialDocumentURL
																		}
																		target="_blank"
																		rel="noopener noreferrer"
																		className="text-xs text-primary hover:underline flex items-center gap-1"
																	>
																		Financial{" "}
																		<ExternalLink className="size-3" />
																	</a>
																)}
																{!kyc.idDocumentURL &&
																	!kyc.financialDocumentURL && (
																		<span className="text-xs text-muted-foreground">
																			-
																		</span>
																	)}
															</div>
														</td>
														<td className="px-6 py-4 text-right">
															<button
																onClick={() => openDetailModal(kyc)}
																className="size-8 rounded-full hover:bg-secondary flex items-center justify-center text-muted-foreground"
															>
																<Eye className="size-4" />
															</button>
														</td>
													</tr>
												);
											})
										)}
									</tbody>
								</table>
							</div>
						</div>
					)}
				</div>
			</AdminLayout>

			{showDetailModal && selectedKyc && (
				<div
					className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4"
					onClick={() => setShowDetailModal(false)}
				>
					<div
						onClick={(e) => e.stopPropagation()}
						className="w-full max-w-2xl bg-card rounded-3xl shadow-soft p-7 max-h-[90vh] overflow-y-auto"
					>
						<div className="flex items-center justify-between mb-6">
							<h2 className="font-display text-2xl font-semibold">KYC Details</h2>
							<button
								onClick={() => setShowDetailModal(false)}
								className="size-9 rounded-full hover:bg-secondary flex items-center justify-center"
							>
								<X className="size-4" />
							</button>
						</div>

						<div className="space-y-6">
							<div className="flex items-center gap-4 p-4 bg-secondary/40 rounded-2xl">
								<div className="size-14 rounded-full bg-primary/10 flex items-center justify-center">
									<span className="text-xl font-semibold text-primary">
										{selectedKyc.user.displayName?.charAt(0).toUpperCase() ||
											"U"}
									</span>
								</div>
								<div>
									<p className="font-medium text-lg">
										{selectedKyc.user.displayName || "Unknown"}
									</p>
									<p className="text-sm text-muted-foreground">
										{selectedKyc.user.email}
									</p>
								</div>
								<div className="ml-auto">
									<span
										className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${statusConfig[selectedKyc.kyc.status].color}`}
									>
										{statusConfig[selectedKyc.kyc.status].label}
									</span>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="p-4 bg-secondary/40 rounded-2xl">
									<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
										Full Name
									</p>
									<p className="font-medium">{selectedKyc.kyc.fullName || "-"}</p>
								</div>
								<div className="p-4 bg-secondary/40 rounded-2xl">
									<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
										Date of Birth
									</p>
									<p className="font-medium">
										{selectedKyc.kyc.dateOfBirth || "-"}
									</p>
								</div>
								<div className="p-4 bg-secondary/40 rounded-2xl">
									<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
										ID Number
									</p>
									<p className="font-medium font-mono">
										{selectedKyc.kyc.idNumber || "-"}
									</p>
								</div>
								<div className="p-4 bg-secondary/40 rounded-2xl">
									<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
										Phone
									</p>
									<p className="font-medium">{selectedKyc.kyc.phone || "-"}</p>
								</div>
								<div className="p-4 bg-secondary/40 rounded-2xl">
									<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
										Submitted
									</p>
									<p className="font-medium">
										{formatDate(selectedKyc.kyc.submittedAt)}
									</p>
								</div>
								<div className="p-4 bg-secondary/40 rounded-2xl">
									<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
										Attempts
									</p>
									<p className="font-medium">
										{selectedKyc.kyc.attemptCount || 1}
									</p>
								</div>
							</div>

							{selectedKyc.kyc.rejectionReason && (
								<div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl">
									<p className="text-xs font-medium text-destructive uppercase tracking-wider mb-1">
										Rejection Reason
									</p>
									<p className="text-sm text-destructive">
										{selectedKyc.kyc.rejectionReason}
									</p>
								</div>
							)}

							<div className="space-y-3">
								<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
									Documents
								</p>
								<div className="grid grid-cols-2 gap-4">
									{selectedKyc.kyc.idDocumentURL && (
										<a
											href={selectedKyc.kyc.idDocumentURL}
											target="_blank"
											rel="noopener noreferrer"
											className="p-4 bg-secondary/40 rounded-2xl hover:bg-secondary/60 transition-colors flex items-center justify-between group"
										>
											<div>
												<p className="font-medium text-sm">ID Document</p>
												<p className="text-xs text-muted-foreground">
													View document
												</p>
											</div>
											<ExternalLink className="size-4 text-muted-foreground group-hover:text-primary" />
										</a>
									)}
									{selectedKyc.kyc.financialDocumentURL && (
										<a
											href={selectedKyc.kyc.financialDocumentURL}
											target="_blank"
											rel="noopener noreferrer"
											className="p-4 bg-secondary/40 rounded-2xl hover:bg-secondary/60 transition-colors flex items-center justify-between group"
										>
											<div>
												<p className="font-medium text-sm">
													Financial Document
												</p>
												<p className="text-xs text-muted-foreground">
													View document
												</p>
											</div>
											<ExternalLink className="size-4 text-muted-foreground group-hover:text-primary" />
										</a>
									)}
								</div>
							</div>

							{selectedKyc.kyc.status === "pending" && (
								<div className="flex gap-3 pt-4 border-t border-border">
									<button
										onClick={() => openRejectModal(selectedKyc.kyc.id!)}
										className="flex-1 h-11 rounded-2xl border border-destructive text-destructive text-sm font-medium hover:bg-destructive/10 flex items-center justify-center gap-2"
									>
										<ShieldOff className="size-4" />
										Reject
									</button>
									<button
										onClick={() => handleApprove(selectedKyc.kyc.id!)}
										disabled={actionLoading === selectedKyc.kyc.id}
										className="flex-1 h-11 rounded-2xl bg-success text-success-foreground text-sm font-medium hover:bg-success/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
									>
										{actionLoading === selectedKyc.kyc.id ? (
											<Loader2 className="size-4 animate-spin" />
										) : (
											<Shield className="size-4" />
										)}
										{actionLoading === selectedKyc.kyc.id
											? "Approving..."
											: "Approve"}
									</button>
								</div>
							)}
						</div>
					</div>
				</div>
			)}

			{showRejectModal && (
				<div
					className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4"
					onClick={() => {
						setShowRejectModal(false);
						setRejectReason("");
						setRejectTarget(null);
					}}
				>
					<div
						onClick={(e) => e.stopPropagation()}
						className="w-full max-w-md bg-card rounded-3xl shadow-soft p-7"
					>
						<div className="flex items-center gap-4 mb-6">
							<div className="size-12 rounded-full bg-destructive/10 flex items-center justify-center">
								<AlertCircle className="size-6 text-destructive" />
							</div>
							<div>
								<h2 className="font-display text-xl font-semibold">Reject KYC</h2>
								<p className="text-sm text-muted-foreground">
									Provide a reason for rejection
								</p>
							</div>
						</div>
						<textarea
							value={rejectReason}
							onChange={(e) => setRejectReason(e.target.value)}
							placeholder="Enter rejection reason..."
							className="w-full h-32 rounded-2xl border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none mb-4"
						/>
						<div className="flex gap-3">
							<button
								onClick={() => {
									setShowRejectModal(false);
									setRejectReason("");
									setRejectTarget(null);
								}}
								className="flex-1 h-11 rounded-2xl border border-border text-sm font-medium hover:bg-secondary"
							>
								Cancel
							</button>
							<button
								onClick={handleReject}
								disabled={!rejectReason.trim() || actionLoading === rejectTarget}
								className="flex-1 h-11 rounded-2xl bg-destructive text-destructive-foreground text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
							>
								{actionLoading === rejectTarget ? (
									<Loader2 className="size-4 animate-spin" />
								) : null}
								{actionLoading === rejectTarget ? "Rejecting..." : "Reject"}
							</button>
						</div>
					</div>
				</div>
			)}

			{actionMessage && (
				<div
					className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-3 rounded-lg text-sm z-50 ${actionMessage.type === "success" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}
				>
					{actionMessage.text}
				</div>
			)}
		</>
	);
}
