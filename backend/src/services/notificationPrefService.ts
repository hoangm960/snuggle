import { db } from "../config/firebase";
import { NotificationPrefs } from "../types";

type PrefKey = keyof NotificationPrefs;

export async function shouldSendEmail(userId: string, prefKey: PrefKey): Promise<boolean> {
	try {
		const userDoc = await db.collection("users").doc(userId).get();
		if (!userDoc.exists) return false;
		const prefs = userDoc.data()?.notificationPrefs as NotificationPrefs | undefined;
		return prefs?.[prefKey] !== false;
	} catch (error) {
		console.error(`Failed to check notification prefs for user ${userId}:`, error);
		return true;
	}
}
