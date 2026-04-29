"use client";

import { useState } from "react";
import { AdminLayout } from "../_components/AdminLayout";
import { ShieldCheck, Search, Eye, CheckCircle2, XCircle, Clock, Download, X, User } from "lucide-react";

interface EkycSubmission {
	id: string;
	userId: string;
	name: string;
	email: string;
	idType: string;
	idNumber: string;
	submittedAt: string;
	status: "pending" | "approved" | "rejected";
	idFrontUrl?: string;
	idBackUrl?: string;
	selfieUrl?: string;
	rejectReason?: string;
}

const mockSubmissions: EkycSubmission[] = [
	{ id: "KYC-001", userId: "u1", name: "Sarah Johnson", email: "sarah@email.com", idType: "National ID", idNumber: "123-456-789", submittedAt: "Apr 28, 2026", status: "pending" },
	{ id: "KYC-002", userId: "u2", name: "David Kim", email: "david@email.com", idType: "Passport", idNumber: "P87654321", submittedAt: "Apr 27, 2026", status: "approved" },
	{ id: "KYC-003", userId: "u3", name: "Emily Chen", email: "emily@email.com", idType: "Driver's License", idNumber: "DL-99882", submittedAt: "Apr 27, 2026", status: "rejected", rejectReason: "Image not clear" },
	{ id: "KYC-004", userId: "u4", name: "James Wilson", email: "james@email.com", idType: "National ID", idNumber: "987-654-321", submittedAt: "Apr 26, 2026", status: "pending" },
	{ id: "KYC-005", userId: "u5", name: "Olivia Davis", email: "olivia@email.com", idType: "Passport", idNumber: "P11223344", submittedAt: "Apr 25, 2026", status: "approved" },
];

const statusConfig = {
	pending: { label: "Pending", color: "#C4857A", bg: "#FAF0EE", icon: Clock },
	approved: { label: "Approved", color: "#216959", bg: "#E8F4F1", icon: CheckCircle2 },
	rejected: { label: "Rejected", color: "#999", bg: "#F4F4F4", icon: XCircle },
};

