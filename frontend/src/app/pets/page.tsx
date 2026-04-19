"use client";

import { useState } from "react";
import Link from "next/link";
import { usePets } from "@/hooks/usePets";
import { Navbar } from "@/components/Navbar";

export default function PetsPage() {
	const { pets, loading, error, fetchPets } = usePets();
	const [activeFilter, setActiveFilter] = useState<"all" | "cat" | "dog">("all");
	const [search, setSearch] = useState("");

	const filtered = (pets || []).filter((p) => {
		const petType = p.species === "cat" ? "cat" : p.species === "dog" ? "dog" : "other";
		const matchType = activeFilter === "all" || petType === activeFilter;
		const matchSearch =
			search.trim() === "" ||
			p.name.toLowerCase().includes(search.toLowerCase()) ||
			p.breed.toLowerCase().includes(search.toLowerCase());
		return matchType && matchSearch;
	});

	return (
		<div
			className="flex flex-col min-h-screen w-full"
			style={{ fontFamily: "'Poppins', sans-serif" }}
		>
			<Navbar activeLink="Pets" />

			{/* ── Hero ── */}
			<section className="relative overflow-hidden" style={{ background: "#F9F6F2" }}>
				<div
					className="max-w-6xl mx-auto px-6 md:px-10 lg:px-20 flex flex-col lg:flex-row items-center gap-10 lg:gap-16"
					style={{ paddingTop: "60px", paddingBottom: "60px" }}
				>
					{/* Text */}
					<div className="flex-1 w-full">
						{/* Breadcrumb */}
						<div className="flex items-center gap-2 mb-5">
							<Link
								href="/home"
								style={{
									color: "#7AADA1",
									fontSize: "13px",
									fontFamily: "'Space Grotesk', sans-serif",
								}}
								className="hover:underline"
							>
								Home
							</Link>
							<svg width="6" height="10" viewBox="0 0 6 10" fill="none">
								<path
									d="M1 1L5 5L1 9"
									stroke="#7AADA1"
									strokeWidth="1.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
							<span
								style={{
									color: "#7AADA1",
									fontSize: "13px",
									fontFamily: "'Space Grotesk', sans-serif",
									fontWeight: 600,
								}}
							>
								Pets
							</span>
						</div>

						<p
							className="font-semibold mb-3"
							style={{
								color: "#7AADA1",
								fontFamily: "'Space Grotesk', sans-serif",
								fontSize: "12px",
								letterSpacing: "0.12em",
							}}
						>
							FIND YOUR MATCH
						</p>
						<h1
							style={{
								color: "#3D2C1E",
								fontFamily: "'Space Grotesk', sans-serif",
								fontSize: "clamp(30px, 4.5vw, 52px)",
								fontWeight: 700,
								lineHeight: 1.15,
							}}
							className="mb-5"
						>
							Meet Our
							<br />
							Adorable Pets
						</h1>
						<p
							className="mb-8"
							style={{
								color: "#7A6055",
								fontSize: "15px",
								lineHeight: "1.8",
								maxWidth: "420px",
							}}
						>
							Browse our curated selection of loving companions waiting for their
							forever home. Every pet has been health-checked and is ready to snuggle.
						</p>

						{/* Search bar */}
						<div className="flex gap-3 flex-wrap">
							<div
								className="flex items-center gap-2 flex-1"
								style={{
									padding: "12px 16px",
									borderRadius: "12px",
									background: "#fff",
									border: "1.5px solid #E8E8E8",
									minWidth: "200px",
								}}
							>
								<SearchIcon />
								<input
									type="search"
									placeholder="Search by name or breed…"
									value={search}
									onChange={(e) => setSearch(e.target.value)}
									className="bg-transparent outline-none flex-1"
									style={{
										fontFamily: "'Space Grotesk', sans-serif",
										fontSize: "14px",
										color: "#333",
									}}
								/>
							</div>
							<button
								className="flex items-center justify-center font-semibold hover:opacity-90 transition-opacity"
								style={{
									padding: "12px 28px",
									borderRadius: "12px",
									backgroundColor: "#7AADA1",
									color: "#fff",
									border: "none",
									cursor: "pointer",
									fontFamily: "'Space Grotesk', sans-serif",
									fontSize: "14px",
									whiteSpace: "nowrap",
								}}
							>
								Find a Pet
							</button>
						</div>

						{/* Quick stats */}
						<div className="flex gap-6 mt-8 flex-wrap">
							{[
								{ num: pets?.length || 0, label: "Pets Available" },
								{
									num: (pets || []).filter((p) => p.species === "cat").length,
									label: "Cats",
								},
								{
									num: (pets || []).filter((p) => p.species === "dog").length,
									label: "Dogs",
								},
							].map((s) => (
								<div key={s.label}>
									<span
										style={{
											fontFamily: "'Space Grotesk', sans-serif",
											fontSize: "22px",
											fontWeight: 700,
											color: "#3D2C1E",
										}}
									>
										{s.num}
									</span>
									<span
										style={{
											fontSize: "12px",
											color: "#7A6055",
											marginLeft: "6px",
										}}
									>
										{s.label}
									</span>
								</div>
							))}
						</div>
					</div>

					{/* Hero image */}
					<div
						className="flex-1 w-full flex justify-center lg:justify-end relative"
						style={{ minHeight: "320px" }}
					>
						{/* Decorative circle behind image */}
						<div
							style={{
								position: "absolute",
								right: 0,
								top: "50%",
								transform: "translateY(-50%)",
								width: "340px",
								height: "340px",
								borderRadius: "50%",
								background:
									"linear-gradient(135deg, rgba(122,173,161,0.20) 0%, rgba(33,105,89,0.12) 100%)",
								zIndex: 0,
							}}
						/>
						<div style={{ position: "relative", zIndex: 1 }}>
							<img
								src="/images/pets_cute.png"
								alt="Happy pet and owner"
								style={{
									width: "min(360px, 90vw)",
									height: "auto",
									borderRadius: "28px",
									objectFit: "cover",
									boxShadow: "0 20px 60px rgba(61,44,30,0.18)",
									display: "block",
								}}
							/>
							{/* Floating badge */}
							<div
								style={{
									position: "absolute",
									bottom: "-18px",
									left: "-18px",
									background: "#fff",
									borderRadius: "16px",
									padding: "12px 18px",
									boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
									display: "flex",
									alignItems: "center",
									gap: "10px",
								}}
							>
								<div
									style={{
										width: "36px",
										height: "36px",
										borderRadius: "50%",
										background: "#E8F4F1",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										flexShrink: 0,
									}}
								>
									<PawIcon />
								</div>
								<div>
									<div
										style={{
											fontFamily: "'Space Grotesk', sans-serif",
											fontSize: "13px",
											fontWeight: 700,
											color: "#3D2C1E",
										}}
									>
										100% Verified
									</div>
									<div style={{ fontSize: "11px", color: "#7A6055" }}>
										Health checked pets
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* ── Pets Listing ── */}
			<section
				className="px-6 md:px-10 lg:px-20 py-16 md:py-24"
				style={{ background: "#fff" }}
			>
				<div className="max-w-6xl mx-auto">
					{/* Section header */}
					<div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
						<div>
							<p
								className="font-semibold mb-2 tracking-widest"
								style={{
									color: "#7AADA1",
									fontSize: "11px",
									letterSpacing: "0.14em",
								}}
							>
								AVAILABLE NOW
							</p>
							<h2
								className="font-bold"
								style={{
									color: "#111",
									fontFamily: "'Space Grotesk', sans-serif",
									fontSize: "clamp(22px, 3vw, 30px)",
								}}
							>
								Our Pets
							</h2>
						</div>

						{/* Filter tabs */}
						<div className="flex gap-2">
							{(
								[
									{ key: "all", label: "All", count: pets?.length || 0 },
									{
										key: "cat",
										label: "Cats",
										count: (pets || []).filter((p) => p.species === "cat")
											.length,
									},
									{
										key: "dog",
										label: "Dogs",
										count: (pets || []).filter((p) => p.species === "dog")
											.length,
									},
								] as const
							).map((f) => (
								<button
									key={f.key}
									onClick={() => setActiveFilter(f.key)}
									style={{
										padding: "8px 18px",
										borderRadius: "40px",
										border: "none",
										cursor: "pointer",
										background: activeFilter === f.key ? "#7AADA1" : "#F6F6F6",
										color: activeFilter === f.key ? "#fff" : "#666",
										fontFamily: "'Space Grotesk', sans-serif",
										fontSize: "13px",
										fontWeight: activeFilter === f.key ? 600 : 400,
										transition: "all 0.2s",
									}}
								>
									{f.label}
									<span
										style={{
											marginLeft: "6px",
											padding: "1px 7px",
											borderRadius: "10px",
											background:
												activeFilter === f.key
													? "rgba(255,255,255,0.25)"
													: "rgba(0,0,0,0.08)",
											fontSize: "11px",
											fontWeight: 700,
										}}
									>
										{f.count}
									</span>
								</button>
							))}
						</div>
					</div>

					{/* Pet cards grid */}
					{filtered.length > 0 ? (
						<div
							style={{
								display: "grid",
								gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
								gap: "28px",
							}}
						>
							{filtered.map((pet) => (
								<PetCard key={pet.id} pet={pet} />
							))}
						</div>
					) : (
						<div className="flex flex-col items-center py-20 gap-4">
							<PawIcon />
							<p
								style={{
									color: "#888",
									fontFamily: "'Space Grotesk', sans-serif",
									fontSize: "15px",
								}}
							>
								No pets found matching your search.
							</p>
							<button
								onClick={() => {
									setSearch("");
									setActiveFilter("all");
								}}
								style={{
									color: "#7AADA1",
									fontFamily: "'Space Grotesk', sans-serif",
									fontSize: "13px",
									background: "none",
									border: "none",
									cursor: "pointer",
									textDecoration: "underline",
								}}
							>
								Clear filters
							</button>
						</div>
					)}
				</div>
			</section>

			{/* ── CTA Banner ── */}
			<section className="px-6 md:px-10 lg:px-20 py-16" style={{ background: "#216959" }}>
				<div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
					<div>
						<h2
							className="font-bold mb-3"
							style={{
								color: "#fff",
								fontFamily: "'Space Grotesk', sans-serif",
								fontSize: "clamp(22px, 3vw, 32px)",
							}}
						>
							Ready to Adopt?
						</h2>
						<p
							style={{
								color: "rgba(255,255,255,0.75)",
								fontSize: "14px",
								lineHeight: "1.7",
								maxWidth: "420px",
							}}
						>
							Complete your eKYC verification to get matched with your perfect
							companion. It only takes 5 minutes.
						</p>
					</div>
					<div className="flex gap-4 flex-wrap">
						<Link
							href="/ekyc"
							className="flex items-center justify-center font-semibold hover:opacity-90 transition-opacity"
							style={{
								padding: "13px 32px",
								borderRadius: "40px",
								background: "#fff",
								color: "#216959",
								fontFamily: "'Space Grotesk', sans-serif",
								fontSize: "14px",
								whiteSpace: "nowrap",
							}}
						>
							Start eKYC
						</Link>
						<Link
							href="/register"
							className="flex items-center justify-center font-semibold hover:opacity-80 transition-opacity"
							style={{
								padding: "13px 32px",
								borderRadius: "40px",
								border: "1.5px solid rgba(255,255,255,0.6)",
								color: "#fff",
								fontFamily: "'Space Grotesk', sans-serif",
								fontSize: "14px",
								whiteSpace: "nowrap",
							}}
						>
							Sign Up Free
						</Link>
					</div>
				</div>
			</section>

			{/* ── Footer ── */}
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
		</div>
	);
}

