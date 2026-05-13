"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { applicationsApi, contractsApi, Application, Contract } from "@/lib/api";
import { Navbar } from "@/components/Navbar";
import { FileSignature, Loader2, CheckCircle, Clock, XCircle, FileText, X } from "lucide-react";

const statusConfig = {
	pending: { label: "Pending", color: "#C4857A", bg: "#FAF0EE", icon: Clock },
	approved: { label: "Approved", color: "#216959", bg: "#E8F4F1", icon: CheckCircle },
	rejected: { label: "Rejected", color: "#888", bg: "#F4F4F4", icon: XCircle },
	completed: { label: "Completed", color: "#5A78C4", bg: "#EEF3FD", icon: CheckCircle },
};

const contractStatusConfig = {
	active: { label: "Active", color: "#216959", bg: "#E8F4F1", icon: CheckCircle },
	pending_signature: { label: "Pending Signature", color: "#C4857A", bg: "#FAF0EE", icon: Clock },
	expired: { label: "Expired", color: "#999", bg: "#F4F4F4", icon: XCircle },
	terminated: { label: "Terminated", color: "#888", bg: "#F4F4F4", icon: XCircle },
};

const tabs = ["All", "Pending", "Approved", "Rejected", "Completed"];

function formatDate(dateValue: any): string {
	if (!dateValue) return "N/A";

	try {
		// Handle Firestore Timestamp object {_seconds, _nanoseconds}
		if (typeof dateValue === "object" && "_seconds" in dateValue) {
			return new Date(dateValue._seconds * 1000).toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
				year: "numeric",
			});
		}

		const date = new Date(dateValue);
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

function ContractModal({
	contract,
	onClose,
	onSign,
}: {
	contract: Contract;
	onClose: () => void;
	onSign: () => void;
}) {
	const sc = contractStatusConfig[contract.status];

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
							style={{ background: "linear-gradient(135deg, #7AADA1, #216959)" }}
						>
							<FileSignature className="size-4" /> Sign Contract
						</button>
					)}
					{contract.status === "active" && (
						<button
							className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white"
							style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
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
	const { user, loading: authLoading } = useAuth();
	const router = useRouter();

	const [applications, setApplications] = useState<Application[]>([]);
	const [contracts, setContracts] = useState<Contract[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState("All");
	const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

	useEffect(() => {
		if (!authLoading && !user) {
			router.push("/login");
		}
	}, [authLoading, user, router]);

	useEffect(() => {
		if (user) {
			const fetchData = async () => {
				try {
					setLoading(true);

					const [appsRes, contractsRes] = await Promise.all([
						applicationsApi.getMyApplications(user.uid),
						contractsApi.getAll(),
					]);

					if (appsRes.data.success) {
						setApplications(appsRes.data.data);
					}
					if (contractsRes.data.success) {
						setContracts(contractsRes.data.data);
					}
				} catch (err) {
					setError("Failed to load your applications");
					console.error(err);
				} finally {
					setLoading(false);
				}
			};
			fetchData();
		}
	}, [user]);

	if (authLoading || loading) {
		return (
			<div className="min-h-screen bg-background">
				<Navbar />
				<div className="flex items-center justify-center min-h-[60vh]">
					<Loader2 className="size-8 animate-spin text-primary" />
				</div>
			</div>
		);
	}

	if (!user) {
		return null;
	}

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

	return (
		<div className="min-h-screen bg-background">
			<Navbar />
			<div className="max-w-3xl mx-auto px-4 py-8">
				<div className="mb-8">
					<h1
						style={{
							fontFamily: "'Space Grotesk', sans-serif",
							fontSize: "24px",
							fontWeight: 700,
							color: "#1C1C1C",
						}}
					>
						My Applications
					</h1>
					<p style={{ color: "#888", fontSize: "13px" }}>
						Track your adoption applications and sign contracts
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
					<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
						{error}
					</div>
				)}

				{filteredApplications.length === 0 ? (
					<div className="text-center py-16 bg-card rounded-2xl border border-border">
						<FileText className="size-12 text-muted-foreground mx-auto mb-4" />
						<p className="text-muted-foreground">No applications found</p>
						<p className="text-sm text-muted-foreground mt-1">
							{activeTab === "All"
								? "You haven't applied for any pets yet"
								: `No ${activeTab.toLowerCase()} applications`}
						</p>
						<Link
							href="/pets"
							className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
						>
							Browse Pets
						</Link>
					</div>
				) : (
					<div className="space-y-4">
						{filteredApplications.map((app) => {
							const contract = getContractForApplication(app.id);
							const sc = statusConfig[app.status];

							return (
								<div
									key={app.id}
									className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-shadow"
								>
									<div className="flex items-start justify-between mb-4">
										<div className="flex items-center gap-4">
											<div
												className="size-14 rounded-2xl flex items-center justify-center"
												style={{ background: "#E8F4F1" }}
											>
												{app.petThumbnail ? (
													<img
														src={app.petThumbnail}
														alt={app.name}
														className="size-14 rounded-2xl object-cover"
													/>
												) : (
													<FileText
														className="size-6"
														style={{ color: "#7AADA1" }}
													/>
												)}
											</div>
											<div>
												<h3 className="font-semibold text-lg">
													{app.name}
												</h3>
												<p className="text-sm text-muted-foreground">
													{app.petSpecies || "Pet"}
												</p>
											</div>
										</div>
										<span
											className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
											style={{ background: sc.bg, color: sc.color }}
										>
											<sc.icon className="size-3" />
											{sc.label}
										</span>
									</div>

									<div className="flex items-center justify-between pt-4 border-t border-border">
										<p className="text-sm text-muted-foreground">
											Applied on {formatDate(app.appliedAt)}
										</p>

										<div className="flex items-center gap-2">
											{app.status === "approved" && (
												<>
													{contract ? (
														<button
															onClick={() =>
																setSelectedContract(contract)
															}
															className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
														>
															<FileText className="size-4" />
															View Contract
														</button>
													) : (
														<span className="text-sm text-muted-foreground">
															Contract pending...
														</span>
													)}
												</>
											)}
										</div>
									</div>
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
