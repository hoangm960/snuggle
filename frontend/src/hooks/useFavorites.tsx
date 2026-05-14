"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { useAuth } from "./useAuth";

interface FavoritesContextValue {
	favoriteIds: Set<string>;
	loading: boolean;
	toggleFavorite: (petId: string) => Promise<void>;
	isFavorited: (petId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
	const { user } = useAuth();
	const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!user) {
			setFavoriteIds(new Set());
			return;
		}
		setLoading(true);
		api.get("/favorites")
			.then((res) => {
				const ids = (res.data.data as { petId: string }[]).map((f) => f.petId);
				setFavoriteIds(new Set(ids));
			})
			.catch(() => {})
			.finally(() => setLoading(false));
	}, [user]);

	const toggleFavorite = useCallback(
		async (petId: string) => {
			if (!user) return;
			const wasFavorited = favoriteIds.has(petId);

			// Optimistic update
			setFavoriteIds((prev) => {
				const next = new Set(prev);
				if (wasFavorited) next.delete(petId);
				else next.add(petId);
				return next;
			});

			try {
				if (wasFavorited) {
					await api.delete(`/favorites/${petId}`);
				} else {
					await api.post(`/favorites/${petId}`);
				}
			} catch {
				// Rollback on error
				setFavoriteIds((prev) => {
					const next = new Set(prev);
					if (wasFavorited) next.add(petId);
					else next.delete(petId);
					return next;
				});
			}
		},
		[user, favoriteIds]
	);

	const isFavorited = useCallback((petId: string) => favoriteIds.has(petId), [favoriteIds]);

	return (
		<FavoritesContext.Provider value={{ favoriteIds, loading, toggleFavorite, isFavorited }}>
			{children}
		</FavoritesContext.Provider>
	);
}

export function useFavorites() {
	const ctx = useContext(FavoritesContext);
	if (!ctx) throw new Error("useFavorites must be used inside FavoritesProvider");
	return ctx;
}
