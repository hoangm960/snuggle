import admin from 'firebase-admin';
import * as fs from 'fs';

let serviceAccount: admin.ServiceAccount | undefined;

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_FILE;

if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
	const serviceAccountFile = fs.readFileSync(serviceAccountPath, 'utf8');
	serviceAccount = JSON.parse(serviceAccountFile);
}

if (!admin.apps.length) {
	if (!serviceAccount) {
		throw new Error(
			'Firebase service account not found. Please set FIREBASE_SERVICE_ACCOUNT_FILE in .env'
		);
	}

	admin.initializeApp({
		credential: admin.credential.cert(serviceAccount),
		storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
	});
}

export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();

export default admin;
