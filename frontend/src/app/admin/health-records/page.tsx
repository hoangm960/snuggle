"use client";

import { useState } from "react";
import { AdminLayout } from "../_components/AdminLayout";
import { HeartPulse, Plus, Search, Edit2, Trash2, X, PawPrint } from "lucide-react";

interface HealthRecord {
	id: string;
	petId: string;
	petName: string;
	petSpecies: string;
	type: "vaccination" | "checkup" | "treatment" | "surgery" | "dental";
	title: string;
	description: string;
	veterinarian: string;
	date: string;
	nextDueDate?: string;
}

const mockRecords: HealthRecord[] = [
	{ id: "HR-001", petId: "p1", petName: "Mochi", petSpecies: "cat", type: "vaccination", title: "Rabies Vaccine", description: "Annual rabies vaccination", veterinarian: "Dr. Sarah Lee", date: "Apr 20, 2026", nextDueDate: "Apr 20, 2027" },
	{ id: "HR-002", petId: "p1", petName: "Mochi", petSpecies: "cat", type: "checkup", title: "Annual Wellness Exam", description: "General health checkup, all normal", veterinarian: "Dr. Sarah Lee", date: "Apr 20, 2026" },
	{ id: "HR-003", petId: "p2", petName: "Luna", petSpecies: "dog", type: "treatment", title: "Flea Treatment", description: "Applied topical flea prevention", veterinarian: "Dr. James Park", date: "Apr 15, 2026", nextDueDate: "May 15, 2026" },
	{ id: "HR-004", petId: "p3", petName: "Charlie", petSpecies: "dog", type: "surgery", title: "Spay Surgery", description: "Successful spay surgery, recovery normal", veterinarian: "Dr. Emily Wang", date: "Apr 10, 2026" },
	{ id: "HR-005", petId: "p2", petName: "Luna", petSpecies: "dog", type: "dental", title: "Dental Cleaning", description: "Professional dental cleaning", veterinarian: "Dr. James Park", date: "Mar 28, 2026", nextDueDate: "Mar 28, 2027" },
];

const typeConfig: Record<string, { label: string; color: string; bg: string }> = {
	vaccination: { label: "Vaccination", color: "#216959", bg: "#E8F4F1" },
	checkup: { label: "Checkup", color: "#7AADA1", bg: "#F0F8F6" },
	treatment: { label: "Treatment", color: "#C4857A", bg: "#FAF0EE" },
	surgery: { label: "Surgery", color: "#9A7768", bg: "#F5EFEB" },
	dental: { label: "Dental", color: "#666", bg: "#F4F4F4" },
};

const emptyForm: Omit<HealthRecord, "id"> = {
	petId: "", petName: "", petSpecies: "dog", type: "checkup", title: "", description: "", veterinarian: "", date: "", nextDueDate: "",
};

