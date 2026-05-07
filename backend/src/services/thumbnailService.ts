import { storage } from "../config/firebase";

interface UploadedFile {
	fieldname: string;
	originalname: string;
	encoding: string;
	mimetype: string;
	buffer: Buffer;
	size: number;
}

export const uploadThumbnail = async (petId: string, file: UploadedFile): Promise<string> => {
	const bucket = storage.bucket();
	const timestamp = Date.now();
	const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.]/g, "_");
	const filename = `pets/${petId}/thumbnail/${timestamp}-${sanitizedName}`;

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
				await blob.makePublic();
				const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
				resolve(publicUrl);
			} catch (err) {
				reject(err);
			}
		});

		blobStream.end(file.buffer);
	});
};
