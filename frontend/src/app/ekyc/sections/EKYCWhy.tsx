import { CheckIcon } from "@/assets/icons/ekyc-icons";

const WHY_ITEMS = [
	{
		title: "Secure & Encrypted",
		desc: "All documents are encrypted end-to-end and stored in compliance with international data-protection standards.",
	},
	{
		title: "Takes Under 5 Minutes",
		desc: "Our streamlined flow is designed to get you verified quickly so you can focus on finding your new companion.",
	},
	{
		title: "Verified Once, Valid Forever",
		desc: "Complete eKYC once and your profile is trusted across every Snuggle adoption listing.",
	},
];

export function EKYCWhy() {
	return (
		<section
			className="px-6 md:px-10 lg:px-20 py-16 md:py-24"
			style={{ background: "#F9F6F2" }}
		>
			<div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-14 items-center">
				<div className="flex-1 relative flex justify-center">
					<div
						style={{
							width: "100%",
							maxWidth: "420px",
							borderRadius: "32px",
							background: "linear-gradient(135deg, #3D2C1E 0%, #6B4F3A 100%)",
							padding: "40px 32px",
							display: "flex",
							flexDirection: "column",
							gap: "24px",
						}}
					>
						<div
							style={{
								background: "rgba(255,255,255,0.10)",
								borderRadius: "16px",
								padding: "20px",
								display: "flex",
								gap: "16px",
								alignItems: "center",
							}}
						>
							<div
								style={{
									width: "48px",
									height: "48px",
									borderRadius: "50%",
									background: "#7AADA1",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									flexShrink: 0,
								}}
							>
								<img
									src="/images/ekyc/Login/user.svg"
									alt="User"
									style={{ width: "32px", height: "32px" }}
								/>
							</div>
							<div>
								<div
									style={{
										background: "rgba(255,255,255,0.3)",
										height: "10px",
										width: "100px",
										borderRadius: "5px",
										marginBottom: "8px",
									}}
								/>
								<div
									style={{
										background: "rgba(255,255,255,0.15)",
										height: "8px",
										width: "70px",
										borderRadius: "4px",
									}}
								/>
							</div>
							<div
								style={{
									marginLeft: "auto",
									background: "#7AADA1",
									borderRadius: "8px",
									padding: "4px 10px",
								}}
							>
								<span
									style={{
										color: "#fff",
										fontSize: "11px",
										fontWeight: 700,
										fontFamily: "'Space Grotesk', sans-serif",
									}}
								>
									VERIFIED
								</span>
							</div>
						</div>

						<div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
							{[
								"/images/ekyc/Icons.svg",
								"/images/ekyc/Icons-2.svg",
								"/images/ekyc/Icons-3.svg",
							].map((src, i) => (
								<div
									key={i}
									style={{
										width: "52px",
										height: "52px",
										borderRadius: "14px",
										background: "rgba(255,255,255,0.12)",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
									}}
								>
									<img
										src={src}
										alt=""
										style={{
											width: "26px",
											height: "26px",
											filter: "brightness(10)",
										}}
									/>
								</div>
							))}
						</div>

						<div>
							<div className="flex justify-between mb-2">
								<span
									style={{
										color: "rgba(255,255,255,0.6)",
										fontSize: "11px",
										fontFamily: "'Space Grotesk', sans-serif",
									}}
								>
									Verification Progress
								</span>
								<span
									style={{
										color: "#7AADA1",
										fontSize: "11px",
										fontFamily: "'Space Grotesk', sans-serif",
										fontWeight: 700,
									}}
								>
									100%
								</span>
							</div>
							<div
								style={{
									height: "6px",
									background: "rgba(255,255,255,0.15)",
									borderRadius: "3px",
								}}
							>
								<div
									style={{
										height: "100%",
										width: "100%",
										background: "#7AADA1",
										borderRadius: "3px",
									}}
								/>
							</div>
						</div>
					</div>
				</div>

				<div className="flex-1">
					<p
						className="font-semibold mb-3 tracking-widest"
						style={{ color: "#7AADA1", fontSize: "11px", letterSpacing: "0.14em" }}
					>
						WHY IT MATTERS
					</p>
					<h2
						className="mb-5"
						style={{
							color: "#216959",
							fontFamily: "'Francois One', sans-serif",
							fontSize: "clamp(24px, 3.5vw, 38px)",
							fontWeight: 400,
							lineHeight: "1.2",
						}}
					>
						Trust at the Heart of Every Adoption
					</h2>
					<p
						className="mb-8 leading-relaxed"
						style={{ color: "#666", fontSize: "14px", maxWidth: "420px" }}
					>
						Pet adoption is a life-long commitment. Our eKYC process protects animals by
						ensuring they go to verified, responsible owners — and it protects you by
						confirming that sellers and shelters are legitimate.
					</p>
					<div className="flex flex-col gap-6">
						{WHY_ITEMS.map((w, i) => (
							<div key={i} className="flex gap-4 items-start">
								<div
									style={{
										width: "36px",
										height: "36px",
										borderRadius: "10px",
										background: "#E8F4F1",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										flexShrink: 0,
										marginTop: "2px",
									}}
								>
									<CheckIcon className="w-4 h-4" style={{ color: "#7AADA1" }} />
								</div>
								<div>
									<h4
										className="font-semibold mb-1"
										style={{
											color: "#1C1C1C",
											fontFamily: "'Space Grotesk', sans-serif",
											fontSize: "14px",
										}}
									>
										{w.title}
									</h4>
									<p
										style={{
											color: "#888",
											fontSize: "13px",
											lineHeight: "1.6",
										}}
									>
										{w.desc}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