export default function HealthRecordsPage() {
	const [records, setRecords] = useState(mockRecords);
	const [search, setSearch] = useState("");
	const [typeFilter, setTypeFilter] = useState("all");
	const [showModal, setShowModal] = useState(false);
	const [editRecord, setEditRecord] = useState<HealthRecord | null>(null);
	const [form, setForm] = useState<Omit<HealthRecord, "id">>(emptyForm);

	const filtered = records.filter((r) => {
		const matchSearch = r.petName.toLowerCase().includes(search.toLowerCase()) || r.title.toLowerCase().includes(search.toLowerCase()) || r.veterinarian.toLowerCase().includes(search.toLowerCase());
		const matchType = typeFilter === "all" || r.type === typeFilter;
		return matchSearch && matchType;
	});

	function openAdd() { setEditRecord(null); setForm(emptyForm); setShowModal(true); }
	function openEdit(r: HealthRecord) { setEditRecord(r); setForm({ petId: r.petId, petName: r.petName, petSpecies: r.petSpecies, type: r.type, title: r.title, description: r.description, veterinarian: r.veterinarian, date: r.date, nextDueDate: r.nextDueDate ?? "" }); setShowModal(true); }

	function save() {
		if (editRecord) {
			setRecords((prev) => prev.map((r) => r.id === editRecord.id ? { ...r, ...form } : r));
		} else {
			setRecords((prev) => [...prev, { ...form, id: `HR-${String(prev.length + 1).padStart(3, "0")}` }]);
		}
		setShowModal(false);
	}

	function del(id: string) { setRecords((prev) => prev.filter((r) => r.id !== id)); }

	return (
		<AdminLayout>
			<div className="p-8">
				<div className="flex items-center justify-between mb-8">
					<div className="flex items-center gap-3">
						<div className="size-10 rounded-xl flex items-center justify-center" style={{ background: "#E8F4F1" }}>
							<HeartPulse className="size-5" style={{ color: "#7AADA1" }} />
						</div>
						<div>
							<h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "24px", fontWeight: 700, color: "#1C1C1C" }}>Health Records</h1>
							<p style={{ color: "#888", fontSize: "13px" }}>Manage pet health and medical records</p>
						</div>
					</div>
					<button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90"
						style={{ background: "linear-gradient(135deg, #7AADA1, #216959)" }}>
						<Plus className="size-4" /> Add Record
					</button>
				</div>

				<div className="flex gap-3 mb-5">
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4" style={{ color: "#ccc" }} />
						<input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by pet, title or vet..."
							className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
							style={{ background: "#fff", border: "1px solid #E8E8E8", color: "#333" }} />
					</div>
					<select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
						className="px-4 py-2.5 rounded-xl text-sm outline-none"
						style={{ background: "#fff", border: "1px solid #E8E8E8", color: "#555" }}>
						<option value="all">All Types</option>
						{Object.entries(typeConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
					</select>
				</div>

				<div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1px solid #F0F0F0" }}>
					<table className="w-full">
						<thead style={{ background: "#FAFAFA" }}>
							<tr>
								{["Pet", "Record", "Type", "Veterinarian", "Date", "Next Due", ""].map((h) => (
									<th key={h} className="text-left px-5 py-3.5" style={{ fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</th>
								))}
							</tr>
						</thead>
						<tbody>
							{filtered.map((row) => {
								const tc = typeConfig[row.type];
								return (
									<tr key={row.id} style={{ borderTop: "1px solid #F5F5F5" }}>
										<td className="px-5 py-4">
											<div className="flex items-center gap-2">
												<div className="size-8 rounded-lg flex items-center justify-center" style={{ background: "#F9F6F2" }}>
													<PawPrint className="size-4" style={{ color: "#C4857A" }} />
												</div>
												<span style={{ fontSize: "13px", fontWeight: 500, color: "#1C1C1C" }}>{row.petName}</span>
											</div>
										</td>
										<td className="px-5 py-4">
											<p style={{ fontSize: "13px", fontWeight: 500, color: "#1C1C1C" }}>{row.title}</p>
											<p style={{ fontSize: "11px", color: "#aaa" }}>{row.description}</p>
										</td>
										<td className="px-5 py-4">
											<span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: tc.bg, color: tc.color }}>{tc.label}</span>
										</td>
										<td className="px-5 py-4" style={{ fontSize: "13px", color: "#666" }}>{row.veterinarian}</td>
										<td className="px-5 py-4" style={{ fontSize: "12px", color: "#aaa" }}>{row.date}</td>
										<td className="px-5 py-4" style={{ fontSize: "12px", color: row.nextDueDate ? "#C4857A" : "#ccc" }}>{row.nextDueDate || "—"}</td>
										<td className="px-5 py-4">
											<div className="flex items-center gap-2">
												<button onClick={() => openEdit(row)} className="size-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors">
													<Edit2 className="size-3.5" style={{ color: "#888" }} />
												</button>
												<button onClick={() => del(row.id)} className="size-8 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors">
													<Trash2 className="size-3.5" style={{ color: "#C4857A" }} />
												</button>
											</div>
										</td>
									</tr>
								);
							})}
							{filtered.length === 0 && (
								<tr><td colSpan={7} className="px-5 py-10 text-center" style={{ color: "#aaa", fontSize: "13px" }}>No health records found.</td></tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Add/Edit Modal */}
			{showModal && (
				<div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.4)" }} onClick={() => setShowModal(false)}>
					<div className="w-[540px] max-h-[85vh] overflow-y-auto rounded-2xl p-6" style={{ background: "#fff" }} onClick={(e) => e.stopPropagation()}>
						<div className="flex items-center justify-between mb-5">
							<h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "18px", fontWeight: 700, color: "#1C1C1C" }}>{editRecord ? "Edit Record" : "Add Health Record"}</h3>
							<button onClick={() => setShowModal(false)} className="size-8 rounded-lg flex items-center justify-center hover:bg-gray-100">
								<X className="size-4" style={{ color: "#888" }} />
							</button>
						</div>

						<div className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-xs font-semibold mb-1.5" style={{ color: "#666" }}>Pet Name</label>
									<input value={form.petName} onChange={(e) => setForm({ ...form, petName: e.target.value })} placeholder="e.g. Mochi"
										className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ border: "1px solid #E8E8E8" }} />
								</div>
								<div>
									<label className="block text-xs font-semibold mb-1.5" style={{ color: "#666" }}>Record Type</label>
									<select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as HealthRecord["type"] })}
										className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ border: "1px solid #E8E8E8" }}>
										{Object.entries(typeConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
									</select>
								</div>
							</div>
							<div>
								<label className="block text-xs font-semibold mb-1.5" style={{ color: "#666" }}>Title</label>
								<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Annual Rabies Vaccine"
									className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ border: "1px solid #E8E8E8" }} />
							</div>
							<div>
								<label className="block text-xs font-semibold mb-1.5" style={{ color: "#666" }}>Description</label>
								<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Notes or details..."
									className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none" style={{ border: "1px solid #E8E8E8" }} />
							</div>
							<div>
								<label className="block text-xs font-semibold mb-1.5" style={{ color: "#666" }}>Veterinarian</label>
								<input value={form.veterinarian} onChange={(e) => setForm({ ...form, veterinarian: e.target.value })} placeholder="e.g. Dr. Sarah Lee"
									className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ border: "1px solid #E8E8E8" }} />
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-xs font-semibold mb-1.5" style={{ color: "#666" }}>Date</label>
									<input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
										className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ border: "1px solid #E8E8E8" }} />
								</div>
								<div>
									<label className="block text-xs font-semibold mb-1.5" style={{ color: "#666" }}>Next Due Date</label>
									<input type="date" value={form.nextDueDate} onChange={(e) => setForm({ ...form, nextDueDate: e.target.value })}
										className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ border: "1px solid #E8E8E8" }} />
								</div>
							</div>
						</div>

						<div className="flex gap-3 mt-6">
							<button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ background: "#F4F4F4", color: "#888" }}>Cancel</button>
							<button onClick={save} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90"
								style={{ background: "linear-gradient(135deg, #7AADA1, #216959)" }}>
								{editRecord ? "Save Changes" : "Add Record"}
							</button>
						</div>
					</div>
				</div>
			)}
		</AdminLayout>
	);
}
