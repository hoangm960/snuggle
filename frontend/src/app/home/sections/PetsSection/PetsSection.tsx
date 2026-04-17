"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePets } from "@/hooks/usePets";

function useWindowWidth() {
	const [width, setWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
	useEffect(() => {
		const onResize = () => setWidth(window.innerWidth);
		window.addEventListener("resize", onResize);
		return () => window.removeEventListener("resize", onResize);
	}, []);
	return width;
}

export default function PetsSection() {
	const { pets } = usePets();
	const [petIndex, setPetIndex] = useState(0);
	const windowWidth = useWindowWidth();

	const petList = pets || [];
	const visibleCount = windowWidth < 640 ? 1 : windowWidth < 1024 ? 2 : 3;
	const maxIndex = Math.max(0, petList.length - visibleCount);

	const prevPet = () => setPetIndex((i) => Math.max(0, i - 1));
	const nextPet = () => setPetIndex((i) => Math.min(maxIndex, i + 1));

	useEffect(() => {
		setPetIndex((i) => Math.min(i, Math.max(0, maxIndex)));
	}, [maxIndex]);

	return (
		<section
			id="pets"
			className="relative px-6 md:px-10 lg:px-20 py-20 md:py-28"
			style={{ background: "#fff" }}
		>
			{/* Pink blob */}
			<img
				src="/images/decorate/bg2.svg"
				alt=""
				aria-hidden="true"
				style={{
					position: "absolute",
					left: "50%",
					top: "50%",
					transform: "translate(-50%, -50%)",
					width: "max(1300px, 110vw)",
					height: "auto",
					zIndex: 0,
					pointerEvents: "none",
				}}
			/>

			<div className="relative max-w-6xl mx-auto" style={{ zIndex: 1 }}>
				{/* Title + arrows */}
				<div className="flex items-center justify-between mb-10 md:mb-12">
					<div>
						<p
							className="font-semibold mb-1 tracking-widest"
							style={{ color: "#7AADA1", fontSize: "11px", letterSpacing: "0.14em" }}
						>
							FIND YOUR MATCH
						</p>
						<h2
							className="font-bold"
							style={{
								color: "#111",
								fontFamily: "'Space Grotesk', sans-serif",
								fontSize: "clamp(22px, 3vw, 28px)",
							}}
						>
							Our Pets
						</h2>
					</div>
					<div className="flex gap-3">
						<button
							onClick={prevPet}
							disabled={petIndex === 0}
							className="flex items-center justify-center transition-all hover:scale-105 disabled:opacity-30"
							style={{
								width: "48px",
								height: "48px",
								borderRadius: "50%",
								background: "#fff",
								boxShadow: "0 2px 16px rgba(0,0,0,0.14)",
								border: "none",
								cursor: "pointer",
							}}
						>
							<svg
								width="18"
								height="18"
								viewBox="0 0 24 24"
								fill="none"
								stroke="#333"
								strokeWidth="2.5"
							>
								<polyline points="15 18 9 12 15 6" />
							</svg>
						</button>
						<button
							onClick={nextPet}
							disabled={petIndex >= maxIndex}
							className="flex items-center justify-center transition-all hover:scale-105 disabled:opacity-30"
							style={{
								width: "48px",
								height: "48px",
								borderRadius: "50%",
								background: "#7AADA1",
								boxShadow: "0 2px 16px rgba(0,0,0,0.14)",
								border: "none",
								cursor: "pointer",
							}}
						>
							<svg
								width="18"
								height="18"
								viewBox="0 0 24 24"
								fill="none"
								stroke="#fff"
								strokeWidth="2.5"
							>
								<polyline points="9 18 15 12 9 6" />
							</svg>
						</button>
					</div>
				</div>

				{/* Cards */}
				<div
					style={{
						display: "grid",
						gap: "24px",
						gridTemplateColumns: `repeat(${visibleCount}, 1fr)`,
					}}
				>
					{petList.slice(petIndex, petIndex + visibleCount).map((pet) => (
						<div
							key={pet.id}
							className="rounded-3xl overflow-hidden bg-white"
							style={{ boxShadow: "0 6px 32px rgba(0,0,0,0.10)", minWidth: 0 }}
						>
							<div
								className="relative w-full"
								style={{ paddingTop: "75%", overflow: "hidden" }}
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
									}}
								/>
								<div
									className="absolute top-4 right-4 bg-white rounded-full px-3 py-1"
									style={{
										color: "#7AADA1",
										fontFamily: "'Space Grotesk', sans-serif",
										fontSize: "11px",
										fontWeight: 600,
									}}
								>
									{pet.status || "Available"}
								</div>
							</div>
							<div className="p-5 md:p-6">
								<h3
									className="font-semibold mb-1"
									style={{
										color: "#111",
										fontFamily: "'Space Grotesk', sans-serif",
										fontSize: "16px",
									}}
								>
									{pet.name}
								</h3>
								<p className="mb-5" style={{ color: "#888", fontSize: "13px" }}>
									{pet.breed} · {pet.age} year{pet.age === 1 ? "" : "s"}
								</p>
								<Link
									href="/register"
									className="block text-center font-semibold py-3 rounded-[40px] transition-opacity hover:opacity-80"
									style={{
										background: "#F0F7F5",
										color: "#7AADA1",
										fontFamily: "'Space Grotesk', sans-serif",
										fontSize: "13px",
									}}
								>
									Adopt Me
								</Link>
							</div>
						</div>
					))}
				</div>

				{/* Dot indicators */}
				<div className="flex justify-center gap-2 mt-10">
					{Array.from({ length: maxIndex + 1 }).map((_, i) => (
						<button
							key={i}
							onClick={() => setPetIndex(i)}
							style={{
								width: petIndex === i ? "28px" : "8px",
								height: "8px",
								borderRadius: "4px",
								background: petIndex === i ? "#7AADA1" : "rgba(0,0,0,0.15)",
								border: "none",
								cursor: "pointer",
								transition: "all 0.25s",
								padding: 0,
							}}
						/>
					))}
				</div>

				{/* More button */}
				<div className="flex justify-center mt-8">
					<Link
						href="/pets"
						className="flex items-center justify-center font-semibold hover:opacity-80 transition-opacity"
						style={{
							padding: "12px 36px",
							borderRadius: "8px",
							background: "#3D2C1E",
							color: "#fff",
							fontFamily: "'Space Grotesk', sans-serif",
							fontSize: "13px",
						}}
					>
						More
					</Link>
				</div>
			</div>
		</section>
	);
}
