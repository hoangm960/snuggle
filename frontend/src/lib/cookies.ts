import { User } from "@/types";

const COOKIE_NAMES = {
	token: "auth_token",
	user: "auth_user",
} as const;

export function setCookie(name: string, value: string, days?: number): void {
	if (typeof document === "undefined") return;

	let expires = "";
	if (days) {
		const date = new Date();
		date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
		expires = `; expires=${date.toUTCString()}`;
	}
	document.cookie = `${name}=${value}${expires}; path=/; SameSite=Lax`;
}

export function getCookie(name: string): string | null {
	if (typeof document === "undefined") return null;

	const nameEQ = `${name}=`;
	const cookies = document.cookie.split(";");
	for (let i = 0; i < cookies.length; i++) {
		let c = cookies[i].trim();
		if (c.indexOf(nameEQ) === 0) {
			return c.substring(nameEQ.length);
		}
	}
	return null;
}

export function deleteCookie(name: string): void {
	if (typeof document === "undefined") return;
	document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export function setAuthSession(token: string, user: User, days = 7): void {
	setCookie(COOKIE_NAMES.token, token, days);
	setCookie(COOKIE_NAMES.user, JSON.stringify(user), days);
}

export function clearAuthSession(): void {
	deleteCookie(COOKIE_NAMES.token);
	deleteCookie(COOKIE_NAMES.user);
}

export function getToken(): string | null {
	return getCookie(COOKIE_NAMES.token);
}

export function getStoredUser(): User | null {
	const userStr = getCookie(COOKIE_NAMES.user);
	if (!userStr) return null;
	try {
		return JSON.parse(userStr) as User;
	} catch {
		return null;
	}
}

export function isAuthenticated(): boolean {
	return !!getToken() && !!getStoredUser();
}