import { Pet } from "@/types";

/* ── Pet Card ── */
function PetCard({ pet }: { pet: Pet }) {
	const [hovered, setHovered] = useState(false);

	const isCat = pet.species === "cat";
	const isFemale = pet.gender === "female";
	const displayAge = pet.age ? `${pet.age} year${pet.age === 1 ? "" : "s"}` : "";

	return (
		<div
			className="rounded-3xl overflow-hidden bg-white flex flex-col"
			style={{
				boxShadow: hovered ? "0 12px 48px rgba(0,0,0,0.14)" : "0 4px 24px rgba(0,0,0,0.08)",
				transition: "box-shadow 0.25s, transform 0.25s",
				transform: hovered ? "translateY(-4px)" : "none",
				cursor: "default",
			}}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
		>
			{/* Image */}
			<div
				className="relative w-full overflow-hidden"
				style={{ paddingTop: "72%", background: "#F9F6F2" }}
			>
				<img
					src={pet.thumbnail || pet.photoUrls?.[0] || "/images/pets/placeholder.png"}
					alt={pet.name}
					style={{
						position: "absolute",
						inset: 0,
						width: "100%",
						height: "100%",
						objectFit: "cover",
						transition: "transform 0.4s",
						transform: hovered ? "scale(1.05)" : "scale(1)",
					}}
				/>
				{/* Available badge */}
				<div
					className="absolute top-4 right-4"
					style={{
						background: "rgba(255,255,255,0.95)",
						borderRadius: "20px",
						padding: "4px 12px",
						display: "flex",
						alignItems: "center",
						gap: "5px",
					}}
				>
					<span
						style={{
							width: "6px",
							height: "6px",
							borderRadius: "50%",
							background: pet.status === "available" ? "#22c55e" : "#888",
							display: "inline-block",
							flexShrink: 0,
						}}
					/>
					<span
						style={{
							fontFamily: "'Space Grotesk', sans-serif",
							fontSize: "11px",
							fontWeight: 600,
							color: pet.status === "available" ? "#166534" : "#666",
						}}
					>
						{pet.status || "Available"}
					</span>
				</div>
				{/* Type badge */}
				<div
					className="absolute top-4 left-4"
					style={{
						background: isCat ? "#E8F4F1" : "#FDF2F0",
						borderRadius: "20px",
						padding: "4px 12px",
					}}
				>
					<span
						style={{
							fontFamily: "'Space Grotesk', sans-serif",
							fontSize: "11px",
							fontWeight: 600,
							color: isCat ? "#216959" : "#C4857A",
						}}
					>
						{isCat ? "🐱 Cat" : "🐶 Dog"}
					</span>
				</div>
			</div>

			{/* Content */}
			<div className="flex flex-col flex-1 p-5">
				<div className="flex items-start justify-between mb-1">
					<h3
						style={{
							fontFamily: "'Space Grotesk', sans-serif",
							fontSize: "18px",
							fontWeight: 700,
							color: "#1C1C1C",
						}}
					>
						{pet.name}
					</h3>
					<span
						style={{
							fontFamily: "'Space Grotesk', sans-serif",
							fontSize: "12px",
							color: isFemale ? "#C4857A" : "#7AADA1",
							fontWeight: 600,
						}}
					>
						{isFemale ? "♀" : "♂"} {pet.gender}
					</span>
				</div>

				<p style={{ color: "#888", fontSize: "13px", marginBottom: "8px" }}>
					{pet.breed} · {displayAge}
				</p>

				<p
					style={{
						color: "#666",
						fontSize: "12px",
						lineHeight: "1.6",
						marginBottom: "12px",
						flex: 1,
					}}
				>
					{pet.description}
				</p>

				<Link
					href="/register"
					className="block text-center font-semibold py-3 rounded-[40px] transition-all hover:opacity-90"
					style={{
						background: "#7AADA1",
						color: "#fff",
						fontFamily: "'Space Grotesk', sans-serif",
						fontSize: "13px",
					}}
				>
					Adopt Me
				</Link>
			</div>
		</div>
	);
}

