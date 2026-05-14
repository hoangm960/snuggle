"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
	Heart,
	ChevronRight,
	X,
	ChevronLeft,
	Send,
	Loader2,
	MessageCircle,
	CheckCircle2,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { usePets } from "@/hooks/usePets";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import { Pet } from "@/types";
import api from "@/lib/api";

// ── Types ──────────────────────────────────────────────────────────────────────

type EmploymentStatus = "full-time" | "part-time" | "unemployed" | "student" | "retired";
type HousingType = "rent" | "own" | "parents";
type LandlordPets = "yes" | "no" | "not-sure";
type HomeType = "house" | "condo" | "mobile-home" | "apartment" | "other";

interface ApplicationForm {
	// Applicant info
	applicantFullName: string;
	applicantAddress: string;
	applicantApartment: string;
	applicantCity: string;
	applicantState: string;
	applicantZipCode: string;
	applicantPhone: string;
	applicantEmail: string;
	applicantDateOfBirth: string;
	applicantAge: string;
	applicantIdLicense: string;
	spousePartnerName: string;
	employmentStatus: EmploymentStatus | "";
	// Living arrangement
	housingType: HousingType | "";
	landlordAllowsPets: LandlordPets | "";
	landlordAllowsHowMany: string;
	landlordContact: string;
	homeType: HomeType | "";
	otherHomeType: string;
	lengthAtAddress: string;
	planningToMove: string;
	householdAgreement: string;
	householdAllergies: boolean | null;
	// About the adoption
	reasonForAdopting: string;
	petWillStay: string;
}

const defaultForm = (): ApplicationForm => ({
	applicantFullName: "",
	applicantAddress: "",
	applicantApartment: "",
	applicantCity: "",
	applicantState: "",
	applicantZipCode: "",
	applicantPhone: "",
	applicantEmail: "",
	applicantDateOfBirth: "",
	applicantAge: "",
	applicantIdLicense: "",
	spousePartnerName: "",
	employmentStatus: "",
	housingType: "",
	landlordAllowsPets: "",
	landlordAllowsHowMany: "",
	landlordContact: "",
	homeType: "",
	otherHomeType: "",
	lengthAtAddress: "",
	planningToMove: "",
	householdAgreement: "",
	householdAllergies: null,
	reasonForAdopting: "",
	petWillStay: "",
});

// ── Shared input styles ────────────────────────────────────────────────────────
const inputCls =
	"w-full h-10 border border-[#E0E0E0] rounded-xl bg-white px-3 text-sm outline-none focus:border-[#7AADA1] focus:ring-1 focus:ring-[#7AADA1]/30 transition-all placeholder:text-[#bbb]";
