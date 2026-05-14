import Image from "next/image";

const STEPS = [
	{
		icon: "/images/ekyc/Icons.svg",
		iconBg: "#7AADA1",
		step: "01",
		title: "Upload ID Document",
		desc: "Provide a government-issued photo ID — passport, national identity card, or driver's license.",
	},
	{
		icon: "/images/ekyc/Icons-1.svg",
		iconBg: "#216959",
		step: "02",
		title: "Personal Verification",
		desc: "We confirm your name, date of birth and address against your submitted documents.",
	},
	{
		icon: "/images/ekyc/Icons-2.svg",
		iconBg: "#3D2C1E",
		step: "03",
		title: "Financial Check",
		desc: "A brief proof-of-address or income document ensures every pet is placed in a stable home.",
	},
	{
		icon: "/images/ekyc/Icons-3.svg",
		iconBg: "#C4857A",
		step: "04",
		title: "Digital Confirmation",
		desc: "Receive a one-time code on your phone to finalise your secure eKYC profile.",
	},
];

export function EKYCHowItWorks() {
	return (
		<section
			id="how-it-works"
			className="px-6 md:px-10 lg:px-20 py-20 md:py-28"
			style={{ background: "#fff" }}
		>
			<div className="max-w-6xl mx-auto">
				<p
					className="font-semibold mb-2 text-center tracking-widest"
					style={{ color: "#7AADA1", fontSize: "11px", letterSpacing: "0.14em" }}
				>
					SIMPLE PROCESS
				</p>
				<h2
					className="font-bold mb-4 text-center"
					style={{
						color: "#111",
						fontFamily: "'Space Grotesk', sans-serif",
						fontSize: "clamp(22px, 3vw, 32px)",
					}}
				>
					How eKYC Works
				</h2>
				<p
					className="mb-14 text-center"
					style={{
						color: "#888",
						fontSize: "14px",
						maxWidth: "480px",
						margin: "0 auto 56px",
					}}
				>
					Four quick steps to build a verified profile that shelters and breeders can
					trust.
				</p>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
					{STEPS.map((s, i) => (
						<div key={i} className="flex flex-col items-start">
							<div className="flex items-center gap-3 mb-5 w-full">
								<div
									style={{
										width: "52px",
										height: "52px",
										borderRadius: "16px",
										background: s.iconBg,
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										flexShrink: 0,
									}}
								>
									<Image
										src={s.icon}
										alt={s.title}
										width={28}
										height={28}
										style={{
											filter:
												s.iconBg === "#3D2C1E" || s.iconBg === "#C4857A"
													? "brightness(10)"
													: "none",
										}}
										unoptimized
									/>
								</div>
								{i < STEPS.length - 1 && (
									<div
										style={{
											flex: 1,
											height: "2px",
											background:
												"linear-gradient(90deg, rgba(122,173,161,0.4), transparent)",
											borderRadius: "1px",
										}}
										className="hidden lg:block"
									/>
								)}
							</div>
							<span
								className="mb-2 font-bold"
								style={{
									color: s.iconBg,
									fontFamily: "'Space Grotesk', sans-serif",
									fontSize: "12px",
									letterSpacing: "0.08em",
								}}
							>
								STEP {s.step}
							</span>
							<h3
								className="font-semibold mb-2"
								style={{
									color: "#1C1C1C",
									fontFamily: "'Space Grotesk', sans-serif",
									fontSize: "16px",
								}}
							>
								{s.title}
							</h3>
							<p style={{ color: "#888", fontSize: "13px", lineHeight: "1.7" }}>
								{s.desc}
							</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
