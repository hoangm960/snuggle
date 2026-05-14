"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, Loader2, ExternalLink } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import api from "@/lib/api";
import type { Pet } from "@/types";

export default function FavoritesPage() {
	const router = useRouter();
	const { user, loading: authLoading } = useAuth();
	const { favoriteIds, loading: favLoading, toggleFavorite } = useFavorites();

	const [pets, setPets] = useState<Pet[]>([]);
	const [petsLoading, setPetsLoading] = useState(false);

	useEffect(() => {
		if (!authLoading && !user) router.push("/login");
	}, [user, authLoading]);

	useEffect(() => {
		if (favoriteIds.size === 0) {
			setPets([]);
			return;
		}
		setPetsLoading(true);
		Promise.allSettled(
			Array.from(favoriteIds).map((petId) =>
				api.get(`/pets/${petId}`).then((r) => r.data.data as Pet)
			)
		)
			.then((results) => {
				const fetched = results
					.filter((r): r is PromiseFulfilledResult<Pet> => r.status === "fulfilled")
					.map((r) => r.value);
				setPets(fetched);
			})
			.finally(() => setPetsLoading(false));
	}, [favoriteIds]);

	const isLoading = authLoading || favLoading || petsLoading;

	if (authLoading || (!user && isLoading)) {
		return (
			<div className="min-h-screen" style={{ background: "#F9F6F2" }}>
				<Navbar />
				<div className="flex items-center justify-center" style={{ height: "60vh" }}>
					<Loader2 className="w-8 h-8 animate-spin" style={{ color: "#7AADA1" }} />
				</div>
			</div>
		);
	}

	return (
		<div
			className="min-h-screen"
			style={{ background: "#F9F6F2", fontFamily: "'Poppins', sans-serif" }}
		>
			<Navbar />

			<div className="max-w-5xl mx-auto px-5 py-10">
				{/* Header */}
				<div className="mb-8 flex items-center gap-3">
					<div
						className="w-10 h-10 rounded-full flex items-center justify-center"
						style={{ background: "#FDECEA" }}
					>
						<Heart className="w-5 h-5" style={{ color: "#C4857A", fill: "#C4857A" }} />
					</div>
					<div>
						<h1
							style={{
								fontFamily: "'Space Grotesk', sans-serif",
								fontSize: "28px",
								fontWeight: 700,
								color: "#1C1C1C",
								lineHeight: 1.2,
							}}
						>
							My Favorites
						</h1>
						<p style={{ color: "#888", fontSize: "13px" }}>
							{favoriteIds.size} saved pet{favoriteIds.size !== 1 ? "s" : ""}
						</p>
					</div>
				</div>

				{/* Loading */}
				{isLoading ? (
					<div className="flex items-center justify-center py-20">
						<Loader2 className="w-7 h-7 animate-spin" style={{ color: "#7AADA1" }} />
					</div>
				) : pets.length === 0 ? (
					/* ── Empty state ── */
					<div
						className="rounded-2xl flex flex-col items-center justify-center py-20 px-8 text-center"
						style={{ background: "#fff", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
					>
						<div
							className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
							style={{ background: "#FDECEA" }}
						>
							<Heart className="w-7 h-7" style={{ color: "#C4857A" }} />
						</div>
						<h2
							style={{
								fontFamily: "'Space Grotesk', sans-serif",
								fontSize: "18px",
								fontWeight: 700,
								color: "#1C1C1C",
								marginBottom: "8px",
							}}
						>
							No favorites yet
						</h2>
						<p
							style={{
								color: "#888",
								fontSize: "14px",
								marginBottom: "24px",
								maxWidth: "320px",
							}}
						>
							Browse pets and tap the heart icon to save your favorites here.
						</p>
						<Link
							href="/pets"
							className="font-semibold rounded-[40px] px-6 py-3 hover:opacity-90 transition-all"
							style={{
								background: "#7AADA1",
								color: "#fff",
								fontFamily: "'Space Grotesk', sans-serif",
								fontSize: "14px",
							}}
						>
							Browse Pets
						</Link>
					</div>
				) : (
					/* ── Pet grid ── */
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
						{pets.map((pet) => (
							<FavoritePetCard
								key={pet.id}
								pet={pet}
								onUnfavorite={() => toggleFavorite(pet.id!)}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

// ── Favorite Pet Card ─────────────────────────────────────────────────────────

function FavoritePetCard({ pet, onUnfavorite }: { pet: Pet; onUnfavorite: () => void }) {
	const [hovered, setHovered] = useState(false);

	const displayAge = pet.ageMonths
		? `${pet.ageMonths} month${pet.ageMonths === 1 ? "" : "s"}`
		: pet.age
			? `${pet.age} year${pet.age === 1 ? "" : "s"}`
			: "";

	return (
		<div
			className="rounded-3xl overflow-hidden bg-white flex flex-col"
			style={{
				boxShadow: hovered ? "0 12px 48px rgba(0,0,0,0.14)" : "0 4px 24px rgba(0,0,0,0.08)",
				transition: "box-shadow 0.25s, transform 0.25s",
				transform: hovered ? "translateY(-4px)" : "none",
			}}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
		>
			{/* Image */}
			<div
				className="relative w-full overflow-hidden"
				style={{ paddingTop: "70%", background: "#F9F6F2" }}
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

				{/* Heart remove button */}
				<button
					onClick={(e) => {
						e.preventDefault();
						onUnfavorite();
					}}
					className="absolute top-3 right-3 flex items-center justify-center transition-all hover:scale-110"
					style={{
						width: "34px",
						height: "34px",
						borderRadius: "50%",
						background: "rgba(255,255,255,0.95)",
						border: "none",
						cursor: "pointer",
					}}
					title="Remove from favorites"
				>
					<Heart
						style={{
							width: "16px",
							height: "16px",
							color: "#C4857A",
							fill: "#C4857A",
							transition: "all 0.15s",
						}}
					/>
				</button>

				{/* Status badge */}
				<div
					className="absolute top-3 left-3"
					style={{
						background: "rgba(255,255,255,0.95)",
						borderRadius: "20px",
						padding: "4px 10px",
						display: "flex",
						alignItems: "center",
						gap: "4px",
					}}
				>
					<span
						style={{
							width: "5px",
							height: "5px",
							borderRadius: "50%",
							background: pet.status === "available" ? "#22c55e" : "#888",
							display: "inline-block",
							flexShrink: 0,
						}}
					/>
					<span
						style={{
							fontFamily: "'Space Grotesk', sans-serif",
							fontSize: "10px",
							fontWeight: 600,
							color: pet.status === "available" ? "#166534" : "#666",
							textTransform: "capitalize",
						}}
					>
						{pet.status || "Available"}
					</span>
				</div>
			</div>

			{/* Content */}
			<div className="flex flex-col flex-1 p-4">
				<div className="flex items-start justify-between mb-1">
					<h3
						style={{
							fontFamily: "'Space Grotesk', sans-serif",
							fontSize: "17px",
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
							color: pet.gender === "female" ? "#C4857A" : "#7AADA1",
							fontWeight: 600,
						}}
					>
						{pet.gender === "female" ? "♀" : "♂"} {pet.gender}
					</span>
				</div>

				<p style={{ color: "#888", fontSize: "12px", marginBottom: "12px" }}>
					{pet.breed}
					{displayAge ? ` · ${displayAge}` : ""}
				</p>

				<Link
					href={`/pets/${pet.id}`}
					className="mt-auto flex items-center justify-center gap-1.5 font-semibold py-2.5 rounded-[40px] transition-all hover:opacity-90"
					style={{
						background: "#7AADA1",
						color: "#fff",
						fontFamily: "'Space Grotesk', sans-serif",
						fontSize: "13px",
					}}
				>
					View <ExternalLink className="w-3.5 h-3.5" />
				</Link>
			</div>
		</div>
	);
}
