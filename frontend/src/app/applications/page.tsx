"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
	FileSignature,
	CheckCircle,
	X,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { contractsApi } from "@/lib/api";
import type { Contract } from "@/lib/api";
import api from "@/lib/api";
import type { AdoptionApplication, Pet } from "@/types";

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

const contractStatusConfig: Record<
	string,
	{ label: string; color: string; bg: string; Icon: typeof Clock }
> = {
	active: {
		label: "Active",
		color: "#216959",
		bg: "#E8F4F1",
		Icon: CheckCircle,
	},
	pending_signature: {
		label: "Pending Signature",
		color: "#C4857A",
		bg: "#FAF0EE",
		Icon: Clock,
	},
	expired: {
		label: "Expired",
		color: "#999",
		bg: "#F4F4F4",
		Icon: XCircle,
	},
	terminated: {
		label: "Terminated",
		color: "#888",
		bg: "#F4F4F4",
		Icon: XCircle,
	},
};

const tabs = ["All", "Pending", "Approved", "Rejected", "Completed"];

function formatDate(dateValue: unknown): string {
	if (!dateValue) return "N/A";
	try {
		if (typeof dateValue === "object" && dateValue !== null && "_seconds" in dateValue) {
			const ts = dateValue as { _seconds: number };
			return new Date(ts._seconds * 1000).toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
				year: "numeric",
			});
		}
		const date = new Date(dateValue as string);
		if (isNaN(date.getTime())) return "N/A";
		return date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	} catch {
		return "N/A";
	}
}

function fmt(val: string | undefined | null) {
	return val?.trim() || <span style={{ color: "#bbb" }}>\u2014</span>;
}

function ContractModal({
	contract,
	onClose,
	onSign,
}: {
	contract: Contract;
	onClose: () => void;
	onSign: () => void;
}) {
	const sc = contractStatusConfig[contract.status] || contractStatusConfig.pending_signature;

	return (
		<div
			className="fixed inset-0 flex items-center justify-center z-50"
			style={{ background: "rgba(0,0,0,0.4)" }}
			onClick={onClose}
		>
			<div
				className="w-[600px] max-h-[85vh] overflow-y-auto rounded-2xl p-6"
				style={{ background: "#fff" }}
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex items-center justify-between mb-6">
					<div>
						<h3
							style={{
								fontFamily: "'Space Grotesk', sans-serif",
								fontSize: "20px",
								fontWeight: 700,
								color: "#1C1C1C",
							}}
						>
							Adoption Contract
						</h3>
						<p style={{ fontSize: "12px", color: "#aaa" }}>{contract.id}</p>
					</div>
					<button
						onClick={onClose}
						className="size-8 rounded-lg flex items-center justify-center hover:bg-gray-100"
					>
						<X className="size-4" style={{ color: "#888" }} />
					</button>
				</div>

				<div
					className="rounded-2xl p-5 mb-5 text-center relative overflow-hidden"
					style={{
						background: "linear-gradient(135deg, #7AADA1, #216959)",
						color: "#fff",
					}}
				>
					<FileSignature className="absolute -right-4 -top-4 size-20 opacity-10" />
					<p
						style={{
							fontSize: "11px",
							opacity: 0.8,
							letterSpacing: "0.1em",
							textTransform: "uppercase",
						}}
					>
						Adoption Agreement
					</p>
					<p
						style={{
							fontFamily: "'Space Grotesk', sans-serif",
							fontSize: "24px",
							fontWeight: 700,
							marginTop: "4px",
						}}
					>
						{contract.petName}
					</p>
					<span
						className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold"
						style={{ background: "rgba(255,255,255,0.2)" }}
					>
						{sc.label}
					</span>
				</div>

				<div className="grid grid-cols-2 gap-4 mb-5">
					{[
						{ label: "Adopter", value: contract.adopter },
						{ label: "Email", value: contract.adopterEmail },
						{ label: "Shelter", value: contract.shelter },
						{ label: "Adoption Date", value: contract.adoptionDate },
						{
							label: "Signed by Adopter",
							value: contract.adopterSignedAt ?? "Not yet",
						},
						{
							label: "Signed by Shelter",
							value: contract.shelterSignedAt ?? "Not yet",
						},
						{ label: "Expiry Date", value: contract.expiresAt },
						{
							label: "Signature Hash",
							value: contract.contractHash
								? `${contract.contractHash.slice(0, 12)}...`
								: "N/A",
						},
					].map((item) => (
						<div
							key={item.label}
							className="p-3 rounded-xl"
							style={{ background: "#F9F6F2" }}
						>
							<p
								style={{
									fontSize: "10px",
									fontWeight: 600,
									color: "#aaa",
									textTransform: "uppercase",
									letterSpacing: "0.08em",
								}}
							>
								{item.label}
							</p>
							<p
								style={{
									fontSize: "13px",
									fontWeight: 500,
									color: "#1C1C1C",
									marginTop: "4px",
								}}
							>
								{item.value}
							</p>
						</div>
					))}
				</div>

				<div className="rounded-xl p-4 mb-5" style={{ background: "#F9F6F2" }}>
					<p
						style={{
							fontSize: "12px",
							fontWeight: 600,
							color: "#666",
							marginBottom: "8px",
						}}
					>
						Contract Terms (Summary)
					</p>
					<ul className="space-y-1.5">
						{[
							"The adopter agrees to provide a safe and loving home for the pet.",
							"Regular veterinary care must be maintained.",
							"The pet may not be re-homed without shelter approval.",
							"The shelter reserves the right to conduct welfare checks.",
							"This agreement is binding for the duration shown above.",
						].map((term, i) => (
							<li
								key={i}
								className="flex items-start gap-2"
								style={{ fontSize: "12px", color: "#555" }}
							>
								<span style={{ color: "#7AADA1", fontWeight: 700 }}>·</span> {term}
							</li>
						))}
					</ul>
				</div>

				<div className="flex gap-3">
					{contract.status === "pending_signature" && (
						<button
							onClick={onSign}
							className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white"
							style={{
								background: "linear-gradient(135deg, #7AADA1, #216959)",
							}}
						>
							<FileSignature className="size-4" /> Sign Contract
						</button>
					)}
					{contract.status === "active" && (
						<button
							className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white"
							style={{
								background: "linear-gradient(135deg, #22c55e, #16a34a)",
							}}
						>
							<CheckCircle className="size-4" /> Contract Signed
						</button>
					)}
					<button
						onClick={onClose}
						className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-border hover:bg-secondary transition-colors"
					>
						Close
					</button>
				</div>
			</div>
		</div>
	);
}

