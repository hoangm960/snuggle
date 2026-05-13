"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, ChevronRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { usePets } from "@/hooks/usePets";
import { useAuth } from "@/hooks/useAuth";
import { Pet } from "@/types";
import api from "@/lib/api";

export default function PetDetailPage() {
	const { id } = useParams<{ id: string }>();
	const router = useRouter();
	const { user } = useAuth();
	const { getPetById } = usePets();

	const [pet, setPet] = useState<Pet | null>(null);
	const [loading, setLoading] = useState(true);
	const [selectedPhoto, setSelectedPhoto] = useState(0);
	const [wishlisted, setWishlisted] = useState(false);

	const [adoptOpen, setAdoptOpen] = useState(false);
	const [message, setMessage] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [submitted, setSubmitted] = useState(false);
	const [submitError, setSubmitError] = useState("");

	useEffect(() => {
		getPetById(id).then((data) => {
			setPet(data);
			setLoading(false);
		});
	}, [id]);

	const photos = pet
		? ([pet.thumbnail, ...(pet.photoUrls || [])].filter(Boolean) as string[])
		: [];

	const displayAge = pet?.ageMonths
		? `${pet.ageMonths} month${pet.ageMonths === 1 ? "" : "s"}`
		: pet?.age
			? `${pet.age} year${pet.age === 1 ? "" : "s"}`
			: "";

	const bornDate = pet?.arrivalDate
		? new Date(pet.arrivalDate).toLocaleDateString("en-US", {
				month: "long",
				day: "numeric",
				year: "numeric",
			})
		: null;

	async function handleAdoptSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!user) {
			router.push("/login");
			return;
		}
		setSubmitting(true);
		setSubmitError("");
		try {
			await api.post("/applications", { petId: id, message });
			setSubmitted(true);
		} catch {
			setSubmitError("Failed to submit application. Please try again.");
		} finally {
			setSubmitting(false);
		}
	}

	if (loading) {
		return (
			<div className="min-h-screen" style={{ background: "#F9F6F2" }}>
				<Navbar />
				<div className="flex items-center justify-center" style={{ height: "60vh" }}>
					<div
						className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
						style={{ borderColor: "#7AADA1 transparent #7AADA1 #7AADA1" }}
					/>
				</div>
			</div>
		);
	}

	if (!pet) {
		return (
			<div className="min-h-screen" style={{ background: "#F9F6F2" }}>
				<Navbar />
				<div
					className="flex flex-col items-center justify-center gap-4"
					style={{ height: "60vh" }}
				>
					<p
						style={{
							fontFamily: "'Space Grotesk', sans-serif",
							color: "#666",
							fontSize: "18px",
						}}
					>
						Pet not found.
					</p>
					<Link
						href="/pets"
						style={{
							fontFamily: "'Space Grotesk', sans-serif",
							color: "#7AADA1",
							fontWeight: 600,
							fontSize: "14px",
						}}
					>
						← Back to Pets
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div
			className="min-h-screen"
			style={{ background: "#F9F6F2", fontFamily: "'Poppins', sans-serif" }}
		>
			<Navbar />

			<div className="max-w-5xl mx-auto px-6 py-8">
				{/* Breadcrumb */}
				<nav
					className="flex items-center gap-1 mb-8"
					style={{ fontSize: "13px", color: "#999" }}
				>
					<Link href="/home" className="hover:text-[#7AADA1] transition-colors">
						Home
					</Link>
					<ChevronRight className="w-3 h-3" />
					<Link href="/pets" className="hover:text-[#7AADA1] transition-colors">
						Pets
					</Link>
					<ChevronRight className="w-3 h-3" />
					<span style={{ color: "#1C1C1C", fontWeight: 600 }}>{pet.name}</span>
				</nav>

				{/* Main content */}
				<div className="flex gap-10 flex-col lg:flex-row">
					{/* Photo gallery */}
					<div className="flex flex-col gap-3" style={{ flexShrink: 0, width: "340px" }}>
						<div
							className="rounded-2xl overflow-hidden"
							style={{ width: "340px", height: "340px", background: "#E8E8E8" }}
						>
							{photos.length > 0 ? (
								<img
									src={photos[selectedPhoto]}
									alt={pet.name}
									className="w-full h-full object-cover"
								/>
							) : (
								<div
									className="w-full h-full flex items-center justify-center"
									style={{ color: "#bbb", fontSize: "48px" }}
								>
									🐾
								</div>
							)}
						</div>

						{photos.length > 1 && (
							<div className="flex gap-2">
								{photos.map((url, idx) => (
									<button
										key={idx}
										onClick={() => setSelectedPhoto(idx)}
										className="rounded-xl overflow-hidden transition-all"
										style={{
											width: "72px",
											height: "72px",
											flexShrink: 0,
											border:
												selectedPhoto === idx
													? "2px solid #7AADA1"
													: "2px solid transparent",
											opacity: selectedPhoto === idx ? 1 : 0.6,
										}}
									>
										<img
											src={url}
											alt={`${pet.name} ${idx + 1}`}
											className="w-full h-full object-cover"
										/>
									</button>
								))}
							</div>
						)}
					</div>

					{/* Pet details */}
					<div className="flex-1">
						<div className="flex items-start justify-between mb-1">
							<h1
								style={{
									fontFamily: "'Space Grotesk', sans-serif",
									fontSize: "32px",
									fontWeight: 700,
									color: "#1C1C1C",
								}}
							>
								{pet.name}
							</h1>
						</div>

						{displayAge && (
							<p style={{ color: "#999", fontSize: "14px", marginBottom: "20px" }}>
								{displayAge}
							</p>
						)}

						{/* Details grid */}
						<div className="flex flex-col gap-3 mb-6">
							<DetailRow
								label="Gender"
								value={
									<span
										style={{
											color: pet.gender === "female" ? "#C4857A" : "#7AADA1",
										}}
									>
										{pet.gender === "female" ? "♀" : "♂"}{" "}
										{capitalize(pet.gender)}
									</span>
								}
							/>
							<DetailRow label="Breeds" value={pet.breed} />
							{bornDate && <DetailRow label="Born" value={bornDate} />}
							<DetailRow
								label="Vaccinated"
								value={
									pet.isVaccinated === undefined
										? "Unknown"
										: pet.isVaccinated
											? "Yes"
											: "No"
								}
							/>
							<DetailRow
								label="Neutered"
								value={
									pet.isNeutered === undefined
										? "Unknown"
										: pet.isNeutered
											? "Yes"
											: "No"
								}
							/>
						</div>

						{/* Action buttons */}
						<div className="flex gap-3 mb-4">
							<button
								onClick={() => {
									if (!user) {
										router.push("/login");
									} else if (user.role === "visitor") {
										router.push("/ekyc");
									} else {
										setAdoptOpen(true);
									}
								}}
								className="flex-1 font-semibold rounded-[40px] transition-all hover:opacity-90"
								style={{
									background: "#7AADA1",
									color: "#fff",
									fontFamily: "'Space Grotesk', sans-serif",
									fontSize: "15px",
									padding: "12px 24px",
								}}
							>
								Adopt
							</button>

							<button
								onClick={() => setWishlisted((w) => !w)}
								className="flex items-center justify-center rounded-[40px] transition-all hover:opacity-80"
								style={{
									width: "48px",
									height: "48px",
									border: "1.5px solid #7AADA1",
									background: "transparent",
									flexShrink: 0,
								}}
							>
								<Heart
									className="w-5 h-5"
									style={{
										color: wishlisted ? "#C4857A" : "#7AADA1",
										fill: wishlisted ? "#C4857A" : "none",
									}}
								/>
							</button>
						</div>

						<button
							onClick={() => router.push("/home")}
							className="w-full font-semibold rounded-[40px] transition-all hover:bg-gray-50"
							style={{
								border: "1.5px solid #7AADA1",
								color: "#7AADA1",
								fontFamily: "'Space Grotesk', sans-serif",
								fontSize: "15px",
								padding: "12px 24px",
								background: "transparent",
							}}
						>
							Ask a question
						</button>

						{/* Health records link */}
						<Link
							href={`/pets/${id}/health`}
							className="block mt-4 text-center text-sm hover:underline"
							style={{ color: "#7AADA1", fontFamily: "'Space Grotesk', sans-serif" }}
						>
							View Health Records →
						</Link>
					</div>
				</div>

				{/* Information section */}
				<div
					className="mt-12 rounded-2xl p-8"
					style={{ background: "#fff", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
				>
					<h2
						style={{
							fontFamily: "'Space Grotesk', sans-serif",
							fontSize: "22px",
							fontWeight: 700,
							color: "#1C1C1C",
							marginBottom: "16px",
						}}
					>
						Information
					</h2>
					<p
						style={{
							color: "#555",
							fontSize: "15px",
							lineHeight: "1.8",
							fontFamily: "'Poppins', sans-serif",
							whiteSpace: "pre-line",
						}}
					>
						{pet.description || "No description available."}
					</p>
				</div>
			</div>

			{/* Adopt modal */}
			{adoptOpen && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center"
					style={{ background: "rgba(0,0,0,0.45)" }}
					onClick={(e) => {
						if (e.target === e.currentTarget) setAdoptOpen(false);
					}}
				>
					<div
						className="rounded-2xl p-8 w-full max-w-md mx-4"
						style={{ background: "#fff", boxShadow: "0 8px 40px rgba(0,0,0,0.18)" }}
					>
						{submitted ? (
							<div className="flex flex-col items-center gap-4 py-4">
								<div
									className="w-16 h-16 rounded-full flex items-center justify-center"
									style={{ background: "#E8F4F1" }}
								>
									<span style={{ fontSize: "32px" }}>🐾</span>
								</div>
								<h3
									style={{
										fontFamily: "'Space Grotesk', sans-serif",
										fontSize: "20px",
										fontWeight: 700,
										color: "#1C1C1C",
									}}
								>
									Application Sent!
								</h3>
								<p style={{ color: "#666", fontSize: "14px", textAlign: "center" }}>
									Your adoption application for <strong>{pet.name}</strong> has
									been submitted. We'll be in touch soon!
								</p>
								<button
									onClick={() => setAdoptOpen(false)}
									className="mt-2 font-semibold rounded-[40px] hover:opacity-90 transition-all"
									style={{
										background: "#7AADA1",
										color: "#fff",
										fontFamily: "'Space Grotesk', sans-serif",
										fontSize: "14px",
										padding: "10px 32px",
									}}
								>
									Done
								</button>
							</div>
						) : (
							<form onSubmit={handleAdoptSubmit}>
								<h3
									style={{
										fontFamily: "'Space Grotesk', sans-serif",
										fontSize: "20px",
										fontWeight: 700,
										color: "#1C1C1C",
										marginBottom: "6px",
									}}
								>
									Adopt {pet.name}
								</h3>
								<p
									style={{
										color: "#888",
										fontSize: "13px",
										marginBottom: "20px",
									}}
								>
									Tell us a bit about why you'd like to adopt {pet.name}.
								</p>

								<textarea
									value={message}
									onChange={(e) => setMessage(e.target.value)}
									rows={4}
									placeholder="Share your experience with pets, your home environment, or anything else you'd like us to know..."
									className="w-full rounded-xl resize-none outline-none"
									style={{
										border: "1.5px solid #E8E8E8",
										padding: "12px 14px",
										fontFamily: "'Poppins', sans-serif",
										fontSize: "13px",
										color: "#333",
										marginBottom: "16px",
									}}
								/>

								{submitError && (
									<p
										style={{
											color: "#C4857A",
											fontSize: "13px",
											marginBottom: "12px",
										}}
									>
										{submitError}
									</p>
								)}

								<div className="flex gap-3">
									<button
										type="button"
										onClick={() => setAdoptOpen(false)}
										className="flex-1 rounded-[40px] font-semibold hover:bg-gray-50 transition-all"
										style={{
											border: "1.5px solid #E8E8E8",
											color: "#666",
											fontFamily: "'Space Grotesk', sans-serif",
											fontSize: "14px",
											padding: "11px",
										}}
									>
										Cancel
									</button>
									<button
										type="submit"
										disabled={submitting}
										className="flex-1 rounded-[40px] font-semibold hover:opacity-90 transition-all"
										style={{
											background: "#7AADA1",
											color: "#fff",
											fontFamily: "'Space Grotesk', sans-serif",
											fontSize: "14px",
											padding: "11px",
											opacity: submitting ? 0.7 : 1,
										}}
									>
										{submitting ? "Submitting…" : "Submit Application"}
									</button>
								</div>
							</form>
						)}
					</div>
				</div>
			)}
		</div>
	);
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
	return (
		<div className="flex items-center gap-3">
			<span
				style={{
					fontFamily: "'Space Grotesk', sans-serif",
					fontSize: "13px",
					color: "#999",
					minWidth: "90px",
				}}
			>
				{label}
			</span>
			<span
				style={{
					fontFamily: "'Space Grotesk', sans-serif",
					fontSize: "14px",
					fontWeight: 600,
					color: "#1C1C1C",
				}}
			>
				{value}
			</span>
		</div>
	);
}

function capitalize(s: string) {
	return s.charAt(0).toUpperCase() + s.slice(1);
}
