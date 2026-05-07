import { ArrowLeftIcon, ArrowDownIcon, VerifiedBadge } from "@/assets/icons/ekyc-icons";

interface EKYCFormNavigationProps {
	activeStep: number;
	uploading: boolean;
	submitting: boolean;
	otpSent: boolean;
	onBack: () => void;
	onNext: () => void;
	onSubmit: () => void;
}

export function EKYCFormNavigation({
	activeStep,
	uploading,
	submitting,
	otpSent,
	onBack,
	onNext,
	onSubmit,
}: EKYCFormNavigationProps) {
	return (
		<div
			className="flex justify-between items-center mt-8 pt-6"
			style={{ borderTop: "1px solid #E8E8E8" }}
		>
			<button
				type="button"
				onClick={onBack}
				disabled={activeStep === 0}
				className="flex items-center gap-2 disabled:opacity-30 hover:opacity-70 transition-opacity"
				style={{
					background: "none",
					border: "none",
					cursor: activeStep === 0 ? "not-allowed" : "pointer",
					fontFamily: "'Space Grotesk', sans-serif",
					fontSize: "14px",
					color: "#333",
					fontWeight: 500,
				}}
			>
				<svg
					width="8"
					height="13"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<path d="M19 12H5M12 19l-7-7 7-7" />
				</svg>
				Back
			</button>

			{activeStep < 3 ? (
				<button
					type="button"
					onClick={onNext}
					disabled={uploading}
					className="flex items-center gap-2 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
					style={{
						padding: "12px 28px",
						borderRadius: "12px",
						background: "#7AADA1",
						border: "none",
						cursor: uploading ? "not-allowed" : "pointer",
						fontFamily: "'Space Grotesk', sans-serif",
						fontSize: "14px",
					}}
				>
					{uploading ? "Uploading..." : "Continue"}
					{!uploading && (
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M12 5v14M19 12l-7 7-7-7" />
						</svg>
					)}
				</button>
			) : (
				<button
					type="button"
					onClick={onSubmit}
					disabled={submitting || !otpSent}
					className="flex items-center gap-2 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
					style={{
						padding: "12px 28px",
						borderRadius: "12px",
						background: "#216959",
						border: "none",
						cursor: submitting || !otpSent ? "not-allowed" : "pointer",
						fontFamily: "'Space Grotesk', sans-serif",
						fontSize: "14px",
					}}
				>
					{submitting ? "Submitting..." : "Submit for Verification"}
					{!submitting && <VerifiedBadge className="w-4 h-4" />}
				</button>
			)}
		</div>
	);
}
