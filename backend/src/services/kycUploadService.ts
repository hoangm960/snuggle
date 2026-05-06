import { storage } from "../config/firebase";

const SIGNED_URL_EXPIRY_MINUTES = 60 * 24 * 7;

export const uploadKycDocument = async (
	userId: string,
	file: Express.Multer.File,
	type: "id" | "financial"
): Promise<string> => {
	const bucket = storage.bucket();
	const timestamp = Date.now();
	const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.]/g, "_");
	const filename = `kyc/${userId}/${type}/${timestamp}-${sanitizedName}`;

	const blob = bucket.file(filename);

	const blobStream = blob.createWriteStream({
		metadata: {
			contentType: file.mimetype,
			cacheControl: "public, max-age=31536000",
		},
	});

	return new Promise((resolve, reject) => {
		blobStream.on("error", (err) => {
			reject(err);
		});

		blobStream.on("finish", async () => {
			try {
				const [signedUrl] = await blob.getSignedUrl({
					action: "read",
					expires: Date.now() + SIGNED_URL_EXPIRY_MINUTES * 60 * 1000,
				});
				resolve(signedUrl);
			} catch (err) {
				reject(err);
			}
		});

		blobStream.end(file.buffer);
	});
};
