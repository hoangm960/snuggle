const STEPS = ["Personal Info", "Upload ID", "Financial Proof", "Confirm"];

interface EKYCFormStepperProps {
	activeStep: number;
	onStepClick: (step: number) => void;
}

export function EKYCFormStepper({ activeStep, onStepClick }: EKYCFormStepperProps) {
	return (
		<div className="flex gap-3 mb-10 overflow-x-auto pb-2">
			{STEPS.map((label, i) => (
				<button
					key={i}
					onClick={() => onStepClick(i)}
					className="flex items-center gap-2 whitespace-nowrap transition-all"
					style={{
						padding: "10px 18px",
						borderRadius: "40px",
						border: "none",
						cursor: "pointer",
						background: activeStep === i ? "#7AADA1" : "#F6F6F6",
						color: activeStep === i ? "#fff" : "#666",
						fontFamily: "'Space Grotesk', sans-serif",
						fontSize: "13px",
						fontWeight: activeStep === i ? 600 : 400,
					}}
				>
					<span
						style={{
							width: "20px",
							height: "20px",
							borderRadius: "50%",
							background:
								activeStep === i ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.08)",
							display: "inline-flex",
							alignItems: "center",
							justifyContent: "center",
							fontSize: "11px",
							fontWeight: 700,
							flexShrink: 0,
						}}
					>
						{i + 1}
					</span>
					{label}
				</button>
			))}
		</div>
	);
}
