import { useState, useEffect } from "react";
import { User } from "@/types";
import { auth } from "@/lib/firebase";
import {
	onAuthStateChanged,
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	signOut,
	signInWithPopup,
	GoogleAuthProvider,
	FacebookAuthProvider,
	User as FirebaseUser,
} from "firebase/auth";

interface UseAuthReturn {
	user: User | null;
	firebaseUser: FirebaseUser | null;
	loading: boolean;
	login: (email: string, password: string) => Promise<void>;
	register: (email: string, password: string) => Promise<void>;
	loginWithGoogle: () => Promise<void>;
	loginWithFacebook: () => Promise<void>;
	logout: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
	const [user, setUser] = useState<User | null>(null);
	const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
			setFirebaseUser(firebaseUser);
			if (firebaseUser) {
				setUser({
					email: firebaseUser.email || "",
					displayName: firebaseUser.displayName || "",
					role: "adopter",
					createdAt: new Date(),
					updatedAt: new Date(),
				});
			} else {
				setUser(null);
			}
			setLoading(false);
		});

		return () => unsubscribe();
	}, []);

	const login = async (email: string, password: string) => {
		await signInWithEmailAndPassword(auth, email, password);
	};

	const register = async (email: string, password: string) => {
		await createUserWithEmailAndPassword(auth, email, password);
	};

	const logout = async () => {
		await signOut(auth);
	};

	const loginWithGoogle = async () => {
		const provider = new GoogleAuthProvider();
		await signInWithPopup(auth, provider);
	};

	const loginWithFacebook = async () => {
		const provider = new FacebookAuthProvider();
		await signInWithPopup(auth, provider);
	};

	return { user, firebaseUser, loading, login, register, loginWithGoogle, loginWithFacebook, logout };
};
