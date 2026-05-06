interface EKYCFormErrorProps {
	error: string | null;
	otpError: string | null;
}

export function EKYCFormError({ error, otpError }: EKYCFormErrorProps) {
	if (!error && !otpError) return null;

	return (
		<div
			className="mt-6 text-center"
			style={{
				background: "#fef2f2",
				border: "1px solid #fecaca",
				borderRadius: "12px",
				padding: "12px 16px",
			}}
		>
			{error && <p style={{ color: "#991b1b", fontSize: "13px" }}>{error}</p>}
			{otpError && (
				<p
					style={{
						color: "#991b1b",
						fontSize: "12px",
						marginTop: error ? "4px" : 0,
					}}
				>
					{otpError}
				</p>
			)}
		</div>
	);
}
