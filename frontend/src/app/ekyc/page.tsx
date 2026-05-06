"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { ekycApi } from "@/lib/ekycApi";
import { KycStatusResponse } from "@/types";
import { EKYCHero } from "./sections/EKYCHero";
import { EKYCStats } from "./sections/EKYCStats";
import { EKYCHowItWorks } from "./sections/EKYCHowItWorks";
import { EKYCWhy } from "./sections/EKYCWhy";
import { EKYCFooter } from "./sections/EKYCFooter";
import { EKYCForm } from "./components/Form/EKYCForm";
import { CheckIcon, ClockIcon, PawLogo } from "@/assets/icons/ekyc-icons";

export default function EKYCPage() {
	const router = useRouter();
	const { user, loading: authLoading } = useAuth();

	const [kycStatus, setKycStatus] = useState<KycStatusResponse | null>(null);
	const [statusLoading, setStatusLoading] = useState(true);
	const [success, setSuccess] = useState(false);

	useEffect(() => {
		if (!authLoading && !user) {
			router.push("/login?redirect=/ekyc");
			return;
		}
		if (user) {
			fetchKycStatus();
		}
	}, [user, authLoading, router]);

	const fetchKycStatus = async () => {
		try {
			const status = await ekycApi.getMyStatus();
			setKycStatus(status);
		} catch {
			// Not an error - user may not have submitted yet
		} finally {
			setStatusLoading(false);
		}
	};

	if (statusLoading) {
		return (
			<div
				className="flex flex-col min-h-screen w-full items-center justify-center"
				style={{ fontFamily: "'Poppins', sans-serif", background: "#F9F6F2" }}
			>
				<p style={{ color: "#666", fontSize: "14px" }}>Loading...</p>
			</div>
		);
	}

	if (!authLoading && !user) {
		return null;
	}

	const isApproved = kycStatus?.kyc?.status === "approved" || kycStatus?.user?.isKycVerified;
	const isPending = kycStatus?.kyc?.status === "pending";

	if (isApproved) {
		return (
			<div
				className="flex flex-col min-h-screen w-full"
				style={{ fontFamily: "'Poppins', sans-serif" }}
			>
				<Navbar activeLink="eKYC" />
				<div
					className="flex flex-1 items-center justify-center"
					style={{ background: "#F9F6F2" }}
				>
					<div className="text-center px-6">
						<div
							style={{
								width: "80px",
								height: "80px",
								borderRadius: "50%",
								background: "#22c55e",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								margin: "0 auto 24px",
							}}
						>
							<CheckIcon className="w-10 h-10" style={{ color: "#fff" }} />
						</div>
						<h2
							style={{
								color: "#1C1C1C",
								fontFamily: "'Space Grotesk', sans-serif",
								fontSize: "24px",
								fontWeight: 700,
								marginBottom: "12px",
							}}
						>
							You are already verified!
						</h2>
						<p style={{ color: "#666", fontSize: "14px", marginBottom: "24px" }}>
							Your eKYC verification has been approved. You can now browse and apply
							for pet adoptions.
						</p>
						<Link
							href="/pets"
							style={{
								display: "inline-block",
								padding: "12px 28px",
								borderRadius: "12px",
								background: "#7AADA1",
								color: "#fff",
								fontFamily: "'Space Grotesk', sans-serif",
								fontSize: "14px",
								fontWeight: 600,
								textDecoration: "none",
							}}
						>
							Browse Pets
						</Link>
					</div>
				</div>
			</div>
		);
	}

	if (isPending) {
		return (
			<div
				className="flex flex-col min-h-screen w-full"
				style={{ fontFamily: "'Poppins', sans-serif" }}
			>
				<Navbar activeLink="eKYC" />
				<div
					className="flex flex-1 items-center justify-center"
					style={{ background: "#F9F6F2" }}
				>
					<div className="text-center px-6">
						<div
							style={{
								width: "80px",
								height: "80px",
								borderRadius: "50%",
								background: "#f59e0b",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								margin: "0 auto 24px",
							}}
						>
							<ClockIcon className="w-10 h-10" style={{ color: "#fff" }} />
						</div>
						<h2
							style={{
								color: "#1C1C1C",
								fontFamily: "'Space Grotesk', sans-serif",
								fontSize: "24px",
								fontWeight: 700,
								marginBottom: "12px",
							}}
						>
							Verification Pending
						</h2>
						<p style={{ color: "#666", fontSize: "14px", marginBottom: "24px" }}>
							Your eKYC submission is being reviewed. You will receive an email
							notification once the review is complete.
						</p>
						{kycStatus?.kyc?.rejectionReason && (
							<div
								style={{
									background: "#fef2f2",
									border: "1px solid #fecaca",
									borderRadius: "12px",
									padding: "16px",
									maxWidth: "400px",
									margin: "0 auto 24px",
								}}
							>
								<p
									style={{
										color: "#991b1b",
										fontSize: "13px",
										fontWeight: 600,
										marginBottom: "4px",
									}}
								>
									Previous rejection reason:
								</p>
								<p style={{ color: "#7f1d1d", fontSize: "13px" }}>
									{kycStatus.kyc.rejectionReason}
								</p>
							</div>
						)}
						<Link
							href="/pets"
							style={{
								display: "inline-block",
								padding: "12px 28px",
								borderRadius: "12px",
								background: "#7AADA1",
								color: "#fff",
								fontFamily: "'Space Grotesk', sans-serif",
								fontSize: "14px",
								fontWeight: 600,
								textDecoration: "none",
							}}
						>
							Browse Pets
						</Link>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div
			className="flex flex-col min-h-screen w-full"
			style={{ fontFamily: "'Poppins', sans-serif" }}
		>
			<Navbar activeLink="eKYC" />
			<EKYCHero />
			<EKYCStats />
			<EKYCHowItWorks />
			<EKYCWhy />

			<section
				id="start-verification"
				className="px-6 md:px-10 lg:px-20 py-20 md:py-28"
				style={{ background: "#fff" }}
			>
				<div className="max-w-4xl mx-auto">
					<p
						className="font-semibold mb-2 text-center tracking-widest"
						style={{ color: "#7AADA1", fontSize: "11px", letterSpacing: "0.14em" }}
					>
						GET STARTED
					</p>
					<h2
						className="font-bold mb-4 text-center"
						style={{
							color: "#111",
							fontFamily: "'Space Grotesk', sans-serif",
							fontSize: "clamp(22px, 3vw, 32px)",
						}}
					>
						Begin Your Verification
					</h2>
					<p
						className="mb-12 text-center"
						style={{
							color: "#888",
							fontSize: "14px",
							maxWidth: "460px",
							margin: "0 auto 48px",
						}}
					>
						Fill in your basic details to start the eKYC process. You&apos;ll need a
						valid ID and your phone number.
					</p>

					{success ? (
						<div
							className="text-center"
							style={{
								background: "#F9F6F2",
								borderRadius: "24px",
								padding: "60px 40px",
							}}
						>
							<div
								style={{
									width: "80px",
									height: "80px",
									borderRadius: "50%",
									background: "#22c55e",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									margin: "0 auto 24px",
								}}
							>
								<CheckIcon className="w-10 h-10" style={{ color: "#fff" }} />
							</div>
							<h3
								style={{
									fontFamily: "'Space Grotesk', sans-serif",
									fontSize: "24px",
									fontWeight: 700,
									color: "#1C1C1C",
									marginBottom: "12px",
								}}
							>
								Verification Submitted!
							</h3>
							<p
								style={{
									color: "#666",
									fontSize: "14px",
									maxWidth: "400px",
									margin: "0 auto 24px",
									lineHeight: "1.7",
								}}
							>
								Your eKYC documents have been submitted for review. You will receive
								an email notification once the verification is complete.
							</p>
							<Link
								href="/pets"
								style={{
									display: "inline-block",
									padding: "12px 28px",
									borderRadius: "12px",
									background: "#7AADA1",
									color: "#fff",
									fontFamily: "'Space Grotesk', sans-serif",
									fontSize: "14px",
									fontWeight: 600,
									textDecoration: "none",
								}}
							>
								Browse Pets
							</Link>
						</div>
					) : (
						<EKYCForm onSuccess={() => setSuccess(true)} />
					)}
				</div>
			</section>

			<EKYCFooter />
		</div>
	);
}
