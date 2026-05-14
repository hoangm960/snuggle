import Image from "next/image";
import Link from "next/link";

export function EKYCHero() {
	return (
		<section
			className="relative overflow-hidden"
			style={{ background: "#F9F6F2", minHeight: "480px" }}
		>
			<div
				style={{
					position: "absolute",
					right: "-80px",
					top: "-80px",
					width: "480px",
					height: "480px",
					borderRadius: "50%",
					background:
						"radial-gradient(circle, rgba(122,173,161,0.18) 0%, transparent 70%)",
					pointerEvents: "none",
				}}
			/>

			<div
				className="relative max-w-6xl mx-auto px-6 md:px-10 lg:px-20 flex flex-col lg:flex-row items-center gap-12"
				style={{ paddingTop: "80px", paddingBottom: "80px", zIndex: 1 }}
			>
				<div className="flex-1">
					<div className="flex items-center gap-2 mb-6">
						<Link
							href="/home"
							style={{
								color: "#7AADA1",
								fontSize: "13px",
								fontFamily: "'Space Grotesk', sans-serif",
								textDecoration: "none",
							}}
						>
							Home
						</Link>
						<span style={{ color: "#bbb" }}>/</span>
						<span
							style={{
								color: "#216959",
								fontSize: "13px",
								fontFamily: "'Space Grotesk', sans-serif",
								fontWeight: 500,
							}}
						>
							eKYC Verification
						</span>
					</div>

					<h1
						style={{
							fontFamily: "'Francois One', sans-serif",
							fontSize: "clamp(32px, 5vw, 56px)",
							color: "#216959",
							lineHeight: "1.1",
							marginBottom: "16px",
						}}
					>
						Verified Identity.
						<br />
						Trusted Adoption.
					</h1>

					<p
						style={{
							color: "#555",
							fontSize: "15px",
							lineHeight: "1.7",
							maxWidth: "420px",
							marginBottom: "32px",
						}}
					>
						Our streamlined eKYC process ensures every pet is matched with a verified,
						responsible owner — keeping animals safe and adopters confident.
					</p>

					<div className="flex gap-4 flex-wrap">
						<a
							href="#start-verification"
							style={{
								padding: "14px 32px",
								borderRadius: "12px",
								background: "#7AADA1",
								color: "#fff",
								fontFamily: "'Space Grotesk', sans-serif",
								fontSize: "14px",
								fontWeight: 600,
								textDecoration: "none",
								display: "inline-block",
							}}
						>
							Start Verification
						</a>
						<a
							href="#how-it-works"
							style={{
								padding: "14px 28px",
								borderRadius: "12px",
								border: "1px solid #C8DDD9",
								background: "#fff",
								color: "#216959",
								fontFamily: "'Space Grotesk', sans-serif",
								fontSize: "14px",
								fontWeight: 600,
								textDecoration: "none",
								display: "inline-block",
							}}
						>
							How It Works
						</a>
					</div>
				</div>

				<div className="flex-1 relative flex justify-center">
					<div
						style={{
							width: "100%",
							maxWidth: "380px",
							borderRadius: "28px",
							background: "linear-gradient(135deg, #3D2C1E 0%, #6B4F3A 100%)",
							padding: "32px 28px",
							display: "flex",
							flexDirection: "column",
							gap: "20px",
						}}
					>
						<div
							style={{
								background: "rgba(255,255,255,0.10)",
								borderRadius: "16px",
								padding: "16px",
								display: "flex",
								gap: "12px",
								alignItems: "center",
							}}
						>
							<div
								style={{
									width: "44px",
									height: "44px",
									borderRadius: "50%",
									background: "#7AADA1",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									flexShrink: 0,
								}}
							>
								<Image
									src="/images/ekyc/Login/user.svg"
									alt="User"
									width={28}
									height={28}
									unoptimized
								/>
							</div>
							<div>
								<div
									style={{
										background: "rgba(255,255,255,0.3)",
										height: "8px",
										width: "90px",
										borderRadius: "4px",
										marginBottom: "6px",
									}}
								/>
								<div
									style={{
										background: "rgba(255,255,255,0.15)",
										height: "7px",
										width: "60px",
										borderRadius: "4px",
									}}
								/>
							</div>
							<div
								style={{
									marginLeft: "auto",
									background: "#7AADA1",
									borderRadius: "6px",
									padding: "3px 8px",
								}}
							>
								<span
									style={{
										color: "#fff",
										fontSize: "10px",
										fontWeight: 700,
										fontFamily: "'Space Grotesk', sans-serif",
									}}
								>
									VERIFIED
								</span>
							</div>
						</div>

						<div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
							{[
								"/images/ekyc/Icons.svg",
								"/images/ekyc/Icons-2.svg",
								"/images/ekyc/Icons-3.svg",
							].map((src, i) => (
								<div
									key={i}
									style={{
										width: "46px",
										height: "46px",
										borderRadius: "12px",
										background: "rgba(255,255,255,0.12)",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
									}}
								>
									<Image
										src={src}
										alt=""
										width={22}
										height={22}
										style={{ filter: "brightness(10)" }}
										unoptimized
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
									height: "5px",
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

					<Image
						src="/images/ekyc/Hand.svg"
						alt=""
						width={80}
						height={80}
						style={{
							position: "absolute",
							bottom: "-20px",
							right: "-20px",
						}}
						unoptimized
					/>
				</div>
			</div>

			<div
				style={{
					position: "absolute",
					bottom: "-2px",
					left: 0,
					right: 0,
					display: "flex",
					justifyContent: "center",
				}}
			>
				<Image
					src="/images/ekyc/arrow copy.svg"
					alt=""
					width={24}
					height={36}
					unoptimized
				/>
			</div>
		</section>
	);
}