/* ── Icon components ── */

function PawLogo() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="28"
			height="27"
			viewBox="0 0 31 30"
			fill="none"
		>
			<g clipPath="url(#paw_pets)">
				<path
					d="M16.0487 15.4468C16.1192 15.4468 16.1192 15.4468 16.1912 15.4468C16.8975 15.4487 17.5488 15.49 18.2246 15.7032C18.2989 15.7244 18.3732 15.7456 18.4497 15.7675C19.5814 16.1186 20.3722 16.8432 21.1308 17.6953C21.1873 17.7574 21.2438 17.8194 21.3004 17.8814C21.7216 18.3463 22.1106 18.8294 22.4885 19.3278C22.5862 19.456 22.685 19.5834 22.784 19.7106C23.3147 20.3953 23.8076 21.1012 24.2935 21.8161C24.3849 21.9501 24.4773 22.0834 24.5706 22.2162C26.9735 25.6374 26.9735 25.6374 26.6704 27.6233C26.6309 27.7781 26.5826 27.9193 26.5195 28.0664C26.4982 28.1166 26.4769 28.1667 26.4549 28.2184C26.0945 28.9828 25.4627 29.4618 24.6593 29.7572C24.0552 29.9613 23.4703 30.0287 22.8332 30.0229C22.7091 30.022 22.5852 30.0229 22.4611 30.0241C21.7383 30.0253 21.0471 29.9205 20.3816 29.6411C20.3391 29.6239 20.2966 29.6066 20.2529 29.5888C19.8963 29.4392 19.5617 29.2585 19.2254 29.0707C17.6644 28.2012 15.5412 28.2393 13.8297 28.6453C13.4749 28.7507 13.1598 28.9028 12.8378 29.0797C11.7825 29.6548 10.8126 30.0109 9.58618 30.0173C9.49837 30.018 9.41056 30.0192 9.32277 30.0209C8.2315 30.0426 7.16503 29.8253 6.30062 29.1358C5.67623 28.5506 5.38814 27.8402 5.36012 27.0089C5.34996 26.031 5.63833 25.2829 6.1152 24.4336C6.15056 24.3702 6.18591 24.3067 6.22234 24.2414C7.42002 22.1606 8.82967 20.1049 10.414 18.2813C10.4632 18.2245 10.4632 18.2245 10.5134 18.1666C12.0261 16.4278 13.6464 15.441 16.0487 15.4468Z"
					fill="#EFC5BD"
				/>
				<path
					d="M22.25 0.537126C23.637 1.51311 24.3079 3.13418 24.6121 4.72132C24.697 5.27543 24.718 5.81991 24.7185 6.37934C24.7185 6.42236 24.7186 6.46538 24.7186 6.5097C24.7176 7.18558 24.683 7.83642 24.5217 8.49604C24.5061 8.56169 24.5061 8.56169 24.4902 8.62867C24.1333 10.0919 23.3983 11.546 22.0809 12.4145C21.3508 12.8325 20.5741 12.9345 19.7435 12.8043C19.5929 12.7656 19.4571 12.7172 19.3147 12.6562C19.2622 12.634 19.2098 12.6118 19.1557 12.5889C17.8297 11.9582 17.0603 10.655 16.5912 9.35461C15.8167 7.06649 16.0288 4.50232 17.0896 2.34003C17.6088 1.36226 18.3956 0.505556 19.4661 0.0914929C20.4408 -0.192237 21.4195 -0.00906445 22.25 0.537126Z"
					fill="#EFC5BD"
				/>
				<path
					d="M12.1673 0.396188C13.6803 1.40439 14.4007 3.06577 14.7275 4.76051C15.0999 6.89297 14.7651 9.22716 13.5627 11.0742C13.3935 11.3012 13.2122 11.5117 13.0178 11.7187C12.9831 11.7571 12.9483 11.7955 12.9125 11.835C12.3971 12.3732 11.6242 12.7977 10.8591 12.846C9.83877 12.8718 9.05292 12.61 8.29882 11.9284C7.14425 10.841 6.60057 9.36389 6.35763 7.85156C6.34639 7.78426 6.33515 7.71696 6.32357 7.64762C6.27484 7.25289 6.28233 6.85332 6.28194 6.45629C6.28188 6.41318 6.28182 6.37008 6.28176 6.32566C6.28241 5.64865 6.32063 4.99719 6.47872 4.33593C6.48747 4.29754 6.49622 4.25915 6.50524 4.2196C6.83398 2.80543 7.55416 1.29222 8.84005 0.468744C9.90809 -0.124147 11.0843 -0.229023 12.1673 0.396188Z"
					fill="#EFC5BD"
				/>
				<path
					d="M29.1838 9.6094C29.2475 9.64445 29.3111 9.67949 29.3768 9.7156C30.1234 10.2776 30.4761 10.9984 30.6369 11.8946C30.6872 12.7387 30.6877 13.5951 30.4553 14.4141C30.4387 14.474 30.4387 14.474 30.4217 14.5352C30.1255 15.5762 29.6043 16.5783 28.881 17.4024C28.8362 17.4538 28.7914 17.5052 28.7453 17.5582C27.9215 18.4727 26.9182 19.1601 25.6482 19.2925C24.987 19.3235 24.3723 19.1004 23.8859 18.6768C23.0021 17.7359 22.843 16.6868 22.8792 15.4489C22.9672 13.67 23.8864 11.9954 25.1271 10.7227C25.1626 10.6853 25.198 10.6479 25.2345 10.6094C26.1716 9.65359 27.8816 8.88535 29.1838 9.6094Z"
					fill="#EFC5BD"
				/>
				<path
					d="M5.07234 10.0548C5.35944 10.2567 5.61856 10.4838 5.87317 10.7226C5.92656 10.7678 5.92656 10.7678 5.98102 10.814C7.23278 11.9139 8.01844 13.8354 8.12307 15.4413C8.17676 16.617 8.01838 17.7219 7.17114 18.6218C7.12244 18.6641 7.07374 18.7064 7.02356 18.75C6.97985 18.7899 6.93615 18.8297 6.89111 18.8708C6.31444 19.2553 5.65556 19.355 4.97585 19.2373C3.55917 18.939 2.45326 17.9749 1.66088 16.8306C1.1646 16.077 0.783863 15.2769 0.545045 14.414C0.524597 14.342 0.504148 14.2699 0.48308 14.1957C0.24441 13.1892 0.210961 11.9854 0.605592 11.0156C0.626822 10.9621 0.648051 10.9086 0.669923 10.8536C0.93072 10.2822 1.41331 9.76026 2.00172 9.49445C3.07171 9.11379 4.17706 9.45232 5.07234 10.0548Z"
					fill="#EFC5BD"
				/>
			</g>
			<defs>
				<clipPath id="paw_pets">
					<rect width="31" height="30" fill="white" />
				</clipPath>
			</defs>
		</svg>
	);
}

function PawIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="20"
			height="20"
			viewBox="0 0 31 30"
			fill="none"
		>
			<g clipPath="url(#paw_icon)">
				<path
					d="M16.0487 15.4468C16.8975 15.4487 17.5488 15.49 18.2246 15.7032C19.5814 16.1186 20.3722 16.8432 21.1308 17.6953C21.7216 18.3463 22.1106 18.8294 22.4885 19.3278C23.3147 20.3953 23.8076 21.1012 24.2935 21.8161C26.9735 25.6374 26.6704 27.6233 26.5195 28.0664C26.0945 28.9828 25.4627 29.4618 24.6593 29.7572C23.4703 30.0287 22.8332 30.0229 22.4611 30.0241C21.0471 29.9205 20.3816 29.6411 19.2254 29.0707C17.6644 28.2012 15.5412 28.2393 13.8297 28.6453C12.8378 29.0797 11.7825 29.6548 9.58618 30.0173C8.2315 30.0426 7.16503 29.8253 6.30062 29.1358C5.38814 27.8402 5.36012 27.0089 6.1152 24.4336C7.42002 22.1606 8.82967 20.1049 10.414 18.2813C12.0261 16.4278 13.6464 15.441 16.0487 15.4468Z"
					fill="#7AADA1"
				/>
				<path
					d="M22.25 0.537126C23.637 1.51311 24.6121 4.72132 24.5217 8.49604C24.1333 10.0919 23.3983 11.546 22.0809 12.4145C21.3508 12.8325 20.5741 12.9345 19.7435 12.8043C17.8297 11.9582 17.0603 10.655 16.5912 9.35461C15.8167 7.06649 16.0288 4.50232 17.0896 2.34003C18.3956 0.505556 20.4408 -0.192237 22.25 0.537126Z"
					fill="#7AADA1"
				/>
				<path
					d="M12.1673 0.396188C13.6803 1.40439 14.7275 4.76051 13.5627 11.0742C12.3971 12.3732 11.6242 12.7977 10.8591 12.846C9.83877 12.8718 9.05292 12.61 8.29882 11.9284C7.14425 10.841 6.35763 7.85156 6.28194 6.45629C6.28241 5.64865 6.47872 4.33593C6.83398 2.80543 7.55416 1.29222 8.84005 0.468744C9.90809 -0.124147 11.0843 -0.229023 12.1673 0.396188Z"
					fill="#7AADA1"
				/>
				<path
					d="M29.1838 9.6094C30.1234 10.2776 30.6369 11.8946 30.4553 14.4141C30.1255 15.5762 29.6043 16.5783 28.881 17.4024C27.9215 18.4727 26.9182 19.1601 25.6482 19.2925C24.987 19.3235 24.3723 19.1004 23.8859 18.6768C23.0021 17.7359 22.8792 15.4489 22.9672 13.67C23.8864 11.9954 25.1271 10.7227 26.1716 9.65359C27.8816 8.88535 29.1838 9.6094Z"
					fill="#7AADA1"
				/>
				<path
					d="M5.07234 10.0548C5.87317 10.7226 8.12307 15.4413 8.17676 16.617C8.01838 17.7219 7.17114 18.6218 6.31444 19.2553C5.65556 19.355 4.97585 19.2373C3.55917 18.939 2.45326 17.9749 1.66088 16.8306C0.783863 15.2769 0.210961 11.9854 0.605592 11.0156C0.93072 10.2822 1.41331 9.76026 2.00172 9.49445C3.07171 9.11379 4.17706 9.45232 5.07234 10.0548Z"
					fill="#7AADA1"
				/>
			</g>
			<defs>
				<clipPath id="paw_icon">
					<rect width="31" height="30" fill="white" />
				</clipPath>
			</defs>
		</svg>
	);
}

function SearchIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			viewBox="0 0 16 16"
			fill="none"
			style={{ flexShrink: 0 }}
		>
			<g clipPath="url(#s_pets)">
				<path
					d="M10.3333 9.33333H9.80667L9.62 9.15333C10.2733 8.39333 10.6667 7.40667 10.6667 6.33333C10.6667 3.94 8.72667 2 6.33333 2C3.94 2 2 3.94 2 6.33333C2 8.72667 3.94 10.6667 6.33333 10.6667C7.40667 10.6667 8.39333 10.2733 9.15333 9.62L9.33333 9.80667V10.3333L12.6667 13.66L13.66 12.6667L10.3333 9.33333ZM6.33333 9.33333C4.67333 9.33333 3.33333 7.99333 3.33333 6.33333C3.33333 4.67333 4.67333 3.33333 6.33333 3.33333C7.99333 3.33333 9.33333 4.67333 9.33333 6.33333C9.33333 7.99333 7.99333 9.33333 6.33333 9.33333Z"
					fill="#666666"
					fillOpacity="0.8"
				/>
			</g>
			<defs>
				<clipPath id="s_pets">
					<rect width="16" height="16" fill="white" />
				</clipPath>
			</defs>
		</svg>
	);
}

function GlobeIcon() {
	return (
		<svg
			width="14"
			height="14"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
		>
			<circle cx="12" cy="12" r="10" />
			<line x1="2" y1="12" x2="22" y2="12" />
			<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
		</svg>
	);
}
