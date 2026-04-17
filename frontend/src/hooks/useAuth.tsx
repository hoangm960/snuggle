"use client";

import { useState, useEffect, useContext, createContext } from "react";
import { User } from "@/types";
import { auth } from "@/lib/firebase";
import {
	onAuthStateChanged,
	signOut as firebaseSignOut,
	signInWithPopup,
	GoogleAuthProvider,
	FacebookAuthProvider,
	User as FirebaseUser,
} from "firebase/auth";
import { getStoredUser, clearAuthSession, isAuthenticated, getToken } from "@/lib/cookies";

interface AuthContextValue {
	user: User | null;
	firebaseUser: FirebaseUser | null;
	loading: boolean;
	loginWithGoogle: () => Promise<void>;
	loginWithFacebook: () => Promise<void>;
	logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const storedUser = getStoredUser();
		const authenticated = isAuthenticated();

		if (authenticated && storedUser) {
			setUser(storedUser);
			setLoading(false);
		}

		const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
			setFirebaseUser(fbUser);
			if (fbUser && !authenticated) {
				setUser({
					email: fbUser.email || "",
					displayName: fbUser.displayName || "",
					role: "adopter",
					createdAt: new Date(),
					updatedAt: new Date(),
				});
			}
			setLoading(false);
		});

		return () => unsubscribe();
	}, []);

	const loginWithGoogle = async () => {
		const provider = new GoogleAuthProvider();
		await signInWithPopup(auth, provider);
	};

	const loginWithFacebook = async () => {
		const provider = new FacebookAuthProvider();
		await signInWithPopup(auth, provider);
	};

	const logout = async () => {
		clearAuthSession();
		setUser(null);

		try {
			await firebaseSignOut(auth);
		} catch {
			// Ignore
		}
	};

	const value: AuthContextValue = {
		user,
		firebaseUser,
		loading,
		loginWithGoogle,
		loginWithFacebook,
		logout,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within AuthProvider");
	}
	return context;
}

export { getToken, isAuthenticated };
