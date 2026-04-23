"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePets } from "@/hooks/usePets";
import { PetCardSkeletonCarousel } from "@/components/PetCardSkeleton";

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
	const { pets, loading } = usePets();
	const [petIndex, setPetIndex] = useState(0);
	const windowWidth = useWindowWidth();

	const petList = pets || [];

	// Always show 3 max (layout handled by CSS)
	const visibleCount = 3;
	const maxIndex = Math.max(0, petList.length - visibleCount);

	const prevPet = () => setPetIndex((i) => Math.max(0, i - 1));
	const nextPet = () => setPetIndex((i) => Math.min(maxIndex, i + 1));

	useEffect(() => {
		setPetIndex((i) => Math.min(i, maxIndex));
	}, [maxIndex]);

	return (
		<section
			id="pets"
			className="relative overflow-hidden px-6 md:px-10 lg:px-20 py-20 md:py-28 bg-white"
		>
			{/* ✅ Stable blob */}
			<img
				src="/images/decorate/bg2.svg"
				alt=""
				aria-hidden="true"
				className="absolute left-1/2 bottom-0 -translate-x-1/2 
				           w-full max-w-[1100px] z-0 pointer-events-none"
			/>

			<div className="relative z-10 max-w-6xl mx-auto">
				{/* Title + arrows */}
				<div className="flex items-center justify-between mb-10 md:mb-12">
					<div>
						<p className="font-semibold mb-1 tracking-widest text-[#7AADA1] text-[11px]">
							FIND YOUR MATCH
						</p>
						<h2 className="font-bold text-[#111] text-[clamp(22px,3vw,28px)]">
							Our Pets
						</h2>
					</div>
					<div className="flex gap-3">
						<button
							onClick={prevPet}
							disabled={petIndex === 0}
							className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center disabled:opacity-30"
						>
							‹
						</button>
						<button
							onClick={nextPet}
							disabled={petIndex >= maxIndex}
							className="w-12 h-12 rounded-full bg-[#7AADA1] text-white shadow-md flex items-center justify-center disabled:opacity-30"
						>
							›
						</button>
					</div>
				</div>

				{/* ✅ Responsive grid (NO JS) */}
			{loading ? (
				<PetCardSkeletonCarousel count={3} />
			) : (
				<div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
					{petList.slice(petIndex, petIndex + visibleCount).map((pet) => (
						<div
							key={pet.id}
							className="rounded-3xl overflow-hidden bg-white shadow-lg"
						>
							<div className="relative w-full pt-[75%] overflow-hidden">
								<img
									src={
										pet.thumbnail ||
										pet.photoUrls?.[0] ||
										"/images/pets/placeholder.png"
									}
									alt={pet.name}
									className="absolute inset-0 w-full h-full object-cover"
								/>

								<div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 text-[11px] font-semibold text-[#7AADA1]">
									{pet.status || "Available"}
								</div>
							</div>
							<div className="p-5 md:p-6">
								<h3 className="font-semibold text-[#111] text-[16px]">
									{pet.name}
								</h3>

								<p className="mb-5 text-[13px] text-[#888]">
									{pet.breed} · {pet.ageMonths} month
									{pet.ageMonths === 1 ? "" : "s"}
								</p>
								<Link
									href="/register" // TODO: redirect to pet detail page if already login
									className="block text-center py-3 rounded-full bg-[#F0F7F5] text-[#7AADA1] text-[13px] font-semibold hover:opacity-80"
								>
									Adopt Me
								</Link>
							</div>
						</div>
					))}
				</div>
			)}

				{/* Dots */}
				<div className="flex justify-center gap-2 mt-10">
					{Array.from({ length: maxIndex + 1 }).map((_, i) => (
						<button
							key={i}
							onClick={() => setPetIndex(i)}
							className={`h-2 rounded transition-all ${
								petIndex === i ? "w-7 bg-[#7AADA1]" : "w-2 bg-gray-300"
							}`}
						/>
					))}
				</div>

				{/* More button */}
				<div className="flex justify-center mt-8">
					<Link
						href="/pets"
						className="px-9 py-3 bg-[#3D2C1E] text-white text-[13px] rounded-md font-semibold hover:opacity-80"
					>
						More
					</Link>
				</div>
			</div>
		</section>
	);
}
