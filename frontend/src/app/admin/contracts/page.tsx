"use client";

import { useState } from "react";
import { AdminLayout } from "../_components/AdminLayout";
import { FileSignature, Search, Eye, Download, X, CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface Contract {
	id: string;
	petName: string;
	adopter: string;
	adopterEmail: string;
	shelter: string;
	signedAt?: string;
	expiresAt: string;
	status: "active" | "pending_signature" | "expired" | "terminated";
	adoptionDate: string;
}

const mockContracts: Contract[] = [
	{ id: "CON-001", petName: "Mochi", adopter: "Sarah Johnson", adopterEmail: "sarah@email.com", shelter: "Happy Paws Shelter", signedAt: "Apr 25, 2026", expiresAt: "Apr 25, 2027", status: "active", adoptionDate: "Apr 25, 2026" },
	{ id: "CON-002", petName: "Luna", adopter: "David Kim", adopterEmail: "david@email.com", shelter: "City Animal Rescue", signedAt: undefined, expiresAt: "May 1, 2027", status: "pending_signature", adoptionDate: "Apr 27, 2026" },
	{ id: "CON-003", petName: "Charlie", adopter: "Emily Chen", adopterEmail: "emily@email.com", shelter: "Happy Paws Shelter", signedAt: "Mar 10, 2025", expiresAt: "Mar 10, 2026", status: "expired", adoptionDate: "Mar 10, 2025" },
	{ id: "CON-004", petName: "Bella", adopter: "James Wilson", adopterEmail: "james@email.com", shelter: "Furry Friends Hub", signedAt: "Apr 20, 2026", expiresAt: "Apr 20, 2027", status: "active", adoptionDate: "Apr 20, 2026" },
	{ id: "CON-005", petName: "Max", adopter: "Olivia Davis", adopterEmail: "olivia@email.com", shelter: "City Animal Rescue", signedAt: "Jan 5, 2026", expiresAt: "Jan 5, 2027", status: "terminated", adoptionDate: "Jan 5, 2026" },
];

const statusConfig = {
	active: { label: "Active", color: "#216959", bg: "#E8F4F1", icon: CheckCircle2 },
	pending_signature: { label: "Pending Signature", color: "#C4857A", bg: "#FAF0EE", icon: Clock },
	expired: { label: "Expired", color: "#999", bg: "#F4F4F4", icon: AlertCircle },
	terminated: { label: "Terminated", color: "#888", bg: "#F4F4F4", icon: X },
};

export default function ContractsPage() {
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [selected, setSelected] = useState<Contract | null>(null);

	const filtered = mockContracts.filter((c) => {
		const matchSearch = c.petName.toLowerCase().includes(search.toLowerCase()) || c.adopter.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase());
		const matchStatus = statusFilter === "all" || c.status === statusFilter;
		return matchSearch && matchStatus;
	});

	return (
		<AdminLayout>
			<div className="p-8">
				<div className="flex items-center gap-3 mb-8">
					<div className="size-10 rounded-xl flex items-center justify-center" style={{ background: "#E8F4F1" }}>
						<FileSignature className="size-5" style={{ color: "#7AADA1" }} />
					</div>
					<div>
						<h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "24px", fontWeight: 700, color: "#1C1C1C" }}>Adoption Contracts</h1>
						<p style={{ color: "#888", fontSize: "13px" }}>View and manage all adoption agreements</p>
					</div>
				</div>

				<div className="flex gap-3 mb-6">
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4" style={{ color: "#ccc" }} />
						<input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by pet, adopter or contract ID..."
							className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
							style={{ background: "#fff", border: "1px solid #E8E8E8", color: "#333" }} />
					</div>
					<select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
						className="px-4 py-2.5 rounded-xl text-sm outline-none"
						style={{ background: "#fff", border: "1px solid #E8E8E8", color: "#555" }}>
						<option value="all">All Status</option>
						{Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
					</select>
				</div>

				<div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1px solid #F0F0F0" }}>
					<table className="w-full">
						<thead style={{ background: "#FAFAFA" }}>
							<tr>
								{["Contract ID", "Pet", "Adopter", "Shelter", "Adoption Date", "Expires", "Status", ""].map((h) => (
									<th key={h} className="text-left px-5 py-3.5" style={{ fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</th>
								))}
							</tr>
						</thead>
						<tbody>
							{filtered.map((row) => {
								const sc = statusConfig[row.status];
								return (
									<tr key={row.id} style={{ borderTop: "1px solid #F5F5F5" }}>
										<td className="px-5 py-4" style={{ fontSize: "12px", color: "#aaa", fontFamily: "monospace" }}>{row.id}</td>
										<td className="px-5 py-4" style={{ fontSize: "13px", fontWeight: 500, color: "#1C1C1C" }}>{row.petName}</td>
										<td className="px-5 py-4">
											<p style={{ fontSize: "13px", color: "#444" }}>{row.adopter}</p>
											<p style={{ fontSize: "11px", color: "#aaa" }}>{row.adopterEmail}</p>
										</td>
										<td className="px-5 py-4" style={{ fontSize: "13px", color: "#666" }}>{row.shelter}</td>
										<td className="px-5 py-4" style={{ fontSize: "12px", color: "#aaa" }}>{row.adoptionDate}</td>
										<td className="px-5 py-4" style={{ fontSize: "12px", color: row.status === "expired" ? "#C4857A" : "#aaa" }}>{row.expiresAt}</td>
										<td className="px-5 py-4">
											<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full" style={{ background: sc.bg, color: sc.color, fontSize: "11px", fontWeight: 600 }}>
												<sc.icon className="size-3" />
												{sc.label}
											</span>
										</td>
										<td className="px-5 py-4">
											<div className="flex items-center gap-1.5">
												<button onClick={() => setSelected(row)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-gray-50"
													style={{ border: "1px solid #E8E8E8", color: "#666" }}>
													<Eye className="size-3" /> View
												</button>
												<button className="size-7 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
													style={{ border: "1px solid #E8E8E8" }}>
													<Download className="size-3.5" style={{ color: "#888" }} />
												</button>
											</div>
										</td>
									</tr>
								);
							})}
							{filtered.length === 0 && (
								<tr><td colSpan={8} className="px-5 py-10 text-center" style={{ color: "#aaa", fontSize: "13px" }}>No contracts found.</td></tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Detail Modal */}
			{selected && (
				<div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.4)" }} onClick={() => setSelected(null)}>
					<div className="w-[600px] max-h-[85vh] overflow-y-auto rounded-2xl p-6" style={{ background: "#fff" }} onClick={(e) => e.stopPropagation()}>
						<div className="flex items-center justify-between mb-6">
							<div>
								<h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "20px", fontWeight: 700, color: "#1C1C1C" }}>Adoption Contract</h3>
								<p style={{ fontSize: "12px", color: "#aaa" }}>{selected.id}</p>
							</div>
							<button onClick={() => setSelected(null)} className="size-8 rounded-lg flex items-center justify-center hover:bg-gray-100">
								<X className="size-4" style={{ color: "#888" }} />
							</button>
						</div>

						{/* Contract header */}
						<div className="rounded-2xl p-5 mb-5 text-center relative overflow-hidden" style={{ background: "linear-gradient(135deg, #7AADA1, #216959)", color: "#fff" }}>
							<FileSignature className="absolute -right-4 -top-4 size-20 opacity-10" />
							<p style={{ fontSize: "11px", opacity: 0.8, letterSpacing: "0.1em", textTransform: "uppercase" }}>Adoption Agreement</p>
							<p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "24px", fontWeight: 700, marginTop: "4px" }}>{selected.petName}</p>
							<span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: "rgba(255,255,255,0.2)" }}>
								{statusConfig[selected.status].label}
							</span>
						</div>

						<div className="grid grid-cols-2 gap-4 mb-5">
							{[
								{ label: "Adopter", value: selected.adopter },
								{ label: "Email", value: selected.adopterEmail },
								{ label: "Shelter", value: selected.shelter },
								{ label: "Adoption Date", value: selected.adoptionDate },
								{ label: "Contract Signed", value: selected.signedAt ?? "Not yet signed" },
								{ label: "Expiry Date", value: selected.expiresAt },
							].map((item) => (
								<div key={item.label} className="p-3 rounded-xl" style={{ background: "#F9F6F2" }}>
									<p style={{ fontSize: "10px", fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.08em" }}>{item.label}</p>
									<p style={{ fontSize: "13px", fontWeight: 500, color: "#1C1C1C", marginTop: "4px" }}>{item.value}</p>
								</div>
							))}
						</div>

						<div className="rounded-xl p-4 mb-5" style={{ background: "#F9F6F2" }}>
							<p style={{ fontSize: "12px", fontWeight: 600, color: "#666", marginBottom: "8px" }}>Contract Terms (Summary)</p>
							<ul className="space-y-1.5">
								{[
									"The adopter agrees to provide a safe and loving home for the pet.",
									"Regular veterinary care must be maintained.",
									"The pet may not be re-homed without shelter approval.",
									"The shelter reserves the right to conduct welfare checks.",
									"This agreement is binding for the duration shown above.",
								].map((term, i) => (
									<li key={i} className="flex items-start gap-2" style={{ fontSize: "12px", color: "#555" }}>
										<span style={{ color: "#7AADA1", fontWeight: 700 }}>·</span> {term}
									</li>
								))}
							</ul>
						</div>

						<div className="flex gap-3">
							<button className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium"
								style={{ border: "1px solid #E8E8E8", color: "#666" }}>
								<Download className="size-4" /> Download PDF
							</button>
							<button onClick={() => setSelected(null)} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white"
								style={{ background: "linear-gradient(135deg, #7AADA1, #216959)" }}>
								Close
							</button>
						</div>
					</div>
				</div>
			)}
		</AdminLayout>
	);
}
