"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { contractsApi, Contract } from "@/lib/api";
import { Navbar } from "@/components/Navbar";
import { FileSignature, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function SignContractPage() {
	const { user, loading: authLoading } = useAuth();
	const router = useRouter();
	const params = useParams();
	const contractId = params.id as string;

	const [contract, setContract] = useState<Contract | null>(null);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [agreed, setAgreed] = useState(false);
	const [signedName, setSignedName] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	useEffect(() => {
		if (!authLoading && !user) {
			router.push("/login");
		} else if (!authLoading && user && user.role !== "adopter") {
			router.push("/ekyc");
		}
	}, [authLoading, user, router]);

	useEffect(() => {
		if (user && contractId) {
			const fetchContract = async () => {
				try {
					setLoading(true);
					const response = await contractsApi.getById(contractId);
					if (response.data.success) {
						setContract(response.data.data);
					}
				} catch (err) {
					setError("Failed to load contract");
					console.error(err);
				} finally {
					setLoading(false);
				}
			};
			fetchContract();
		}
	}, [user, contractId]);

	const handleSign = async () => {
		if (!agreed || !signedName.trim()) {
			setError("Please agree to the terms and provide your signature");
			return;
		}

		setSubmitting(true);
		setError(null);

		try {
			const hash = btoa(`${contractId}-${user?.id}-${Date.now()}`);
			await contractsApi.sign(contractId, {
				role: "adopter",
				contractHash: hash,
				signedName: signedName,
			});
			setSuccess(true);
		} catch (err) {
			setError("Failed to sign contract");
			console.error(err);
		} finally {
			setSubmitting(false);
		}
	};

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

	if (!user || !contract) {
		return (
			<div className="min-h-screen bg-background">
				<Navbar />
				<div className="flex items-center justify-center min-h-[60vh]">
					<p className="text-muted-foreground">Contract not found</p>
				</div>
			</div>
		);
	}

	if (success) {
		return (
			<div className="min-h-screen bg-background">
				<Navbar />
				<div className="max-w-lg mx-auto px-4 py-16 text-center">
					<div className="size-20 rounded-full bg-success/15 mx-auto mb-6 flex items-center justify-center">
						<CheckCircle2 className="size-10 text-success" />
					</div>
					<h1
						style={{
							fontFamily: "'Space Grotesk', sans-serif",
							fontSize: "28px",
							fontWeight: 700,
							color: "#1C1C1C",
						}}
					>
						Contract Signed!
					</h1>
					<p className="text-muted-foreground mt-2 mb-8">
						You have successfully signed the adoption contract for {contract.petName}.
						The shelter will now sign to complete the adoption.
					</p>
					<div className="flex gap-3 justify-center">
						<button
							onClick={() => router.push("/applications")}
							className="px-6 py-3 rounded-xl font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
						>
							View My Applications
						</button>
						<button
							onClick={() => router.push("/")}
							className="px-6 py-3 rounded-xl font-medium border border-border hover:bg-secondary transition-colors"
						>
							Go Home
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			<Navbar />
			<div className="max-w-2xl mx-auto px-4 py-8">
				<div className="flex items-center gap-3 mb-8">
					<div
						className="size-10 rounded-xl flex items-center justify-center"
						style={{ background: "#E8F4F1" }}
					>
						<FileSignature className="size-5" style={{ color: "#7AADA1" }} />
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
							Sign Adoption Contract
						</h1>
						<p style={{ color: "#888", fontSize: "13px" }}>
							Review and sign your adoption agreement for {contract.petName}
						</p>
					</div>
				</div>

				{error && (
					<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
						{error}
					</div>
				)}

				<div className="bg-card border border-border rounded-2xl p-6 mb-6">
					<div
						className="rounded-2xl p-6 mb-6 text-center"
						style={{
							background: "linear-gradient(135deg, #7AADA1, #216959)",
							color: "#fff",
						}}
					>
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
					</div>

					<div className="grid grid-cols-2 gap-4 mb-6">
						<div className="p-3 rounded-xl" style={{ background: "#F9F6F2" }}>
							<p
								style={{
									fontSize: "10px",
									fontWeight: 600,
									color: "#aaa",
									textTransform: "uppercase",
								}}
							>
								Adopter
							</p>
							<p style={{ fontSize: "13px", fontWeight: 500, marginTop: "4px" }}>
								{contract.adopter}
							</p>
						</div>
						<div className="p-3 rounded-xl" style={{ background: "#F9F6F2" }}>
							<p
								style={{
									fontSize: "10px",
									fontWeight: 600,
									color: "#aaa",
									textTransform: "uppercase",
								}}
							>
								Shelter
							</p>
							<p style={{ fontSize: "13px", fontWeight: 500, marginTop: "4px" }}>
								{contract.shelter}
							</p>
						</div>
						<div className="p-3 rounded-xl" style={{ background: "#F9F6F2" }}>
							<p
								style={{
									fontSize: "10px",
									fontWeight: 600,
									color: "#aaa",
									textTransform: "uppercase",
								}}
							>
								Adoption Date
							</p>
							<p style={{ fontSize: "13px", fontWeight: 500, marginTop: "4px" }}>
								{contract.adoptionDate}
							</p>
						</div>
						<div className="p-3 rounded-xl" style={{ background: "#F9F6F2" }}>
							<p
								style={{
									fontSize: "10px",
									fontWeight: 600,
									color: "#aaa",
									textTransform: "uppercase",
								}}
							>
								Expires
							</p>
							<p style={{ fontSize: "13px", fontWeight: 500, marginTop: "4px" }}>
								{contract.expiresAt}
							</p>
						</div>
					</div>

					<div className="rounded-xl p-4 mb-6" style={{ background: "#F9F6F2" }}>
						<p
							style={{
								fontSize: "12px",
								fontWeight: 600,
								color: "#666",
								marginBottom: "8px",
							}}
						>
							Terms and Conditions
						</p>
						<ul className="space-y-2 text-sm text-muted-foreground">
							<li className="flex items-start gap-2">
								<span style={{ color: "#7AADA1", fontWeight: 700 }}>·</span> The
								adopter agrees to provide a safe and loving home for the pet.
							</li>
							<li className="flex items-start gap-2">
								<span style={{ color: "#7AADA1", fontWeight: 700 }}>·</span> Regular
								veterinary care must be maintained.
							</li>
							<li className="flex items-start gap-2">
								<span style={{ color: "#7AADA1", fontWeight: 700 }}>·</span> The pet
								may not be re-homed without shelter approval.
							</li>
							<li className="flex items-start gap-2">
								<span style={{ color: "#7AADA1", fontWeight: 700 }}>·</span> The
								shelter reserves the right to conduct welfare checks.
							</li>
							<li className="flex items-start gap-2">
								<span style={{ color: "#7AADA1", fontWeight: 700 }}>·</span> This
								agreement is binding for the duration shown above.
							</li>
						</ul>
					</div>
				</div>

				<div className="bg-card border border-border rounded-2xl p-6">
					<h3 className="font-semibold text-lg mb-4">Your Signature</h3>

					<label className="flex items-start gap-3 mb-4 cursor-pointer">
						<input
							type="checkbox"
							checked={agreed}
							onChange={(e) => setAgreed(e.target.checked)}
							className="mt-1 size-4 rounded border-border text-primary focus:ring-primary"
						/>
						<span className="text-sm text-muted-foreground">
							I have read and agree to the terms and conditions of this adoption
							contract. I understand that this is a legally binding agreement.
						</span>
					</label>

					<div className="mb-6">
						<label className="block text-sm font-medium mb-2">
							Digital Signature <span className="text-destructive">*</span>
						</label>
						<input
							type="text"
							value={signedName}
							onChange={(e) => setSignedName(e.target.value)}
							placeholder="Type your full legal name to sign"
							className="w-full px-4 py-3 rounded-xl border border-border bg-background text-2xl"
						/>
						<p className="text-xs text-muted-foreground mt-1">
							By typing your name, you agree that this serves as your legal signature.
						</p>
					</div>

					<button
						onClick={handleSign}
						disabled={submitting || !agreed || !signedName.trim()}
						className="w-full py-3 rounded-xl font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						style={{ background: "linear-gradient(135deg, #7AADA1, #216959)" }}
					>
						{submitting ? (
							<span className="flex items-center justify-center gap-2">
								<Loader2 className="size-5 animate-spin" /> Signing...
							</span>
						) : (
							<span className="flex items-center justify-center gap-2">
								<FileSignature className="size-5" /> Sign Contract
							</span>
						)}
					</button>
				</div>

				<p className="text-center text-xs text-muted-foreground mt-4">
					Contract ID: {contractId}
				</p>
			</div>
		</div>
	);
}
