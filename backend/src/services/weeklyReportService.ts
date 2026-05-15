import { db } from "../config/firebase";
import { sendWeeklyReportEmail } from "./emailService";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export async function sendWeeklyReports(): Promise<void> {
	const since = new Date(Date.now() - SEVEN_DAYS_MS);

	const [appSnap, kycSnap, contractSnap, msgSnap] = await Promise.all([
		db.collection("adoptionApplications").where("appliedAt", ">=", since).get(),
		db.collection("kycVerifications").where("submittedAt", ">=", since).get(),
		db.collection("adoptionContracts").where("createdAt", ">=", since).get(),
		db.collection("messages").where("sentAt", ">=", since).get(),
	]);

	const newApplications = appSnap.size;
	const newKyc = kycSnap.size;
	const newContracts = contractSnap.size;
	const newMessages = msgSnap.size;

	const userSnap = await db
		.collection("users")
		.where("notificationPrefs.weeklyReport", "==", true)
		.get();

	let sent = 0;
	for (const doc of userSnap.docs) {
		const data = doc.data();
		if (!data.email) continue;
		try {
			await sendWeeklyReportEmail({
				to: data.email,
				displayName: data.displayName || "User",
				newApplications,
				newKyc,
				newContracts,
				newMessages,
			});
			sent++;
		} catch (err) {
			console.error(`Failed to send weekly report to ${data.email}:`, err);
		}
	}

	console.log(
		`Weekly reports sent to ${sent}/${userSnap.size} users (${newApplications} apps, ${newKyc} kyc, ${newContracts} contracts, ${newMessages} msgs)`
	);
}
