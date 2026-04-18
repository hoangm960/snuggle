import { Request } from "express";
import multer, { FileFilterCallback } from "multer";

const fileFilter = (
	_req: Request,
	file: Express.Multer.File,
	cb: FileFilterCallback
): void => {
	const allowedMimeTypes = [
		"image/jpeg",
		"image/jpg",
		"image/png",
		"image/webp",
	];

	if (allowedMimeTypes.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(new Error("Invalid file type. Only JPEG, PNG, and WebP images are allowed."));
	}
};

export const upload = multer({
	storage: multer.memoryStorage(),
	limits: {
		fileSize: 5 * 1024 * 1024, // 5MB
	},
	fileFilter,
});