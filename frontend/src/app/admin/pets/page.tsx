"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "../_components/AdminLayout";
import Image from "next/image";
import { Plus, Upload, Search, MoreVertical, X, FileEdit, MapPin, Trash2 } from "lucide-react";
import { usePets } from "@/hooks/usePets";
import type { Pet } from "@/types";

const statusColor: Record<Pet["status"], string> = {
	available: "bg-white text-success",
	pending: "bg-white text-warning",
	adopted: "bg-white text-muted-foreground",
};

function TogglePill({
	label,
	active,
	onToggle,
}: {
	label: "Vaccinated" | "Neutered";
	active: boolean;
	onToggle: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onToggle}
			className={`h-11 rounded-2xl border text-sm font-semibold flex items-center justify-between px-4 ${
				active
					? "bg-primary-soft border-primary text-primary-deep"
					: "bg-card border-input text-muted-foreground"
			}`}
		>
			<span>{active ? label : `Not ${label}`}</span>
		</button>
	);
}

const defaultForm = {
	name: "",
	breed: "",
	ageMonths: 0,
	gender: "male" as "male" | "female",
	description: "",
	image: null as File | null,
	imagePreview: null as string | null,
	status: "available" as "available" | "pending" | "adopted",
	species: "",
	isVaccinated: false,
	isNeutered: false,
	location: "",
};

