"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
	ChevronDown,
	ChevronUp,
	Clock,
	CheckCircle2,
	XCircle,
	Award,
	Loader2,
	FileText,
	ExternalLink,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import type { AdoptionApplication, Pet } from "@/types";

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
	pending: {
		label: "Pending Review",
		color: "#D97706",
		bg: "#FEF3C7",
		Icon: Clock,
	},
	approved: {
		label: "Approved",
		color: "#059669",
		bg: "#D1FAE5",
		Icon: CheckCircle2,
	},
	rejected: {
		label: "Rejected",
		color: "#DC2626",
		bg: "#FEE2E2",
		Icon: XCircle,
	},
	completed: {
		label: "Completed",
		color: "#7C3AED",
		bg: "#EDE9FE",
		Icon: Award,
	},
} as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(val: string | undefined | null) {
	return val?.trim() || <span style={{ color: "#bbb" }}>—</span>;
}

function fmtDate(d: Date | string | undefined) {
	if (!d) return "—";
	return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function MyApplicationsPage() {
	const router = useRouter();
	const { user, loading: authLoading } = useAuth();

	const [applications, setApplications] = useState<AdoptionApplication[]>([]);
	const [pets, setPets] = useState<Record<string, Pet>>({});
	const [loading, setLoading] = useState(true);
	const [expanded, setExpanded] = useState<Set<string>>(new Set());

	useEffect(() => {
		if (!authLoading && !user) router.push("/login");
	}, [user, authLoading]);

	useEffect(() => {
		if (!user) return;
		fetchApplications();
	}, [user]);

	async function fetchApplications() {
		setLoading(true);
		try {
			const res = await api.get(`/applications?adopterId=${user!.id}`);
			const apps: AdoptionApplication[] = res.data.data || [];
			// Sort newest first
			apps.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
			setApplications(apps);

			// Batch-fetch pet thumbnails
			const uniquePetIds = [...new Set(apps.map((a) => a.petId))];
			const petMap: Record<string, Pet> = {};
			await Promise.allSettled(
				uniquePetIds.map(async (petId) => {
					try {
						const r = await api.get(`/pets/${petId}`);
						petMap[petId] = r.data.data;
					} catch {
						/* ignore missing pets */
					}
				})
			);
			setPets(petMap);
		} catch {
			// silently show empty
		} finally {
			setLoading(false);
		}
	}

	const toggleExpand = (id: string) =>
		setExpanded((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});

	if (authLoading || (!user && loading)) {
		return (
			<div className="min-h-screen" style={{ background: "#F9F6F2" }}>
				<Navbar />
				<div className="flex items-center justify-center" style={{ height: "60vh" }}>
					<Loader2 className="w-8 h-8 animate-spin" style={{ color: "#7AADA1" }} />
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen" style={{ background: "#F9F6F2", fontFamily: "'Poppins', sans-serif" }}>
			<Navbar />

			<div className="max-w-3xl mx-auto px-5 py-10">
				{/* Header */}
				<div className="mb-8">
					<h1
						style={{
							fontFamily: "'Space Grotesk', sans-serif",
							fontSize: "28px",
							fontWeight: 700,
							color: "#1C1C1C",
							marginBottom: "6px",
						}}
					>
						My Applications
					</h1>
					<p style={{ color: "#888", fontSize: "14px" }}>
						Track the status of your pet adoption applications.
					</p>
				</div>

				{/* Loading */}
				{loading ? (
					<div className="flex items-center justify-center py-20">
						<Loader2 className="w-7 h-7 animate-spin" style={{ color: "#7AADA1" }} />
					</div>
				) : applications.length === 0 ? (
					/* ── Empty state ── */
					<div
						className="rounded-2xl flex flex-col items-center justify-center py-20 px-8 text-center"
						style={{ background: "#fff", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
					>
						<div
							className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
							style={{ background: "#E8F4F1" }}
						>
							<FileText className="w-7 h-7" style={{ color: "#7AADA1" }} />
						</div>
						<h2
							style={{
								fontFamily: "'Space Grotesk', sans-serif",
								fontSize: "18px",
								fontWeight: 700,
								color: "#1C1C1C",
								marginBottom: "8px",
							}}
						>
							No applications yet
						</h2>
						<p style={{ color: "#888", fontSize: "14px", marginBottom: "24px", maxWidth: "320px" }}>
							You haven't applied to adopt any pets. Browse available pets and start your journey!
						</p>
						<Link
							href="/pets"
							className="font-semibold rounded-[40px] px-6 py-3 hover:opacity-90 transition-all"
							style={{
								background: "#7AADA1",
								color: "#fff",
								fontFamily: "'Space Grotesk', sans-serif",
								fontSize: "14px",
							}}
						>
							Browse Pets
						</Link>
					</div>
				) : (
					/* ── Application cards ── */
					<div className="flex flex-col gap-4">
						{applications.map((app) => {
							const pet = pets[app.petId];
							const cfg = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.pending;
							const isOpen = expanded.has(app.id!);

							return (
								<div
									key={app.id}
									className="rounded-2xl overflow-hidden"
									style={{ background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", border: "1px solid #F0F0F0" }}
								>
									{/* Card header row */}
									<div className="flex items-center gap-4 px-5 py-4">
										{/* Pet thumbnail */}
										<div
											className="rounded-xl overflow-hidden shrink-0"
											style={{ width: "64px", height: "64px", background: "#F0F0F0" }}
										>
											{pet?.thumbnail ? (
												<img src={pet.thumbnail} alt={app.name} className="w-full h-full object-cover" />
											) : (
												<div className="w-full h-full flex items-center justify-center text-2xl">🐾</div>
											)}
										</div>

										{/* Info */}
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2 flex-wrap mb-0.5">
												<h3
													style={{
														fontFamily: "'Space Grotesk', sans-serif",
														fontSize: "16px",
														fontWeight: 700,
														color: "#1C1C1C",
													}}
												>
													{app.name}
												</h3>
												<span
													className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold"
													style={{ background: cfg.bg, color: cfg.color }}
												>
													<cfg.Icon className="w-3 h-3" />
													{cfg.label}
												</span>
											</div>
											<p style={{ fontSize: "12px", color: "#999" }}>
												Applied {fmtDate(app.appliedAt)}
											</p>
											{app.adminNote && (
												<p
													className="mt-1 text-xs px-2.5 py-1 rounded-lg inline-block"
													style={{ background: "#FFF7ED", color: "#92400E" }}
												>
													Note from shelter: {app.adminNote}
												</p>
											)}
										</div>

										{/* Actions */}
										<div className="flex items-center gap-2 shrink-0">
											{pet && (
												<Link
													href={`/pets/${app.petId}`}
													className="flex items-center gap-1 text-xs font-semibold hover:underline"
													style={{ color: "#7AADA1" }}
												>
													View pet <ExternalLink className="w-3 h-3" />
												</Link>
											)}
											<button
												onClick={() => toggleExpand(app.id!)}
												className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:opacity-80"
												style={{
													background: isOpen ? "#7AADA1" : "#F0F0F0",
													color: isOpen ? "#fff" : "#555",
												}}
											>
												{isOpen ? (
													<><ChevronUp className="w-3.5 h-3.5" /> Hide</>
												) : (
													<><ChevronDown className="w-3.5 h-3.5" /> Details</>
												)}
											</button>
										</div>
									</div>

									{/* ── Expanded form details ── */}
									{isOpen && (
										<div
											className="px-5 pb-6 pt-2 border-t"
											style={{ borderColor: "#F0F0F0", background: "#FAFAFA" }}
										>
											<FormDetails app={app} />
										</div>
									)}
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}

// ── Form details accordion content ────────────────────────────────────────────

function FormDetails({ app }: { app: AdoptionApplication }) {
	const hasApplicantInfo =
		app.applicantFullName || app.applicantAddress || app.applicantPhone ||
		app.applicantEmail || app.applicantDateOfBirth || app.employmentStatus;

	const hasLivingInfo =
		app.housingType || app.homeType || app.lengthAtAddress ||
		app.planningToMove || app.householdAgreement || app.householdAllergies != null;

	const hasAdoptionInfo = app.reasonForAdopting || app.petWillStay || app.message;

	return (
		<div className="space-y-6 mt-4">

			{/* ── Applicant Information ── */}
			{hasApplicantInfo ? (
				<Section title="Applicant Information">
					<Row label="Full Name" value={app.applicantFullName} />
					<Row label="Email" value={app.applicantEmail} />
					<Row label="Phone" value={app.applicantPhone} />
					<Row
						label="Address"
						value={[
							app.applicantAddress,
							app.applicantApartment && `Unit ${app.applicantApartment}`,
							app.applicantCity,
							app.applicantState,
							app.applicantZipCode,
						].filter(Boolean).join(", ")}
					/>
					<Row label="Date of Birth" value={app.applicantDateOfBirth} />
					<Row label="Age" value={app.applicantAge} />
					<Row label="ID / License #" value={app.applicantIdLicense} />
					<Row label="Spouse / Partner" value={app.spousePartnerName} />
					<Row
						label="Employment"
						value={
							app.employmentStatus
								? {
										"full-time": "Employed full-time",
										"part-time": "Employed part-time",
										unemployed: "Unemployed",
										student: "Student",
										retired: "Retired",
								  }[app.employmentStatus]
								: undefined
						}
					/>
				</Section>
			) : null}

			{/* ── Living Arrangement ── */}
			{hasLivingInfo ? (
				<Section title="Living Arrangement">
					<Row
						label="Housing"
						value={
							app.housingType === "rent"
								? "Rents home"
								: app.housingType === "own"
								? "Owns home"
								: app.housingType === "parents"
								? "Lives with parents"
								: undefined
						}
					/>
					{app.housingType === "rent" && (
						<>
							<Row
								label="Landlord allows pets"
								value={
									app.landlordAllowsPets === "yes"
										? `Yes (up to ${app.landlordAllowsHowMany || "?"} pets)`
										: app.landlordAllowsPets === "no"
										? "No"
										: app.landlordAllowsPets === "not-sure"
										? "Not sure"
										: undefined
								}
							/>
							<Row label="Landlord contact" value={app.landlordContact} />
						</>
					)}
					<Row
						label="Home type"
						value={
							app.homeType
								? {
										house: "House",
										condo: "Condo",
										"mobile-home": "Mobile home",
										apartment: "Apartment",
										other: app.otherHomeType || "Other",
								  }[app.homeType]
								: undefined
						}
					/>
					<Row label="Time at address" value={app.lengthAtAddress} />
					<Row label="Planning to move?" value={app.planningToMove} />
					<Row label="Household agreement" value={app.householdAgreement} />
					<Row
						label="Household allergies"
						value={
							app.householdAllergies === true
								? "Yes"
								: app.householdAllergies === false
								? "No"
								: undefined
						}
					/>
				</Section>
			) : null}

			{/* ── About the Adoption ── */}
			{hasAdoptionInfo ? (
				<Section title="About the Adoption">
					<Row label="Reason for adopting" value={app.reasonForAdopting || app.message} multiline />
					<Row label="Where pet will stay" value={app.petWillStay} multiline />
				</Section>
			) : null}

			{/* Fallback if no form data stored (old applications) */}
			{!hasApplicantInfo && !hasLivingInfo && !hasAdoptionInfo && (
				<p style={{ fontSize: "13px", color: "#aaa" }}>
					No detailed form data was submitted with this application.
				</p>
			)}
		</div>
	);
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<div>
			<p
				style={{
					fontFamily: "'Space Grotesk', sans-serif",
					fontSize: "11px",
					fontWeight: 700,
					color: "#7AADA1",
					letterSpacing: "0.08em",
					textTransform: "uppercase",
					marginBottom: "10px",
				}}
			>
				{title}
			</p>
			<div
				className="rounded-xl divide-y"
				style={{ background: "#fff", border: "1px solid #EBEBEB", divideColor: "#F5F5F5" }}
			>
				{children}
			</div>
		</div>
	);
}

function Row({
	label,
	value,
	multiline = false,
}: {
	label: string;
	value: string | undefined | null;
	multiline?: boolean;
}) {
	const hasValue = value?.trim();
	return (
		<div
			className="flex gap-3 px-4 py-2.5"
			style={{ borderColor: "#F5F5F5" }}
		>
			<span
				style={{
					fontFamily: "'Space Grotesk', sans-serif",
					fontSize: "12px",
					color: "#999",
					minWidth: "140px",
					paddingTop: multiline ? "1px" : undefined,
				}}
			>
				{label}
			</span>
			<span
				style={{
					fontFamily: "'Poppins', sans-serif",
					fontSize: "13px",
					color: hasValue ? "#1C1C1C" : "#ccc",
					whiteSpace: multiline ? "pre-line" : undefined,
					flex: 1,
				}}
			>
				{hasValue ? value : "—"}
			</span>
		</div>
	);
}
