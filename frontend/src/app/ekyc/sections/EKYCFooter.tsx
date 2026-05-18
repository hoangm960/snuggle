import Link from "next/link";
import { PawLogo } from "@/assets/icons/ekyc-icons";

export function EKYCFooter() {
	return (
		<footer style={{ background: "#1C1C1C" }} className="px-6 md:px-10 lg:px-20 pt-12 pb-8">
			<div className="max-w-6xl mx-auto">
				<div className="flex flex-col lg:flex-row justify-between gap-10 mb-10">
					<div style={{ maxWidth: "220px" }}>
						<Link href="/home" className="flex items-center gap-2 mb-4">
							<PawLogo />
							<span
								style={{
									color: "#7AADA1",
									fontFamily: "'Space Grotesk', sans-serif",
									fontSize: "22px",
									fontWeight: 500,
								}}
							>
								Snuggle
							</span>
						</Link>
						<a
							href="mailto:snuggle@gmail.com"
							className="block mb-1"
							style={{ color: "#888", fontSize: "12px" }}
						>
							Email: snuggle@gmail.com
						</a>
						<p style={{ color: "#888", fontSize: "12px" }}>Phone: 555-567-8901</p>
						<p style={{ color: "#888", fontSize: "12px" }}>
							Address: 123 Adoption Lane
						</p>
						<Link href="/home#contact">
							<button
								className="mt-5 px-5 py-2 rounded-lg font-medium hover:opacity-80 transition-opacity"
								style={{
									background: "#C4857A",
									color: "#fff",
									fontSize: "12px",
									fontFamily: "'Space Grotesk', sans-serif",
									border: "none",
									cursor: "pointer",
								}}
							>
								Contact us
							</button>
						</Link>
					</div>
					<div className="flex items-end gap-3 flex-wrap">
						<input
							type="email"
							placeholder="Email"
							className="h-10 rounded-lg outline-none"
							style={{
								paddingLeft: "14px",
								paddingRight: "14px",
								background: "rgba(255,255,255,0.08)",
								border: "1px solid rgba(255,255,255,0.15)",
								color: "#fff",
								fontSize: "13px",
								minWidth: "200px",
							}}
						/>
						<button
							className="h-10 px-5 rounded-lg font-medium hover:opacity-80 transition-opacity"
							style={{
								background: "#C4857A",
								color: "#fff",
								fontSize: "12px",
								fontFamily: "'Space Grotesk', sans-serif",
								border: "none",
								cursor: "pointer",
								whiteSpace: "nowrap",
							}}
						>
							Subscribe for news
						</button>
					</div>
				</div>
				<div
					className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
					style={{ borderColor: "#2E2E2E" }}
				>
					<p style={{ color: "#555", fontSize: "12px" }}>
						© 2026 Snuggle. All Rights Reserved.
					</p>
					<a
						href="#"
						style={{ color: "#555", fontSize: "12px" }}
						className="hover:text-white transition-colors"
					>
						Privacy Policy
					</a>
				</div>
			</div>
		</footer>
	);
}