export default function EkycPage() {
	const [search, setSearch] = useState("");
	const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
	const [selected, setSelected] = useState<EkycSubmission | null>(null);
	const [rejectReason, setRejectReason] = useState("");
	const [submissions, setSubmissions] = useState(mockSubmissions);

	const filtered = submissions.filter((s) => {
		const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase());
		const matchFilter = filter === "all" || s.status === filter;
		return matchSearch && matchFilter;
	});

	function approve(id: string) {
		setSubmissions((prev) => prev.map((s) => s.id === id ? { ...s, status: "approved" } : s));
		setSelected(null);
	}

	function reject(id: string) {
		setSubmissions((prev) => prev.map((s) => s.id === id ? { ...s, status: "rejected", rejectReason } : s));
		setRejectReason("");
		setSelected(null);
	}

	const counts = { all: submissions.length, pending: submissions.filter((s) => s.status === "pending").length, approved: submissions.filter((s) => s.status === "approved").length, rejected: submissions.filter((s) => s.status === "rejected").length };

	return (
		<AdminLayout>
			<div className="p-8">
				<div className="flex items-center gap-3 mb-8">
					<div className="size-10 rounded-xl flex items-center justify-center" style={{ background: "#E8F4F1" }}>
						<ShieldCheck className="size-5" style={{ color: "#7AADA1" }} />
					</div>
					<div>
						<h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "24px", fontWeight: 700, color: "#1C1C1C" }}>eKYC Management</h1>
						<p style={{ color: "#888", fontSize: "13px" }}>Review and verify user identity submissions</p>
					</div>
				</div>

				{/* Filter tabs */}
				<div className="flex gap-2 mb-6">
					{(["all", "pending", "approved", "rejected"] as const).map((tab) => (
						<button key={tab} onClick={() => setFilter(tab)}
							className="px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize"
							style={{ background: filter === tab ? "#216959" : "#fff", color: filter === tab ? "#fff" : "#666", border: "1px solid", borderColor: filter === tab ? "#216959" : "#E8E8E8" }}>
							{tab} <span className="ml-1 opacity-70">({counts[tab]})</span>
						</button>
					))}
				</div>

				{/* Search */}
				<div className="relative mb-5">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4" style={{ color: "#ccc" }} />
					<input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email or ID..."
						className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
						style={{ background: "#fff", border: "1px solid #E8E8E8", color: "#333" }} />
				</div>

				{/* Table */}
				<div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1px solid #F0F0F0" }}>
					<table className="w-full">
						<thead style={{ background: "#FAFAFA" }}>
							<tr>
								{["Submission ID", "Name", "ID Type", "ID Number", "Submitted", "Status", "Actions"].map((h) => (
									<th key={h} className="text-left px-5 py-3.5" style={{ fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</th>
								))}
							</tr>
						</thead>
						<tbody>
							{filtered.map((row) => {
								const sc = statusConfig[row.status];
								return (
									<tr key={row.id} style={{ borderTop: "1px solid #F5F5F5" }}>
										<td className="px-5 py-4" style={{ fontSize: "12px", color: "#aaa" }}>{row.id}</td>
										<td className="px-5 py-4">
											<p style={{ fontSize: "13px", fontWeight: 500, color: "#1C1C1C" }}>{row.name}</p>
											<p style={{ fontSize: "11px", color: "#aaa" }}>{row.email}</p>
										</td>
										<td className="px-5 py-4" style={{ fontSize: "13px", color: "#666" }}>{row.idType}</td>
										<td className="px-5 py-4" style={{ fontSize: "13px", color: "#666", fontFamily: "monospace" }}>{row.idNumber}</td>
										<td className="px-5 py-4" style={{ fontSize: "12px", color: "#aaa" }}>{row.submittedAt}</td>
										<td className="px-5 py-4">
											<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full" style={{ background: sc.bg, color: sc.color, fontSize: "11px", fontWeight: 600 }}>
												<sc.icon className="size-3" />
												{sc.label}
											</span>
										</td>
										<td className="px-5 py-4">
											<button onClick={() => setSelected(row)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-gray-50"
												style={{ border: "1px solid #E8E8E8", color: "#666" }}>
												<Eye className="size-3.5" /> Review
											</button>
										</td>
									</tr>
								);
							})}
							{filtered.length === 0 && (
								<tr><td colSpan={7} className="px-5 py-10 text-center" style={{ color: "#aaa", fontSize: "13px" }}>No submissions found.</td></tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Detail Modal */}
			{selected && (
				<div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.4)" }} onClick={() => setSelected(null)}>
					<div className="w-[560px] max-h-[85vh] overflow-y-auto rounded-2xl p-6" style={{ background: "#fff" }} onClick={(e) => e.stopPropagation()}>
						<div className="flex items-center justify-between mb-5">
							<h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "18px", fontWeight: 700, color: "#1C1C1C" }}>KYC Review — {selected.id}</h3>
							<button onClick={() => setSelected(null)} className="size-8 rounded-lg flex items-center justify-center hover:bg-gray-100">
								<X className="size-4" style={{ color: "#888" }} />
							</button>
						</div>

						<div className="flex items-center gap-3 p-4 rounded-xl mb-5" style={{ background: "#F9F6F2" }}>
							<div className="size-12 rounded-full flex items-center justify-center" style={{ background: "#E8F4F1" }}>
								<User className="size-6" style={{ color: "#7AADA1" }} />
							</div>
							<div>
								<p style={{ fontWeight: 600, color: "#1C1C1C" }}>{selected.name}</p>
								<p style={{ fontSize: "13px", color: "#888" }}>{selected.email}</p>
							</div>
							<span className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-full" style={{ background: statusConfig[selected.status].bg, color: statusConfig[selected.status].color, fontSize: "11px", fontWeight: 600 }}>
								{selected.status}
							</span>
						</div>

						<div className="grid grid-cols-2 gap-4 mb-5">
							<div className="p-3 rounded-xl" style={{ background: "#F9F6F2" }}>
								<p style={{ fontSize: "10px", fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.08em" }}>ID Type</p>
								<p style={{ fontSize: "14px", fontWeight: 500, color: "#1C1C1C", marginTop: "4px" }}>{selected.idType}</p>
							</div>
							<div className="p-3 rounded-xl" style={{ background: "#F9F6F2" }}>
								<p style={{ fontSize: "10px", fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.08em" }}>ID Number</p>
								<p style={{ fontSize: "14px", fontWeight: 500, color: "#1C1C1C", marginTop: "4px", fontFamily: "monospace" }}>{selected.idNumber}</p>
							</div>
						</div>

						<p style={{ fontSize: "12px", fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>Documents</p>
						<div className="grid grid-cols-3 gap-3 mb-6">
							{["ID Front", "ID Back", "Selfie"].map((label) => (
								<div key={label} className="rounded-xl flex flex-col items-center justify-center gap-2 py-8" style={{ background: "#F9F6F2", border: "2px dashed #E0E0E0" }}>
									<Download className="size-5" style={{ color: "#ccc" }} />
									<p style={{ fontSize: "11px", color: "#aaa" }}>{label}</p>
								</div>
							))}
						</div>

						{selected.rejectReason && (
							<div className="p-3 rounded-xl mb-5" style={{ background: "#FAF0EE", border: "1px solid #F0D8D4" }}>
								<p style={{ fontSize: "12px", fontWeight: 600, color: "#C4857A" }}>Rejection reason: {selected.rejectReason}</p>
							</div>
						)}

						{selected.status === "pending" && (
							<>
								<div className="mb-4">
									<label style={{ fontSize: "12px", fontWeight: 600, color: "#666", display: "block", marginBottom: "6px" }}>Rejection reason (optional)</label>
									<input value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Explain why this submission is rejected..."
										className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
										style={{ border: "1px solid #E8E8E8", color: "#333" }} />
								</div>
								<div className="flex gap-3">
									<button onClick={() => reject(selected.id)} className="flex-1 py-2.5 rounded-xl font-medium text-sm transition-opacity hover:opacity-80"
										style={{ background: "#F4F4F4", color: "#888" }}>
										Reject
									</button>
									<button onClick={() => approve(selected.id)} className="flex-1 py-2.5 rounded-xl font-medium text-sm text-white transition-opacity hover:opacity-90"
										style={{ background: "linear-gradient(135deg, #7AADA1, #216959)" }}>
										Approve
									</button>
								</div>
							</>
						)}
					</div>
				</div>
			)}
		</AdminLayout>
	);
}