export default function PetsPage() {
	const { pets, loading, createPet, updatePet, deletePet, uploadThumbnail } = usePets();
	const router = useRouter();
	const [showUpload, setShowUpload] = useState(false);
	const [search, setSearch] = useState("");
	const [status, setStatus] = useState<string>("All");
	const [form, setForm] = useState(defaultForm);
	const [editId, setEditId] = useState<string | null>(null);
	const [saving, setSaving] = useState(false);
	const [activeDropdown, setActiveDropdown] = useState<{
		petId: string;
		top: number;
		right: number;
	} | null>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [deleteTarget, setDeleteTarget] = useState<Pet | null>(null);
	const [deleteLoading, setDeleteLoading] = useState(false);

	const filtered = (pets || []).filter((p) => {
		const matchSearch =
			p.name.toLowerCase().includes(search.toLowerCase()) ||
			p.breed.toLowerCase().includes(search.toLowerCase()) ||
			p.species.toLowerCase().includes(search.toLowerCase());
		const matchStatus = status === "All" || p.status?.toLowerCase() === status.toLowerCase();

		return matchSearch && matchStatus;
	});

	const handleSave = async () => {
		setSaving(true);

		try {
			let thumbnailUrl: string | undefined;

			if (form.image && editId) {
				const url = await uploadThumbnail(editId, form.image);
				if (url) {
					thumbnailUrl = url;
				}
			}

			//const ageInYears = Math.floor(form.ageMonths / 12);

			const baseData = {
				name: form.name,
				species: form.species,
				breed: form.breed,
				ageMonths: form.ageMonths,
				gender: form.gender,
				description: form.description,
				...(thumbnailUrl && { thumbnail: thumbnailUrl }),
				status: form.status,
				isVaccinated: form.isVaccinated,
				isNeutered: form.isNeutered,
				location: form.location,
				createdAt: new Date(),
				updatedAt: new Date(),
			} as Omit<Pet, "id">;

			if (editId) {
				const result = await updatePet(editId, baseData);

				alert(result ? "Pet updated successfully!" : "Failed to update pet.");
				setEditId(null);
			} else {
				const newPet = await createPet(baseData);
				if (newPet && form.image) {
					const url = await uploadThumbnail(newPet.id!, form.image);
					if (url) {
						await updatePet(newPet.id!, { thumbnail: url });
					}
				}
				alert(newPet ? "Pet created successfully!" : "Failed to create pet.");
			}

			setForm(defaultForm);
			setShowUpload(false);
			window.dispatchEvent(new Event("notification-refresh"));
		} catch {
			alert("An error occurred while saving.");
		} finally {
			setSaving(false);
		}
	};

	const handleToggleDropdown = (petId: string, e: React.MouseEvent) => {
		e.stopPropagation();
		if (activeDropdown?.petId === petId) {
			setActiveDropdown(null);
			return;
		}
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		setActiveDropdown({
			petId,
			top: rect.bottom + 4,
			right: window.innerWidth - rect.right,
		});
	};

	const handleDeleteClick = (pet: Pet) => {
		setActiveDropdown(null);
		setDeleteTarget(pet);
		setShowDeleteModal(true);
	};

	const handleConfirmDelete = async () => {
		if (!deleteTarget?.id) return;
		setDeleteLoading(true);
		await deletePet(deleteTarget.id);
		setDeleteLoading(false);
		setShowDeleteModal(false);
		setDeleteTarget(null);
	};

	const handleCloseDeleteModal = () => {
		setShowDeleteModal(false);
		setDeleteTarget(null);
	};

	const handleEdit = (pet: Pet) => {
		setForm({
			name: pet.name,
			breed: pet.breed,
			ageMonths: pet.ageMonths ?? (pet.age ?? 0) * 12,
			gender: pet.gender,
			species: pet.species,
			description: pet.description || "",
			image: null,
			imagePreview: pet.thumbnail || null,
			status: pet.status,
			isVaccinated: pet.isVaccinated || false,
			isNeutered: pet.isNeutered || false,
			location: pet.location || "",
		});

		setEditId(pet.id!);
		setShowUpload(true);
	};

	useEffect(() => {
		if (!activeDropdown) return;
		const handleClickOutside = () => setActiveDropdown(null);
		document.addEventListener("click", handleClickOutside);
		return () => document.removeEventListener("click", handleClickOutside);
	}, [activeDropdown]);

	const handleClose = () => {
		setShowUpload(false);
		setEditId(null);
		setForm(defaultForm);
	};

	return (
		<AdminLayout title="Pets" subtitle="Manage every pet currently under Snuggle's care.">
			<div className="p-8">
				{/* Toolbar */}
				<div className="flex flex-col sm:flex-row gap-3 mb-6">
					<div className="relative flex-1">
						<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
						<input
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Search by name or breed..."
							className="w-full pl-10 h-11 rounded-full bg-card border border-border shadow-card text-sm px-4 outline-none focus:ring-2 focus:ring-ring"
						/>
					</div>
					<div className="flex gap-2 flex-wrap">
						{["All", "Available", "Pending", "Adopted"].map((s) => (
							<button
								key={s}
								onClick={() => setStatus(s)}
								className={`px-4 h-11 rounded-full text-xs font-semibold transition-colors ${
									status === s
										? "bg-primary text-primary-foreground shadow-glow"
										: "bg-card border border-border text-muted-foreground hover:text-foreground"
								}`}
							>
								{s}
							</button>
						))}
					</div>
					<button
						onClick={() => setShowUpload(true)}
						className="h-11 px-5 rounded-full bg-gradient-primary text-primary-foreground font-semibold text-sm shadow-glow flex items-center gap-2 whitespace-nowrap"
					>
						<Plus className="size-4" /> Add Pet
					</button>
				</div>

				{/* Grid */}
				{loading ? (
					<p className="text-sm text-muted-foreground">Loading pets...</p>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
						{filtered.map((pet) => (
							<article
								key={pet.id}
								className="bg-card border border-border rounded-3xl overflow-hidden shadow-card hover:shadow-soft hover:-translate-y-1 transition-all group"
							>
								<div className="relative aspect-[4/3] overflow-hidden bg-muted">
									<Image
										src={
											pet.thumbnail ||
											pet.photoUrls?.[0] ||
											"/images/placeholder.png"
										}
										alt={pet.name}
										fill
										className="object-cover"
										loading="lazy"
									/>
									<span
										className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md ${statusColor[pet.status]}`}
									>
										{pet.status.charAt(0).toUpperCase() + pet.status.slice(1)}
									</span>
									<button
										onClick={(e) => pet.id && handleToggleDropdown(pet.id, e)}
										className="absolute top-3 right-3 size-8 rounded-full bg-card/80 backdrop-blur-md flex items-center justify-center hover:bg-card"
									>
										<MoreVertical className="size-4" />
									</button>
								</div>
								<div className="p-5">
									<div className="flex items-start justify-between mb-1">
										<h3 className="font-display text-lg font-semibold">
											{pet.name}
										</h3>
										<span className="text-[10px] text-muted-foreground font-mono">
											{pet.id}
										</span>
									</div>
									<p className="text-xs text-muted-foreground">
										{pet.breed} ·{" "}
										{pet.ageMonths != null
											? pet.ageMonths < 12
												? `${pet.ageMonths}mo`
												: `${(pet.ageMonths / 12).toFixed(1)}y`
											: `${pet.age ?? "?"}y`}{" "}
										· {pet.gender}
									</p>
									<p className="text-xs text-foreground/70 mt-3 line-clamp-2 leading-relaxed">
										{pet.description}
									</p>
									<div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
										<span className="flex items-center gap-1 text-[11px] text-muted-foreground">
											<MapPin className="size-3 shrink-0" />
											{pet.location || "No location"}
										</span>
										<button
											onClick={() => handleEdit(pet)}
											className="text-xs font-semibold text-primary-deep hover:underline"
										>
											Edit →
										</button>
									</div>
								</div>
							</article>
						))}
					</div>
				)}

				{activeDropdown &&
					(() => {
						const pet = filtered.find((p) => p.id === activeDropdown.petId);
						if (!pet) return null;
						return (
							<div
								ref={dropdownRef}
								style={{
									position: "fixed",
									top: activeDropdown.top,
									right: activeDropdown.right,
									zIndex: 50,
								}}
								className="w-48 bg-card border border-border rounded-xl shadow-lg py-1"
								onClick={(e) => e.stopPropagation()}
							>
								<button
									onClick={() => handleDeleteClick(pet)}
									className="w-full px-3 py-2 text-left text-sm hover:bg-secondary flex items-center gap-2 text-destructive"
								>
									<Trash2 className="size-4" />
									<span>Delete</span>
								</button>
							</div>
						);
					})()}

				{/* Add / Edit Pet Modal */}
				{showUpload && (
					<div
						className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4"
						onClick={handleClose}
					>
						<div
							onClick={(e) => e.stopPropagation()}
							className="w-full max-w-lg bg-card rounded-3xl shadow-soft p-7"
						>
							<div className="flex items-center justify-between mb-6">
								<h2 className="font-display text-2xl font-semibold">
									{editId ? "Edit pet" : "Add a new pet"}
								</h2>
								<button
									onClick={handleClose}
									className="size-9 rounded-full hover:bg-secondary flex items-center justify-center"
								>
									<X className="size-4" />
								</button>
							</div>
							<div className="space-y-4">
								<label className="block border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-primary cursor-pointer transition-colors overflow-hidden">
									{form.imagePreview || (editId && form.image) ? (
										<div className="relative size-32 mx-auto">
											<Image
												src={
													form.imagePreview ||
													(editId ? "/images/placeholder.png" : "")
												}
												alt="Preview"
												fill
												className="object-cover rounded-xl"
											/>
											<p className="text-xs text-muted-foreground mt-2">
												Click to change image
											</p>
										</div>
									) : (
										<>
											<Upload className="size-8 mx-auto text-muted-foreground mb-2" />
											<p className="text-sm font-medium">
												Drop a photo or click to upload
											</p>
											<p className="text-xs text-muted-foreground mt-1">
												PNG or JPG, up to 5MB
											</p>
										</>
									)}
									<input
										type="file"
										className="hidden"
										accept="image/jpeg,image/jpg,image/png,image/webp"
										onChange={(e) => {
											const file = e.target.files?.[0];
											if (file) {
												const preview = URL.createObjectURL(file);
												setForm({
													...form,
													image: file,
													imagePreview: preview,
												});
											}
										}}
									/>
								</label>
								<div className="grid grid-cols-2 gap-3">
									<label className="flex flex-col gap-1">
										<span className="text-sm font-medium">Name</span>
										<input
											value={form.name}
											onChange={(e) =>
												setForm({ ...form, name: e.target.value })
											}
											className="h-11 rounded-2xl border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
										/>
									</label>
									<label className="flex flex-col gap-1">
										<span className="text-sm font-medium">Species</span>
										<select
											value={form.species}
											onChange={(e) =>
												setForm({
													...form,
													species: e.target.value as
														| "cat"
														| "dog"
														| "other",
												})
											}
											className="h-11 rounded-2xl border border-input bg-card px-3 text-sm"
										>
											<option value="cat">Cat</option>
											<option value="dog">Dog</option>
											<option value="other">Other</option>
										</select>
									</label>
									<label className="flex flex-col gap-1">
										<span className="text-sm font-medium">Breed</span>
										<input
											value={form.breed}
											onChange={(e) =>
												setForm({ ...form, breed: e.target.value })
											}
											className="h-11 rounded-2xl border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
										/>
									</label>
									<label className="flex flex-col gap-1">
										<span className="text-sm font-medium">Age (months)</span>
										<input
											value={form.ageMonths || ""}
											onChange={(e) =>
												setForm({
													...form,
													ageMonths: parseInt(e.target.value) || 0,
												})
											}
											type="number"
											className="h-11 rounded-2xl border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
										/>
									</label>
									<label className="flex flex-col gap-1">
										<span className="text-sm font-medium">Gender</span>
										<select
											value={form.gender}
											onChange={(e) =>
												setForm({
													...form,
													gender: e.target.value as "male" | "female",
												})
											}
											className="h-11 rounded-2xl border border-input bg-card px-3 text-sm"
										>
											<option value="male">Male</option>
											<option value="female">Female</option>
										</select>
									</label>
									<label className="flex flex-col gap-1">
										<span className="text-sm font-medium">Status</span>
										<select
											value={form.status}
											onChange={(e) =>
												setForm({
													...form,
													status: e.target.value as
														| "available"
														| "pending"
														| "adopted",
												})
											}
											className="h-11 rounded-2xl border border-input bg-card px-3 text-sm"
										>
											<option value="available">Available</option>
											<option value="pending">Pending</option>
											<option value="adopted">Adopted</option>
										</select>
									</label>
								</div>
								<label className="flex flex-col gap-1">
									<span className="text-sm font-medium">Location</span>
									<div className="relative">
										<MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
										<input
											value={form.location}
											onChange={(e) =>
												setForm({ ...form, location: e.target.value })
											}
											className="w-full h-11 rounded-2xl border border-input bg-card pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
										/>
									</div>
								</label>
								<label className="flex flex-col gap-1">
									<span className="text-sm font-medium">Description</span>
									<textarea
										value={form.description}
										onChange={(e) =>
											setForm({ ...form, description: e.target.value })
										}
										rows={3}
										className="w-full rounded-2xl border border-input bg-card p-3 text-sm resize-none outline-none focus:ring-2 focus:ring-ring"
									/>
								</label>
								<div className="grid grid-cols-2 gap-3">
									<TogglePill
										label="Vaccinated"
										active={form.isVaccinated}
										onToggle={() =>
											setForm({ ...form, isVaccinated: !form.isVaccinated })
										}
									/>
									<TogglePill
										label="Neutered"
										active={form.isNeutered}
										onToggle={() =>
											setForm({ ...form, isNeutered: !form.isNeutered })
										}
									/>
								</div>
								{editId && (
									<button
										onClick={() => {
											handleClose();
											router.push(`/admin/pets/${editId}`);
										}}
										className="w-full h-11 rounded-full border-2 border-primary text-primary-deep font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary-soft transition-colors"
									>
										<FileEdit className="size-4" />
										Edit Detail Page
									</button>
								)}
								<div className="flex gap-3 pt-2">
									<button
										onClick={handleClose}
										className="flex-1 h-11 rounded-full bg-secondary font-semibold text-sm"
									>
										Cancel
									</button>
									<button
										onClick={handleSave}
										disabled={saving}
										className="flex-1 h-11 rounded-full bg-gradient-primary text-primary-foreground font-semibold text-sm shadow-glow disabled:opacity-50"
									>
										{saving ? "Saving..." : editId ? "Update Pet" : "Save Pet"}
									</button>
								</div>
							</div>
						</div>
					</div>
				)}
				{showDeleteModal && deleteTarget && (
					<div
						className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4"
						onClick={handleCloseDeleteModal}
					>
						<div
							onClick={(e) => e.stopPropagation()}
							className="w-full max-w-md bg-card rounded-3xl shadow-soft p-7"
						>
							<div className="flex items-center gap-4 mb-6">
								<div className="size-12 rounded-full bg-destructive/10 flex items-center justify-center">
									<Trash2 className="size-6 text-destructive" />
								</div>
								<div>
									<h2 className="font-display text-xl font-semibold">
										Delete Pet
									</h2>
									<p className="text-sm text-muted-foreground">
										This action cannot be undone.
									</p>
								</div>
							</div>
							<div className="bg-secondary/40 rounded-2xl p-4 mb-6">
								<p className="text-sm">
									Are you sure you want to delete{" "}
									<strong className="font-semibold">{deleteTarget.name}</strong>?
									All associated data will be permanently removed.
								</p>
							</div>
							<div className="flex gap-3">
								<button
									onClick={handleCloseDeleteModal}
									className="flex-1 h-11 rounded-2xl border border-border text-sm font-medium hover:bg-secondary"
								>
									Cancel
								</button>
								<button
									onClick={handleConfirmDelete}
									disabled={deleteLoading}
									className="flex-1 h-11 rounded-2xl bg-destructive text-destructive-foreground text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
								>
									{deleteLoading ? "Deleting..." : "Delete Pet"}
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</AdminLayout>
	);
}
