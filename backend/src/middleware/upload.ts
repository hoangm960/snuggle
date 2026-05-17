import { Request } from "express";
import multer, { FileFilterCallback } from "multer";

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
	const allowedMimeTypes = [
		"image/jpeg",
		"image/jpg",
		"image/png",
		"image/webp",
		"application/pdf",
	];

	if (allowedMimeTypes.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(new Error("Invalid file type. Only JPEG, PNG, WebP images and PDF files are allowed."));
	}
};

export const upload = multer({
	storage: multer.memoryStorage(),
	limits: {
		fileSize: 10 * 1024 * 1024, // 10MB
	},
	fileFilter,
});