const labelCls = "block text-xs font-semibold text-[#777] mb-1";
const sectionTitle = "text-base font-bold text-[#1C1C1C] mb-4 mt-2 underline underline-offset-4";

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function PetDetailPage() {
	const { id } = useParams<{ id: string }>();
	const router = useRouter();
	const { user } = useAuth();
	const { getPetById } = usePets();
	const { isFavorited, toggleFavorite } = useFavorites();

	const [pet, setPet] = useState<Pet | null>(null);
	const [loading, setLoading] = useState(true);
	const [selectedPhoto, setSelectedPhoto] = useState(0);

	// Adoption form state
	const [adoptOpen, setAdoptOpen] = useState(false);
	const [form, setForm] = useState<ApplicationForm>(defaultForm());
	const [submitting, setSubmitting] = useState(false);
	const [submitted, setSubmitted] = useState(false);
	const [submitError, setSubmitError] = useState("");

	// Ask a question state
	const [askOpen, setAskOpen] = useState(false);
	const [question, setQuestion] = useState("");
	const [sending, setSending] = useState(false);
	const [questionSent, setQuestionSent] = useState(false);
	const [askError, setAskError] = useState("");
	const inputRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		getPetById(id).then((data) => {
			setPet(data);
			setLoading(false);
		});
	}, [id]);

	// Pre-fill email from auth user
	useEffect(() => {
		if (user) {
			setForm((f) => ({
				...f,
				applicantEmail: f.applicantEmail || user.email || "",
				applicantFullName: f.applicantFullName || user.displayName || "",
			}));
		}
	}, [user]);

	useEffect(() => {
		if (askOpen) setTimeout(() => inputRef.current?.focus(), 100);
	}, [askOpen]);

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

	const set = (field: keyof ApplicationForm, value: ApplicationForm[keyof ApplicationForm]) =>
		setForm((f) => ({ ...f, [field]: value }));

	// ── Submit adoption application ──────────────────────────────────────────

	async function handleAdoptSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!user) {
			router.push("/login");
			return;
		}
		setSubmitting(true);
		setSubmitError("");
		try {
			await api.post("/applications", { petId: id, ...form });
			setSubmitted(true);
		} catch {
			setSubmitError("Failed to submit application. Please try again.");
		} finally {
			setSubmitting(false);
		}
	}

	function openAdopt() {
		if (!user) {
			router.push("/login");
			return;
		}
		setForm(defaultForm());
		setSubmitted(false);
		setSubmitError("");
		setAdoptOpen(true);
	}

	// ── Ask a question ───────────────────────────────────────────────────────

	async function handleSendQuestion(e: React.FormEvent) {
		e.preventDefault();
		if (!user) {
			router.push("/login");
			return;
		}
		if (!question.trim()) return;
		setSending(true);
		setAskError("");
		try {
			const chatRes = await api.post("/chats/support");
			const chatId = chatRes.data.data.id;
			await api.post(`/chats/${chatId}/messages`, {
				content: `[Re: ${pet?.name}] ${question.trim()}`,
				type: "text",
			});
			setQuestionSent(true);
			setQuestion("");
		} catch {
			setAskError("Failed to send. Please try again.");
		} finally {
			setSending(false);
		}
	}

	// ─────────────────────────────────────────────────────────────────────────

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
						<h1
							style={{
								fontFamily: "'Space Grotesk', sans-serif",
								fontSize: "32px",
								fontWeight: 700,
								color: "#1C1C1C",
								marginBottom: "4px",
							}}
						>
							{pet.name}
						</h1>
						{displayAge && (
							<p style={{ color: "#999", fontSize: "14px", marginBottom: "20px" }}>
								{displayAge}
							</p>
						)}

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
								onClick={() => {
									if (!user) {
										router.push("/login");
										return;
									}
									toggleFavorite(pet.id!);
								}}
								className="flex items-center justify-center rounded-[40px] transition-all hover:opacity-80"
								style={{
									width: "48px",
									height: "48px",
									border: "1.5px solid #7AADA1",
									background: "transparent",
									flexShrink: 0,
								}}
								title={
									isFavorited(pet.id!)
										? "Remove from favorites"
										: "Add to favorites"
								}
							>
								<Heart
									className="w-5 h-5"
									style={{
										color: isFavorited(pet.id!) ? "#C4857A" : "#7AADA1",
										fill: isFavorited(pet.id!) ? "#C4857A" : "none",
										transition: "all 0.2s",
									}}
								/>
							</button>
						</div>

						<button
							onClick={() => {
								if (!user) {
									router.push("/login");
									return;
								}
								setAskOpen((v) => !v);
								setQuestionSent(false);
								setAskError("");
							}}
							className="w-full font-semibold rounded-[40px] transition-all hover:bg-gray-50 flex items-center justify-center gap-2"
							style={{
								border: "1.5px solid #7AADA1",
								color: "#7AADA1",
								fontFamily: "'Space Grotesk', sans-serif",
								fontSize: "15px",
								padding: "12px 24px",
								background: "transparent",
							}}
						>
							<MessageCircle className="w-4 h-4" />
							Ask a question
						</button>

						{/* Ask a question inline box */}
						{askOpen && (
							<div
								className="mt-3 rounded-2xl overflow-hidden"
								style={{
									border: "1.5px solid #7AADA1",
									background: "#fff",
									boxShadow: "0 4px 20px rgba(122,173,161,0.12)",
								}}
							>
								<div
									className="flex items-center justify-between px-4 py-3"
									style={{ background: "#7AADA1" }}
								>
									<span className="text-sm font-semibold text-white">
										Ask about {pet.name}
									</span>
									<button
										onClick={() => setAskOpen(false)}
										className="text-white/80 hover:text-white transition-colors"
									>
										<X className="w-4 h-4" />
									</button>
								</div>
								{questionSent ? (
									<div className="flex flex-col items-center gap-2 py-6 px-4">
										<CheckCircle2
											className="w-8 h-8"
											style={{ color: "#7AADA1" }}
										/>
										<p className="text-sm font-semibold text-[#1C1C1C]">
											Question sent!
										</p>
										<p className="text-xs text-[#888] text-center">
											Our team will get back to you via the support chat.
										</p>
										<button
											onClick={() => {
												setQuestionSent(false);
												setAskOpen(false);
											}}
											className="mt-1 text-xs font-semibold"
											style={{ color: "#7AADA1" }}
										>
											Close
										</button>
									</div>
								) : (
									<form onSubmit={handleSendQuestion} className="p-4">
										<textarea
											ref={inputRef}
											value={question}
											onChange={(e) => setQuestion(e.target.value)}
											rows={3}
											placeholder={`e.g. Is ${pet.name} good with kids?`}
											className="w-full rounded-xl resize-none outline-none text-sm"
											style={{
												border: "1.5px solid #E8E8E8",
												padding: "10px 12px",
												fontFamily: "'Poppins', sans-serif",
												color: "#333",
											}}
										/>
										{askError && (
											<p
												className="text-xs mt-1"
												style={{ color: "#C4857A" }}
											>
												{askError}
											</p>
										)}
										<button
											type="submit"
											disabled={sending || !question.trim()}
											className="mt-3 w-full flex items-center justify-center gap-2 rounded-[40px] font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-50"
											style={{
												background: "#7AADA1",
												color: "#fff",
												padding: "10px",
												fontFamily: "'Space Grotesk', sans-serif",
											}}
										>
											{sending ? (
												<Loader2 className="w-4 h-4 animate-spin" />
											) : (
												<Send className="w-4 h-4" />
											)}
											Send
										</button>
									</form>
								)}
							</div>
						)}

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

			{/* ════════════ Full-Page Adoption Form ════════════ */}
			{adoptOpen && (
				<div
					className="fixed inset-0 z-50 flex flex-col"
					style={{ background: "#F9F6F2", fontFamily: "'Poppins', sans-serif" }}
				>
					{/* Header */}
					<div
						className="flex items-center gap-4 px-6 py-4 bg-white border-b border-[#E8E8E8] sticky top-0 z-10"
						style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}
					>
						<button
							onClick={() => setAdoptOpen(false)}
							className="flex items-center gap-1.5 text-sm font-semibold hover:text-[#7AADA1] transition-colors"
							style={{ color: "#888", fontFamily: "'Space Grotesk', sans-serif" }}
						>
							<ChevronLeft className="w-4 h-4" /> Back
						</button>
						<div className="flex-1 text-center">
							<h1
								style={{
									fontFamily: "'Space Grotesk', sans-serif",
									fontSize: "18px",
									fontWeight: 700,
									color: "#1C1C1C",
								}}
							>
								Adoption Application
							</h1>
							<p style={{ fontSize: "12px", color: "#999" }}>For {pet.name}</p>
						</div>
						<div style={{ width: "60px" }} />
					</div>

					{/* Success state */}
					{submitted ? (
						<div className="flex-1 flex flex-col items-center justify-center gap-5 p-8">
							<div
								className="w-20 h-20 rounded-full flex items-center justify-center"
								style={{ background: "#E8F4F1" }}
							>
								<span style={{ fontSize: "40px" }}>🐾</span>
							</div>
							<h2
								style={{
									fontFamily: "'Space Grotesk', sans-serif",
									fontSize: "24px",
									fontWeight: 700,
									color: "#1C1C1C",
								}}
							>
								Application Sent!
							</h2>
							<p
								style={{
									color: "#666",
									fontSize: "15px",
									textAlign: "center",
									maxWidth: "380px",
								}}
							>
								Your adoption application for <strong>{pet.name}</strong> has been
								submitted. We'll review it and be in touch soon!
							</p>
							<button
								onClick={() => {
									setAdoptOpen(false);
								}}
								className="mt-2 font-semibold rounded-[40px] hover:opacity-90 transition-all px-8 py-3"
								style={{
									background: "#7AADA1",
									color: "#fff",
									fontFamily: "'Space Grotesk', sans-serif",
									fontSize: "15px",
								}}
							>
								Done
							</button>
						</div>
					) : (
						<form onSubmit={handleAdoptSubmit} className="flex-1 overflow-y-auto">
							<div className="max-w-3xl mx-auto px-6 py-8 space-y-10">
								{/* ── Section 1: Applicant Information ── */}
								<section>
									<p className={sectionTitle}>Applicant Information</p>
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
										<div className="sm:col-span-2">
											<label className={labelCls}>Full Name</label>
											<input
												className={inputCls}
												value={form.applicantFullName}
												onChange={(e) =>
													set("applicantFullName", e.target.value)
												}
												placeholder="e.g. Jane Smith"
											/>
										</div>
										<div>
											<label className={labelCls}>Phone Number</label>
											<input
												className={inputCls}
												value={form.applicantPhone}
												onChange={(e) =>
													set("applicantPhone", e.target.value)
												}
												placeholder="e.g. (555) 123-4567"
											/>
										</div>
										<div>
											<label className={labelCls}>Email</label>
											<input
												className={inputCls}
												type="email"
												value={form.applicantEmail}
												onChange={(e) =>
													set("applicantEmail", e.target.value)
												}
												placeholder="you@example.com"
											/>
										</div>
										<div className="sm:col-span-2">
											<label className={labelCls}>Address</label>
											<input
												className={inputCls}
												value={form.applicantAddress}
												onChange={(e) =>
													set("applicantAddress", e.target.value)
												}
												placeholder="Street address"
											/>
										</div>
										<div>
											<label className={labelCls}>Apartment / Unit #</label>
											<input
												className={inputCls}
												value={form.applicantApartment}
												onChange={(e) =>
													set("applicantApartment", e.target.value)
												}
												placeholder="Optional"
											/>
										</div>
										<div>
											<label className={labelCls}>City</label>
											<input
												className={inputCls}
												value={form.applicantCity}
												onChange={(e) =>
													set("applicantCity", e.target.value)
												}
												placeholder="City"
											/>
										</div>
										<div>
											<label className={labelCls}>State</label>
											<input
												className={inputCls}
												value={form.applicantState}
												onChange={(e) =>
													set("applicantState", e.target.value)
												}
												placeholder="State"
											/>
										</div>
										<div>
											<label className={labelCls}>Zip Code</label>
											<input
												className={inputCls}
												value={form.applicantZipCode}
												onChange={(e) =>
													set("applicantZipCode", e.target.value)
												}
												placeholder="Zip"
											/>
										</div>
										<div>
											<label className={labelCls}>Date of Birth</label>
											<input
												className={inputCls}
												type="date"
												value={form.applicantDateOfBirth}
												onChange={(e) =>
													set("applicantDateOfBirth", e.target.value)
												}
											/>
										</div>
										<div>
											<label className={labelCls}>Age</label>
											<input
												className={inputCls}
												value={form.applicantAge}
												onChange={(e) =>
													set("applicantAge", e.target.value)
												}
												placeholder="e.g. 29"
											/>
										</div>
										<div>
											<label className={labelCls}>
												ID / Driver's License #
											</label>
											<input
												className={inputCls}
												value={form.applicantIdLicense}
												onChange={(e) =>
													set("applicantIdLicense", e.target.value)
												}
												placeholder="Optional"
											/>
										</div>
										<div>
											<label className={labelCls}>
												Spouse / Partner Name
											</label>
											<input
												className={inputCls}
												value={form.spousePartnerName}
												onChange={(e) =>
													set("spousePartnerName", e.target.value)
												}
												placeholder="Optional"
											/>
										</div>
									</div>

									<div className="mt-4">
										<label className={labelCls}>Employment Status</label>
										<div className="flex flex-wrap gap-2 mt-1">
											{(
												[
													"full-time",
													"part-time",
													"unemployed",
													"student",
													"retired",
												] as EmploymentStatus[]
											).map((v) => (
												<CheckPill
													key={v}
													label={
														v === "full-time"
															? "Employed full-time"
															: v === "part-time"
																? "Employed part-time"
																: capitalize(v)
													}
													checked={form.employmentStatus === v}
													onClick={() =>
														set(
															"employmentStatus",
															form.employmentStatus === v ? "" : v
														)
													}
												/>
											))}
										</div>
									</div>
								</section>

								{/* ── Section 2: Living Arrangement ── */}
								<section>
									<p className={sectionTitle}>Living Arrangement</p>
									<div className="space-y-5">
										<div>
											<label className={labelCls}>Do you:</label>
											<div className="flex flex-wrap gap-2 mt-1">
												{(["rent", "own", "parents"] as HousingType[]).map(
													(v) => (
														<CheckPill
															key={v}
															label={
																v === "rent"
																	? "Rent your home"
																	: v === "own"
																		? "Own your home"
																		: "Live at parents"
															}
															checked={form.housingType === v}
															onClick={() =>
																set(
																	"housingType",
																	form.housingType === v ? "" : v
																)
															}
														/>
													)
												)}
											</div>
										</div>

										{form.housingType === "rent" && (
											<>
												<div>
													<label className={labelCls}>
														Does your landlord allow pets?
													</label>
													<div className="flex flex-wrap gap-2 mt-1">
														{(
															[
																"yes",
																"no",
																"not-sure",
															] as LandlordPets[]
														).map((v) => (
															<CheckPill
																key={v}
																label={
																	v === "not-sure"
																		? "Not sure"
																		: v === "yes"
																			? "Yes"
																			: "No"
																}
																checked={
																	form.landlordAllowsPets === v
																}
																onClick={() =>
																	set(
																		"landlordAllowsPets",
																		form.landlordAllowsPets ===
																			v
																			? ""
																			: v
																	)
																}
															/>
														))}
													</div>
												</div>
												{form.landlordAllowsPets === "yes" && (
													<div className="grid grid-cols-2 gap-4">
														<div>
															<label className={labelCls}>
																How many pets allowed?
															</label>
															<input
																className={inputCls}
																value={form.landlordAllowsHowMany}
																onChange={(e) =>
																	set(
																		"landlordAllowsHowMany",
																		e.target.value
																	)
																}
																placeholder="e.g. 2"
															/>
														</div>
														<div>
															<label className={labelCls}>
																Landlord name &amp; phone
															</label>
															<input
																className={inputCls}
																value={form.landlordContact}
																onChange={(e) =>
																	set(
																		"landlordContact",
																		e.target.value
																	)
																}
																placeholder="Name, phone number"
															/>
														</div>
													</div>
												)}
											</>
										)}

										<div>
											<label className={labelCls}>Type of home</label>
											<div className="flex flex-wrap gap-2 mt-1">
												{(
													[
														"house",
														"condo",
														"mobile-home",
														"apartment",
														"other",
													] as HomeType[]
												).map((v) => (
													<CheckPill
														key={v}
														label={
															v === "mobile-home"
																? "Mobile home"
																: capitalize(v)
														}
														checked={form.homeType === v}
														onClick={() =>
															set(
																"homeType",
																form.homeType === v ? "" : v
															)
														}
													/>
												))}
											</div>
											{form.homeType === "other" && (
												<input
													className={`${inputCls} mt-2`}
													value={form.otherHomeType}
													onChange={(e) =>
														set("otherHomeType", e.target.value)
													}
													placeholder="Please specify"
												/>
											)}
										</div>

										<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
											<div>
												<label className={labelCls}>
													Length of time at current address
												</label>
												<input
													className={inputCls}
													value={form.lengthAtAddress}
													onChange={(e) =>
														set("lengthAtAddress", e.target.value)
													}
													placeholder="e.g. 3 years"
												/>
											</div>
										</div>

										<div>
											<label className={labelCls}>
												Do you plan on moving in the foreseeable future? If
												so, where and why?
											</label>
											<textarea
												rows={2}
												className={`${inputCls} h-auto py-2`}
												value={form.planningToMove}
												onChange={(e) =>
													set("planningToMove", e.target.value)
												}
												placeholder="If yes, please explain..."
											/>
										</div>

										<div>
											<label className={labelCls}>
												Are all household members aware and in agreement
												with this adoption? If not, please explain.
											</label>
											<textarea
												rows={2}
												className={`${inputCls} h-auto py-2`}
												value={form.householdAgreement}
												onChange={(e) =>
													set("householdAgreement", e.target.value)
												}
												placeholder="Please describe..."
											/>
										</div>

										<div>
											<label className={labelCls}>
												Are any members of the household allergic to cats or
												dogs?
											</label>
											<div className="flex gap-2 mt-1">
												<CheckPill
													label="Yes"
													checked={form.householdAllergies === true}
													onClick={() =>
														set(
															"householdAllergies",
															form.householdAllergies === true
																? null
																: true
														)
													}
												/>
												<CheckPill
													label="No"
													checked={form.householdAllergies === false}
													onClick={() =>
														set(
															"householdAllergies",
															form.householdAllergies === false
																? null
																: false
														)
													}
												/>
											</div>
										</div>
									</div>
								</section>

								{/* ── Section 3: About the Adoption ── */}
								<section>
									<p className={sectionTitle}>About the Adoption</p>
									<div className="space-y-4">
										<div>
											<label className={labelCls}>
												Why do you want to adopt {pet.name}?
											</label>
											<textarea
												rows={4}
												className={`${inputCls} h-auto py-2`}
												value={form.reasonForAdopting}
												onChange={(e) =>
													set("reasonForAdopting", e.target.value)
												}
												placeholder="Share your experience with pets, your home environment, or anything else you'd like us to know..."
											/>
										</div>
										<div>
											<label className={labelCls}>
												Where will {pet.name} primarily stay?
											</label>
											<textarea
												rows={2}
												className={`${inputCls} h-auto py-2`}
												value={form.petWillStay}
												onChange={(e) => set("petWillStay", e.target.value)}
												placeholder="e.g. Inside the house, in the backyard, shared indoor/outdoor..."
											/>
										</div>
									</div>
								</section>

								{/* Submit */}
								{submitError && (
									<p className="text-sm text-center" style={{ color: "#C4857A" }}>
										{submitError}
									</p>
								)}
								<div className="pb-8">
									<button
										type="submit"
										disabled={submitting}
										className="w-full font-semibold rounded-[40px] hover:opacity-90 transition-all flex items-center justify-center gap-2"
										style={{
											background: "#7AADA1",
											color: "#fff",
											fontFamily: "'Space Grotesk', sans-serif",
											fontSize: "16px",
											padding: "14px",
											opacity: submitting ? 0.7 : 1,
										}}
									>
										{submitting ? (
											<>
												<Loader2 className="w-5 h-5 animate-spin" />{" "}
												Submitting…
											</>
										) : (
											"Submit Application"
										)}
									</button>
								</div>
							</div>
						</form>
					)}
				</div>
			)}
		</div>
	);
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function CheckPill({
	label,
	checked,
	onClick,
}: {
	label: string;
	checked: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border"
			style={{
				background: checked ? "#7AADA1" : "#fff",
				color: checked ? "#fff" : "#555",
				borderColor: checked ? "#7AADA1" : "#DDD",
			}}
		>
			{checked && <span>✓</span>}
			{label}
		</button>
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