export default function ApplicationsPage() {
	const router = useRouter();
	const { user, loading: authLoading } = useAuth();

	const [applications, setApplications] = useState<AdoptionApplication[]>([]);
	const [contracts, setContracts] = useState<Contract[]>([]);
	const [pets, setPets] = useState<Record<string, Pet>>({});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState("All");
	const [expanded, setExpanded] = useState<Set<string>>(new Set());
	const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

	useEffect(() => {
		if (!authLoading && !user) router.push("/login");
	}, [user, authLoading, router]);

	useEffect(() => {
		if (!user) return;

		const fetchData = async () => {
			setLoading(true);
			setError(null);
			try {
				const [appsRes, contractsRes] = await Promise.all([
					api.get(`/applications?adopterId=${user.id}`),
					contractsApi.getAll(),
				]);

				const apps: AdoptionApplication[] = appsRes.data.data || [];
				apps.sort(
					(a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
				);
				setApplications(apps);

				if (contractsRes.data.success) {
					setContracts(contractsRes.data.data);
				}

				const uniquePetIds = Array.from(new Set(apps.map((a) => a.petId)));
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
				setError("Failed to load your applications");
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [user]);

	const filteredApplications = applications.filter((app) => {
		if (activeTab === "All") return true;
		return app.status === activeTab.toLowerCase();
	});

	const getContractForApplication = (appId: string): Contract | undefined => {
		return contracts.find((c) => c.applicationId === appId);
	};

	const handleSignContract = (contractId: string) => {
		setSelectedContract(null);
		router.push(`/contract/${contractId}/sign`);
	};

	const toggleExpand = (id: string) =>
		setExpanded((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});

	if (authLoading) {
		return (
			<div
				className="min-h-screen"
				style={{ background: "#F9F6F2", fontFamily: "'Poppins', sans-serif" }}
			>
				<Navbar />
				<div className="flex items-center justify-center" style={{ height: "60vh" }}>
					<Loader2 className="w-8 h-8 animate-spin" style={{ color: "#7AADA1" }} />
				</div>
			</div>
		);
	}

	if (!user) return null;

	return (
		<div
			className="min-h-screen"
			style={{ background: "#F9F6F2", fontFamily: "'Poppins', sans-serif" }}
		>
			<Navbar />

			<div className="max-w-3xl mx-auto px-5 py-10">
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
						Track your adoption applications and sign contracts.
					</p>
				</div>

				<div className="flex gap-2 mb-6 overflow-x-auto pb-2">
					{tabs.map((tab) => (
						<button
							key={tab}
							onClick={() => setActiveTab(tab)}
							className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
								activeTab === tab
									? "bg-primary text-primary-foreground"
									: "bg-secondary text-muted-foreground hover:bg-secondary/80"
							}`}
						>
							{tab}
							{tab !== "All" && (
								<span className="ml-1.5 opacity-70">
									(
									{
										applications.filter((a) => a.status === tab.toLowerCase())
											.length
									}
									)
								</span>
							)}
						</button>
					))}
				</div>

				{error && (
					<div
						className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4"
						style={{ fontSize: "14px" }}
					>
						{error}
					</div>
				)}

				{loading ? (
					<div className="flex items-center justify-center py-20">
						<Loader2 className="w-7 h-7 animate-spin" style={{ color: "#7AADA1" }} />
					</div>
				) : filteredApplications.length === 0 ? (
					<div
						className="rounded-2xl flex flex-col items-center justify-center py-20 px-8 text-center"
						style={{
							background: "#fff",
							boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
						}}
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
						<p
							style={{
								color: "#888",
								fontSize: "14px",
								marginBottom: "24px",
								maxWidth: "320px",
							}}
						>
							{activeTab === "All"
								? "You haven't applied to adopt any pets. Browse available pets and start your journey!"
								: `No ${activeTab.toLowerCase()} applications found.`}
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
					<div className="flex flex-col gap-4">
						{filteredApplications.map((app) => {
							const pet = pets[app.petId];
							const cfg = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.pending;
							const isOpen = expanded.has(app.id!);
							const contract = getContractForApplication(app.id!);

							return (
								<div
									key={app.id}
									className="rounded-2xl overflow-hidden"
									style={{
										background: "#fff",
										boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
										border: "1px solid #F0F0F0",
									}}
								>
									<div className="flex items-center gap-4 px-5 py-4">
										<div
											className="relative rounded-xl overflow-hidden shrink-0"
											style={{
												width: "64px",
												height: "64px",
												background: "#F0F0F0",
											}}
										>
											{pet?.thumbnail ? (
												<Image
													src={pet.thumbnail}
													alt={app.name}
													fill
													className="object-cover"
												/>
											) : (
												<div className="w-full h-full flex items-center justify-center text-2xl">
													🐾
												</div>
											)}
										</div>

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
													style={{
														background: cfg.bg,
														color: cfg.color,
													}}
												>
													<cfg.Icon className="w-3 h-3" />
													{cfg.label}
												</span>
											</div>
											<p style={{ fontSize: "12px", color: "#999" }}>
												Applied {formatDate(app.appliedAt)}
											</p>
											{app.adminNote && (
												<p
													className="mt-1 text-xs px-2.5 py-1 rounded-lg inline-block"
													style={{
														background: "#FFF7ED",
														color: "#92400E",
													}}
												>
													Note from shelter: {app.adminNote}
												</p>
											)}
										</div>

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
											{app.status === "approved" && contract && (
												<button
													onClick={() => setSelectedContract(contract)}
													className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:opacity-80"
													style={{
														background: "#E8F4F1",
														color: "#216959",
													}}
												>
													<FileText className="w-3.5 h-3.5" /> Contract
												</button>
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
													<>
														<ChevronUp className="w-3.5 h-3.5" /> Hide
													</>
												) : (
													<>
														<ChevronDown className="w-3.5 h-3.5" />{" "}
														Details
													</>
												)}
											</button>
										</div>
									</div>

									{isOpen && (
										<div
											className="px-5 pb-6 pt-2 border-t"
											style={{
												borderColor: "#F0F0F0",
												background: "#FAFAFA",
											}}
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

			{selectedContract && (
				<ContractModal
					contract={selectedContract}
					onClose={() => setSelectedContract(null)}
					onSign={() => handleSignContract(selectedContract.id)}
				/>
			)}
		</div>
	);
}

function FormDetails({ app }: { app: AdoptionApplication }) {
	const hasApplicantInfo =
		app.applicantFullName ||
		app.applicantAddress ||
		app.applicantPhone ||
		app.applicantEmail ||
		app.applicantDateOfBirth ||
		app.employmentStatus;

	const hasLivingInfo =
		app.housingType ||
		app.homeType ||
		app.lengthAtAddress ||
		app.planningToMove ||
		app.householdAgreement ||
		app.householdAllergies != null;

	const hasAdoptionInfo = app.reasonForAdopting || app.petWillStay || app.message;

	return (
		<div className="space-y-6 mt-4">
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
						]
							.filter(Boolean)
							.join(", ")}
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

			{hasAdoptionInfo ? (
				<Section title="About the Adoption">
					<Row
						label="Reason for adopting"
						value={app.reasonForAdopting || app.message}
						multiline
					/>
					<Row label="Where pet will stay" value={app.petWillStay} multiline />
				</Section>
			) : null}

			{!hasApplicantInfo && !hasLivingInfo && !hasAdoptionInfo && (
				<p style={{ fontSize: "13px", color: "#aaa" }}>
					No detailed form data was submitted with this application.
				</p>
			)}
		</div>
	);
}

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
				style={{
					background: "#fff",
					border: "1px solid #EBEBEB",
				}}
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
		<div className="flex gap-3 px-4 py-2.5">
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
				{hasValue ? value : "\u2014"}
			</span>
		</div>
	);
}
