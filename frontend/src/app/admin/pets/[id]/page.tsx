"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, ImagePlus, X, Save, Loader2 } from "lucide-react";
import { AdminLayout } from "../../_components/AdminLayout";
import { usePets } from "@/hooks/usePets";
import type { Pet } from "@/types";

export default function PetDetailEditPage() {
	const { id } = useParams<{ id: string }>();
	const router = useRouter();
	const { getPetById, updatePet, uploadPhoto } = usePets();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [pet, setPet] = useState<Pet | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [uploadingPhoto, setUploadingPhoto] = useState(false);
	const [saved, setSaved] = useState(false);

	const [description, setDescription] = useState("");
	const [arrivalDate, setArrivalDate] = useState("");
	const [photoUrls, setPhotoUrls] = useState<string[]>([]);

	useEffect(() => {
		getPetById(id).then((data) => {
			if (data) {
				setPet(data);
				setDescription(data.description || "");
				setArrivalDate(data.arrivalDate || "");
				setPhotoUrls(data.photoUrls || []);
			}
			setLoading(false);
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);

	const handleAddPhoto = async (file: File) => {
		setUploadingPhoto(true);
		const url = await uploadPhoto(id, file);
		if (url) {
			const newUrls = [...photoUrls, url];
			setPhotoUrls(newUrls);
			await updatePet(id, { photoUrls: newUrls });
		}
		setUploadingPhoto(false);
	};

	const handleRemovePhoto = async (index: number) => {
		const newUrls = photoUrls.filter((_, i) => i !== index);
		setPhotoUrls(newUrls);
		await updatePet(id, { photoUrls: newUrls });
	};

	const handleSave = async () => {
		setSaving(true);
		await updatePet(id, { description, arrivalDate, photoUrls });
		setSaving(false);
		setSaved(true);
		setTimeout(() => setSaved(false), 2500);
	};

	if (loading) {
		return (
			<AdminLayout>
				<div className="flex items-center justify-center h-full">
					<Loader2 className="size-6 animate-spin text-muted-foreground" />
				</div>
			</AdminLayout>
		);
	}

	if (!pet) {
		return (
			<AdminLayout>
				<div className="flex flex-col items-center justify-center h-full gap-3">
					<p className="text-muted-foreground">Pet not found.</p>
					<button
						onClick={() => router.push("/admin/pets")}
						className="text-sm font-semibold text-primary-deep hover:underline"
					>
						← Back to Pets
					</button>
				</div>
			</AdminLayout>
		);
	}

	const displayAge = pet.ageMonths
		? pet.ageMonths < 12
			? `${pet.ageMonths} month${pet.ageMonths === 1 ? "" : "s"}`
			: `${(pet.ageMonths / 12).toFixed(1)} years`
		: pet.age
			? `${pet.age} year${pet.age === 1 ? "" : "s"}`
			: "";

	return (
		<AdminLayout>
			<div className="max-w-4xl mx-auto px-6 py-8">
				{/* Header */}
				<div className="flex items-center gap-4 mb-8">
					<button
						onClick={() => router.push("/admin/pets")}
						className="size-9 rounded-full bg-card border border-border flex items-center justify-center hover:bg-secondary transition-colors"
					>
						<ChevronLeft className="size-4" />
					</button>
					<div>
						<p className="text-xs text-muted-foreground font-medium">
							Editing detail page for
						</p>
						<h1
							className="font-display text-2xl font-semibold"
							style={{ color: "#1C1C1C" }}
						>
							{pet.name}
						</h1>
					</div>
					<div className="ml-auto flex items-center gap-3">
						{saved && (
							<span className="text-sm text-success font-medium animate-fade-in">
								Saved!
							</span>
						)}
						<button
							onClick={handleSave}
							disabled={saving}
							className="h-10 px-5 rounded-full bg-gradient-primary text-primary-foreground font-semibold text-sm shadow-glow flex items-center gap-2 disabled:opacity-50"
						>
							{saving ? (
								<Loader2 className="size-4 animate-spin" />
							) : (
								<Save className="size-4" />
							)}
							{saving ? "Saving..." : "Save Changes"}
						</button>
					</div>
				</div>

				<div className="flex gap-8 flex-col lg:flex-row">
					{/* Left — Photo gallery */}
					<div className="w-full lg:w-72 lg:flex-shrink-0">
						<div className="bg-card border border-border rounded-3xl p-5 shadow-card">
							<h2 className="font-display font-semibold text-base mb-4">
								Photo Gallery
							</h2>

							{/* Thumbnail (primary) */}
							<div className="mb-4">
								<p className="text-xs text-muted-foreground mb-2 font-medium">
									Primary photo (edit in basic info)
								</p>
								<div
									className="relative rounded-2xl overflow-hidden bg-muted"
									style={{ width: "100%", aspectRatio: "1" }}
								>
									{pet.thumbnail ? (
										<Image
											src={pet.thumbnail}
											alt={pet.name}
											fill
											className="object-cover"
										/>
									) : (
										<div className="w-full h-full flex items-center justify-center text-4xl">
											🐾
										</div>
									)}
								</div>
							</div>

							{/* Additional photos */}
							<div>
								<p className="text-xs text-muted-foreground mb-2 font-medium">
									Additional photos ({photoUrls.length}/9)
								</p>
								<div className="grid grid-cols-3 gap-2">
									{photoUrls.map((url, idx) => (
										<div
											key={idx}
											className="relative rounded-xl overflow-hidden bg-muted group"
											style={{ aspectRatio: "1" }}
										>
											<Image
												src={url}
												alt={`${pet.name} photo ${idx + 1}`}
												fill
												className="object-cover"
											/>
											<button
												onClick={() => handleRemovePhoto(idx)}
												className="absolute top-1 right-1 size-5 rounded-full bg-foreground/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
											>
												<X className="size-3 text-white" />
											</button>
										</div>
									))}

									{photoUrls.length < 9 && (
										<button
											onClick={() => fileInputRef.current?.click()}
											disabled={uploadingPhoto}
											className="rounded-xl border-2 border-dashed border-border hover:border-primary flex items-center justify-center transition-colors bg-card"
											style={{ aspectRatio: "1" }}
										>
											{uploadingPhoto ? (
												<Loader2 className="size-4 animate-spin text-muted-foreground" />
											) : (
												<ImagePlus className="size-4 text-muted-foreground" />
											)}
										</button>
									)}
								</div>
								<input
									ref={fileInputRef}
									type="file"
									className="hidden"
									accept="image/jpeg,image/jpg,image/png,image/webp"
									onChange={(e) => {
										const file = e.target.files?.[0];
										if (file) handleAddPhoto(file);
										e.target.value = "";
									}}
								/>
							</div>
						</div>
					</div>

					{/* Right — Editable content */}
					<div className="flex-1 flex flex-col gap-5">
						{/* Quick info (read-only reference) */}
						<div className="bg-card border border-border rounded-3xl p-5 shadow-card">
							<h2 className="font-display font-semibold text-base mb-4">
								Pet Info
								<span className="text-xs font-normal text-muted-foreground ml-2">
									(edit basic fields from the Pets list)
								</span>
							</h2>
							<div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
								<InfoRow label="Gender" value={capitalize(pet.gender)} />
								<InfoRow label="Breed" value={pet.breed} />
								<InfoRow label="Age" value={displayAge} />
								<InfoRow label="Species" value={capitalize(pet.species)} />
								<InfoRow
									label="Vaccinated"
									value={pet.isVaccinated ? "Yes" : "No"}
								/>
								<InfoRow label="Neutered" value={pet.isNeutered ? "Yes" : "No"} />
							</div>

							{/* Arrival date — editable here since it shows as "Born" on detail page */}
							<div className="mt-4 pt-4 border-t border-border">
								<label className="block text-xs font-medium text-muted-foreground mb-1.5">
									Arrival / Born Date{" "}
									<span className="text-foreground/50">
										(shown on detail page)
									</span>
								</label>
								<input
									type="date"
									value={arrivalDate}
									onChange={(e) => setArrivalDate(e.target.value)}
									className="h-10 rounded-2xl border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring w-full max-w-xs"
								/>
							</div>
						</div>

						{/* Information section — mirrors the user-facing detail page */}
						<div className="bg-card border border-border rounded-3xl p-5 shadow-card flex-1">
							<h2 className="font-display font-semibold text-base mb-1">
								Information
							</h2>
							<p className="text-xs text-muted-foreground mb-3">
								This text appears in the {'"'}Information{'"'} section on the public
								pet page.
							</p>
							<textarea
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder={`Write about ${pet.name}'s personality, background, and what makes them special...`}
								rows={12}
								className="w-full rounded-2xl border border-input bg-background p-4 text-sm resize-none outline-none focus:ring-2 focus:ring-ring leading-relaxed"
								style={{ fontFamily: "'Poppins', sans-serif" }}
							/>
							<p className="text-xs text-muted-foreground mt-2 text-right">
								{description.length} / 2000 characters
							</p>
						</div>

						{/* Preview note */}
						<div
							className="rounded-2xl px-5 py-4 text-sm flex items-start gap-3"
							style={{ background: "#E8F4F1" }}
						>
							<span className="text-lg leading-none mt-0.5">👁</span>
							<div>
								<p className="font-semibold text-[#216959] mb-0.5">
									Preview the public page
								</p>
								<a
									href={`/pets/${id}`}
									target="_blank"
									rel="noopener noreferrer"
									className="text-[#7AADA1] hover:underline text-xs"
								>
									Open /pets/{id} in a new tab →
								</a>
							</div>
						</div>
					</div>
				</div>
			</div>
		</AdminLayout>
	);
}

function InfoRow({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex flex-col gap-0.5">
			<span className="text-xs text-muted-foreground">{label}</span>
			<span className="font-medium text-foreground">{value || "—"}</span>
		</div>
	);
}

function capitalize(s: string) {
	return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}
