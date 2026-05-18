"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "../_components/AdminLayout";
import { HeartPulse, Plus, Search, Edit2, Trash2, X, PawPrint, Loader2 } from "lucide-react";
import { healthRecordsApi, petsApi, HealthRecordWithPet } from "@/lib/api";

interface Pet {
	id: string;
	name: string;
	species: string;
}

interface FormData {
	petId: string;
	type: "vaccine" | "checkup" | "treatment";
	title: string;
	description: string;
	vetName: string;
	recordDate: string;
}

const typeConfig: Record<string, { label: string; color: string; bg: string }> = {
	vaccine: { label: "Vaccination", color: "#216959", bg: "#E8F4F1" },
	checkup: { label: "Checkup", color: "#7AADA1", bg: "#F0F8F6" },
	treatment: { label: "Treatment", color: "#C4857A", bg: "#FAF0EE" },
};

const emptyForm: FormData = {
	petId: "",
	type: "checkup",
	title: "",
	description: "",
	vetName: "",
	recordDate: "",
};

export default function HealthRecordsPage() {
	const [records, setRecords] = useState<HealthRecordWithPet[]>([]);
	const [pets, setPets] = useState<Pet[]>([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [search, setSearch] = useState("");
	const [typeFilter, setTypeFilter] = useState("all");
	const [showModal, setShowModal] = useState(false);
	const [editRecord, setEditRecord] = useState<HealthRecordWithPet | null>(null);
	const [form, setForm] = useState<FormData>(emptyForm);

	useEffect(() => {
		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	async function fetchData() {
		try {
			const [recordsRes, petsRes] = await Promise.all([
				healthRecordsApi.getAll(typeFilter === "all" ? undefined : typeFilter),
				petsApi.getAll(),
			]);
			setRecords(recordsRes.data.data);
			setPets(petsRes.data.data);
		} catch (error) {
			console.error("Failed to fetch data:", error);
		} finally {
			setLoading(false);
		}
	}

	function formatDate(date: Date | string): string {
		const d = new Date(date);
		return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
	}

	const filtered = records.filter((r) => {
		const matchSearch =
			r.petName.toLowerCase().includes(search.toLowerCase()) ||
			(r.title?.toLowerCase() || "").includes(search.toLowerCase()) ||
			(r.vetName?.toLowerCase() || "").includes(search.toLowerCase());
		const matchType = typeFilter === "all" || r.type === typeFilter;
		return matchSearch && matchType;
	});

	function openAdd() {
		setEditRecord(null);
		setForm(emptyForm);
		setShowModal(true);
	}

	function openEdit(r: HealthRecordWithPet) {
		setEditRecord(r);
		setForm({
			petId: r.petId,
			type: r.type,
			title: r.title || "",
			description: r.description || "",
			vetName: r.vetName || "",
			recordDate: r.recordDate ? new Date(r.recordDate).toISOString().split("T")[0] : "",
		});
		setShowModal(true);
	}

	async function save() {
		setSaving(true);
		try {
			if (editRecord) {
				console.log("Edit not supported via this API yet");
			} else {
				const res = await healthRecordsApi.create({
					petId: form.petId,
					type: form.type,
					title: form.title || undefined,
					description: form.description || undefined,
					vetName: form.vetName || undefined,
					recordDate: form.recordDate || undefined,
				});
				const newRecord = res.data.data;
				const pet = pets.find((p) => p.id === form.petId);
				setRecords((prev) => [
					{
						...newRecord,
						petName: pet?.name || "Unknown",
						petSpecies: pet?.species || "unknown",
					},
					...prev,
				]);
			}
			setShowModal(false);
		} catch (error) {
			console.error("Failed to save:", error);
		} finally {
			setSaving(false);
		}
	}

	async function del(petId: string, recordId: string) {
		if (!confirm("Are you sure you want to delete this record?")) return;
		try {
			await healthRecordsApi.delete(petId, recordId);
			setRecords((prev) => prev.filter((r) => r.id !== recordId));
		} catch (error) {
			console.error("Failed to delete:", error);
		}
	}

	if (loading) {
		return (
			<AdminLayout>
				<div className="flex items-center justify-center h-64">
					<Loader2 className="size-8 animate-spin" style={{ color: "#7AADA1" }} />
				</div>
			</AdminLayout>
		);
	}

	return (
		<AdminLayout>
			<div className="p-4 sm:p-6 lg:p-8">
				<div className="flex items-center justify-between mb-8">
					<div className="flex items-center gap-3">
						<div
							className="size-10 rounded-xl flex items-center justify-center"
							style={{ background: "#E8F4F1" }}
						>
							<HeartPulse className="size-5" style={{ color: "#7AADA1" }} />
						</div>
						<div>
							<h1
								style={{
									fontFamily: "'Space Grotesk', sans-serif",
									fontSize: "24px",
									fontWeight: 700,
									color: "#1C1C1C",
								}}
							>
								Health Records
							</h1>
							<p style={{ color: "#888", fontSize: "13px" }}>
								Manage pet health and medical records
							</p>
						</div>
					</div>
					<button
						onClick={openAdd}
						className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90"
						style={{ background: "linear-gradient(135deg, #7AADA1, #216959)" }}
					>
						<Plus className="size-4" /> Add Record
					</button>
				</div>

				<div className="flex gap-3 mb-5">
					<div className="relative flex-1">
						<Search
							className="absolute left-3 top-1/2 -translate-y-1/2 size-4"
							style={{ color: "#ccc" }}
						/>
						<input
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Search by pet, title or vet..."
							className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
							style={{
								background: "#fff",
								border: "1px solid #E8E8E8",
								color: "#333",
							}}
						/>
					</div>
					<select
						value={typeFilter}
						onChange={(e) => setTypeFilter(e.target.value)}
						className="px-4 py-2.5 rounded-xl text-sm outline-none"
						style={{ background: "#fff", border: "1px solid #E8E8E8", color: "#555" }}
					>
						<option value="all">All Types</option>
						{Object.entries(typeConfig).map(([k, v]) => (
							<option key={k} value={k}>
								{v.label}
							</option>
						))}
					</select>
				</div>

				<div
					className="rounded-2xl overflow-hidden"
					style={{ background: "#fff", border: "1px solid #F0F0F0" }}
				>
				<div className="overflow-x-auto">
					<table className="w-full min-w-[640px]">
						<thead style={{ background: "#FAFAFA" }}>
							<tr>
								{["Pet", "Record", "Type", "Veterinarian", "Date", ""].map((h) => (
									<th
										key={h}
										className="text-left px-5 py-3.5"
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
							{filtered.map((row) => {
								const tc = typeConfig[row.type] || typeConfig.checkup;
								return (
									<tr key={row.id} style={{ borderTop: "1px solid #F5F5F5" }}>
										<td className="px-5 py-4">
											<div className="flex items-center gap-2">
												<div
													className="size-8 rounded-lg flex items-center justify-center"
													style={{ background: "#F9F6F2" }}
												>
													<PawPrint
														className="size-4"
														style={{ color: "#C4857A" }}
													/>
												</div>
												<span
													style={{
														fontSize: "13px",
														fontWeight: 500,
														color: "#1C1C1C",
													}}
												>
													{row.petName}
												</span>
											</div>
										</td>
										<td className="px-5 py-4">
											<p
												style={{
													fontSize: "13px",
													fontWeight: 500,
													color: "#1C1C1C",
												}}
											>
												{row.title || row.description || "Health Record"}
											</p>
											{row.description && (
												<p style={{ fontSize: "11px", color: "#aaa" }}>
													{row.description.length > 50
														? row.description.slice(0, 50) + "..."
														: row.description}
												</p>
											)}
										</td>
										<td className="px-5 py-4">
											<span
												className="px-2.5 py-1 rounded-full text-xs font-semibold"
												style={{ background: tc.bg, color: tc.color }}
											>
												{tc.label}
											</span>
										</td>
										<td
											className="px-5 py-4"
											style={{ fontSize: "13px", color: "#666" }}
										>
											{row.vetName || "—"}
										</td>
										<td
											className="px-5 py-4"
											style={{ fontSize: "12px", color: "#aaa" }}
										>
											{formatDate(row.recordDate)}
										</td>
										<td className="px-5 py-4">
											<div className="flex items-center gap-2">
												<button
													onClick={() => openEdit(row)}
													className="size-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
												>
													<Edit2
														className="size-3.5"
														style={{ color: "#888" }}
													/>
												</button>
												<button
													onClick={() => del(row.petId, row.id)}
													className="size-8 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors"
												>
													<Trash2
														className="size-3.5"
														style={{ color: "#C4857A" }}
													/>
												</button>
											</div>
										</td>
									</tr>
								);
							})}
							{filtered.length === 0 && (
								<tr>
									<td
										colSpan={6}
										className="px-5 py-10 text-center"
										style={{ color: "#aaa", fontSize: "13px" }}
									>
										No health records found.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
				</div>
			</div>

			{showModal && (
				<div
					className="fixed inset-0 flex items-center justify-center z-50"
					style={{ background: "rgba(0,0,0,0.4)" }}
					onClick={() => setShowModal(false)}
				>
					<div
						className="w-full max-w-[540px] mx-4 max-h-[85vh] overflow-y-auto rounded-2xl p-6"
						style={{ background: "#fff" }}
						onClick={(e) => e.stopPropagation()}
					>
						<div className="flex items-center justify-between mb-5">
							<h3
								style={{
									fontFamily: "'Space Grotesk', sans-serif",
									fontSize: "18px",
									fontWeight: 700,
									color: "#1C1C1C",
								}}
							>
								Add Health Record
							</h3>
							<button
								onClick={() => setShowModal(false)}
								className="size-8 rounded-lg flex items-center justify-center hover:bg-gray-100"
							>
								<X className="size-4" style={{ color: "#888" }} />
							</button>
						</div>

						<div className="space-y-4">
							<div>
								<label
									className="block text-xs font-semibold mb-1.5"
									style={{ color: "#666" }}
								>
									Pet
								</label>
								<select
									value={form.petId}
									onChange={(e) => setForm({ ...form, petId: e.target.value })}
									className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
									style={{ border: "1px solid #E8E8E8" }}
								>
									<option value="">Select a pet...</option>
									{pets.map((pet) => (
										<option key={pet.id} value={pet.id}>
											{pet.name} ({pet.species})
										</option>
									))}
								</select>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label
										className="block text-xs font-semibold mb-1.5"
										style={{ color: "#666" }}
									>
										Record Type
									</label>
									<select
										value={form.type}
										onChange={(e) =>
											setForm({
												...form,
												type: e.target.value as FormData["type"],
											})
										}
										className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
										style={{ border: "1px solid #E8E8E8" }}
									>
										{Object.entries(typeConfig).map(([k, v]) => (
											<option key={k} value={k}>
												{v.label}
											</option>
										))}
									</select>
								</div>
								<div>
									<label
										className="block text-xs font-semibold mb-1.5"
										style={{ color: "#666" }}
									>
										Date
									</label>
									<input
										type="date"
										value={form.recordDate}
										onChange={(e) =>
											setForm({ ...form, recordDate: e.target.value })
										}
										className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
										style={{ border: "1px solid #E8E8E8" }}
									/>
								</div>
							</div>
							<div>
								<label
									className="block text-xs font-semibold mb-1.5"
									style={{ color: "#666" }}
								>
									Title
								</label>
								<input
									value={form.title}
									onChange={(e) => setForm({ ...form, title: e.target.value })}
									placeholder="e.g. Annual Rabies Vaccine"
									className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
									style={{ border: "1px solid #E8E8E8" }}
								/>
							</div>
							<div>
								<label
									className="block text-xs font-semibold mb-1.5"
									style={{ color: "#666" }}
								>
									Description
								</label>
								<textarea
									value={form.description}
									onChange={(e) =>
										setForm({ ...form, description: e.target.value })
									}
									rows={3}
									placeholder="Notes or details..."
									className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
									style={{ border: "1px solid #E8E8E8" }}
								/>
							</div>
							<div>
								<label
									className="block text-xs font-semibold mb-1.5"
									style={{ color: "#666" }}
								>
									Veterinarian
								</label>
								<input
									value={form.vetName}
									onChange={(e) => setForm({ ...form, vetName: e.target.value })}
									placeholder="e.g. Dr. Sarah Lee"
									className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
									style={{ border: "1px solid #E8E8E8" }}
								/>
							</div>
						</div>

						<div className="flex gap-3 mt-6">
							<button
								onClick={() => setShowModal(false)}
								className="flex-1 py-2.5 rounded-xl text-sm font-medium"
								style={{ background: "#F4F4F4", color: "#888" }}
							>
								Cancel
							</button>
							<button
								onClick={save}
								disabled={!form.petId || saving}
								className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
								style={{ background: "linear-gradient(135deg, #7AADA1, #216959)" }}
							>
								{saving ? (
									<Loader2 className="size-4 animate-spin mx-auto" />
								) : (
									"Add Record"
								)}
							</button>
						</div>
					</div>
				</div>
			)}
		</AdminLayout>
	);
}
