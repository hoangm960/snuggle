import admin from "firebase-admin";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const serviceAccount = require(path.join(__dirname, "..", "..", "firebase-service-key.json"));

if (!admin.apps.length) {
	admin.initializeApp({
		credential: admin.credential.cert(serviceAccount),
	});
}

const db = admin.firestore();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_NAME = process.env.ADMIN_NAME || "Admin";

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
	console.error("Error: ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required");
	console.log("\nUsage:");
	console.log("  ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=password123 npm run create-admin");
	process.exit(1);
}

async function createAdmin() {
	try {
		const email = ADMIN_EMAIL as string;
		const password = ADMIN_PASSWORD as string;

		const existingUsers = await db.collection("users").where("email", "==", email.toLowerCase()).get();

		if (!existingUsers.empty) {
			console.log("User already exists. Updating role to admin...");
			const userDoc = existingUsers.docs[0];
			await userDoc.ref.update({
				role: "admin",
				updatedAt: new Date(),
			});
			console.log(`✅ Updated user ${email} to admin role`);
			process.exit(0);
		}

		const userRecord = await admin.auth().createUser({
			email,
			password,
			displayName: ADMIN_NAME,
			emailVerified: true,
		});

		await db.collection("users").doc(userRecord.uid).set({
			email: email.toLowerCase(),
			displayName: ADMIN_NAME,
			role: "admin",
			accountStatus: "active",
			authProvider: "email",
			emailVerified: true,
			isKycVerified: false,
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		console.log(`✅ Created admin user: ${email}`);
		console.log(`   UID: ${userRecord.uid}`);
		process.exit(0);
	} catch (error) {
		console.error("Error creating admin:", error);
		process.exit(1);
	}
}

createAdmin();