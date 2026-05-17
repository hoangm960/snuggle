import Image from "next/image";
import { VerifiedBadge } from "@/assets/icons/ekyc-icons";

interface FormData {
	fullName: string;
	dateOfBirth: string;
	idNumber: string;
	phone: string;
}

interface EKYCStepConfirmProps {
	formData: FormData;
	idFile: File | null;
	financialFile: File | null;
	otpCode: string;
	otpVerified: boolean;
	otpSent: boolean;
	otpLoading: boolean;
	onOtpCodeChange: (code: string) => void;
	onSendOtp: () => void;
}

export function EKYCStepConfirm({
	formData,
	idFile,
	financialFile,
	otpCode,
	otpVerified,
	otpSent,
	otpLoading,
	onOtpCodeChange,
	onSendOtp,
}: EKYCStepConfirmProps) {
	return (
		<div className="flex flex-col items-center gap-6 text-center">
			<div
				style={{
					width: "80px",
					height: "80px",
					borderRadius: "50%",
					background: "#216959",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					margin: "0 auto",
				}}
			>
				<Image
					src="/images/ekyc/Hand.svg"
					alt="Complete"
					width={48}
					height={48}
					unoptimized
				/>
			</div>
			<h3
				style={{
					fontFamily: "'Space Grotesk', sans-serif",
					fontSize: "20px",
					fontWeight: 700,
					color: "#1C1C1C",
				}}
			>
				Ready to Confirm
			</h3>
			<p
				style={{
					color: "#888",
					fontSize: "14px",
					maxWidth: "400px",
					lineHeight: "1.7",
				}}
			>
				Review your details, then click &quot;Submit for Verification&quot;. You&apos;ll
				receive a verification code via email to finalise the process.
			</p>

			<div
				style={{
					width: "100%",
					maxWidth: "360px",
					background: "#fff",
					borderRadius: "16px",
					padding: "20px",
					textAlign: "left",
				}}
			>
				{[
					["Full Name", formData.fullName],
					["Date of Birth", formData.dateOfBirth],
					["ID Number", formData.idNumber],
					["Phone", formData.phone],
					["ID Document", idFile?.name || "—"],
					["Financial Doc", financialFile?.name || "—"],
				].map(([label, value], i) => (
					<div
						key={i}
						style={{
							display: "flex",
							justifyContent: "space-between",
							padding: "8px 0",
							borderBottom: i < 5 ? "1px solid #f0f0f0" : "none",
						}}
					>
						<span
							style={{
								color: "#888",
								fontSize: "12px",
								fontFamily: "'Space Grotesk', sans-serif",
							}}
						>
							{label}
						</span>
						<span
							style={{
								color: "#333",
								fontSize: "12px",
								fontFamily: "'Space Grotesk', sans-serif",
								fontWeight: 500,
								textAlign: "right",
								maxWidth: "180px",
								overflow: "hidden",
								textOverflow: "ellipsis",
								whiteSpace: "nowrap",
							}}
						>
							{value}
						</span>
					</div>
				))}
			</div>

			<div
				style={{
					width: "100%",
					maxWidth: "360px",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					gap: "12px",
				}}
			>
				{!otpSent ? (
					<button
						type="button"
						onClick={onSendOtp}
						disabled={otpLoading}
						style={{
							padding: "12px 28px",
							borderRadius: "12px",
							background: "#7AADA1",
							color: "#fff",
							border: "none",
							cursor: otpLoading ? "not-allowed" : "pointer",
							fontFamily: "'Space Grotesk', sans-serif",
							fontSize: "14px",
							fontWeight: 600,
							opacity: otpLoading ? 0.6 : 1,
						}}
					>
						{otpLoading ? "Sending..." : "Send Verification Code"}
					</button>
				) : (
					<>
						<p
							style={{
								color: "#666",
								fontSize: "13px",
							}}
						>
							Enter the 6-digit code sent to your email
						</p>
						<input
							type="text"
							placeholder="Enter 6-digit code"
							value={otpCode}
							onChange={(e) =>
								onOtpCodeChange(e.target.value.replace(/\D/g, "").slice(0, 6))
							}
							maxLength={6}
							style={{
								width: "200px",
								height: "48px",
								borderRadius: "12px",
								border: "2px solid #E0E0E0",
								background: "#fff",
								textAlign: "center",
								fontSize: "24px",
								fontFamily: "'Space Grotesk', sans-serif",
								fontWeight: 700,
								letterSpacing: "8px",
								outline: "none",
							}}
						/>
						{otpVerified && (
							<span
								style={{
									color: "#22c55e",
									fontSize: "13px",
									fontWeight: 600,
								}}
							>
								Verified!
							</span>
						)}
					</>
				)}
			</div>

			<div
				style={{
					display: "flex",
					gap: "10px",
					alignItems: "center",
				}}
			>
				{[formData.fullName, formData.dateOfBirth, formData.idNumber, formData.phone].map(
					(val, i) => (
						<div
							key={i}
							style={{
								width: "10px",
								height: "10px",
								borderRadius: "50%",
								background: val ? "#7AADA1" : "#E0E0E0",
							}}
						/>
					)
				)}
			</div>
			<p style={{ fontSize: "12px", color: "#888" }}>
				{
					[
						formData.fullName,
						formData.dateOfBirth,
						formData.idNumber,
						formData.phone,
					].filter(Boolean).length
				}{" "}
				/ 4 fields completed
			</p>
		</div>
	);
}
