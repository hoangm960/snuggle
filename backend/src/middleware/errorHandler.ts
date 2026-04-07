import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { errorLogger } from "../utils/logger";

export enum ErrorCode {
	BAD_REQUEST = "BAD_REQUEST",
	VALIDATION_ERROR = "VALIDATION_ERROR",
	UNAUTHORIZED = "UNAUTHORIZED",
	FORBIDDEN = "FORBIDDEN",
	NOT_FOUND = "NOT_FOUND",
	CONFLICT = "CONFLICT",
	INTERNAL_ERROR = "INTERNAL_ERROR",
	FIREBASE_ERROR = "FIREBASE_ERROR",
	EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR",
}

export class AppError extends Error {
	statusCode: number;
	errorCode: ErrorCode;
	isOperational: boolean;

	constructor(message: string, statusCode: number, errorCode?: ErrorCode) {
		super(message);
		this.statusCode = statusCode;
		this.errorCode = errorCode || this.getDefaultErrorCode(statusCode);
		this.isOperational = true;

		Error.captureStackTrace(this, this.constructor);
	}

	private getDefaultErrorCode(statusCode: number): ErrorCode {
		switch (statusCode) {
			case 400:
				return ErrorCode.BAD_REQUEST;
			case 401:
				return ErrorCode.UNAUTHORIZED;
			case 403:
				return ErrorCode.FORBIDDEN;
			case 404:
				return ErrorCode.NOT_FOUND;
			case 409:
				return ErrorCode.CONFLICT;
			default:
				return ErrorCode.INTERNAL_ERROR;
		}
	}
}

interface ErrorResponseBody {
	code: ErrorCode;
	message: string;
	details?: unknown;
	stack?: string;
}

export const errorHandler = (
	err: Error,
	req: Request,
	res: Response,
	_next: NextFunction
): void => {
	let statusCode = 500;
	let errorCode = ErrorCode.INTERNAL_ERROR;
	let message = "Internal server error";

	if (err instanceof AppError) {
		statusCode = err.statusCode;
		errorCode = err.errorCode;
		message = err.message;
	} else if (err instanceof ZodError) {
		statusCode = 400;
		errorCode = ErrorCode.VALIDATION_ERROR;
		message = "Validation failed";
	}

	errorLogger.error({
		message: err.message,
		stack: err.stack,
		statusCode,
		errorCode,
		path: req.originalUrl,
		method: req.method,
	});

	const errorBody: ErrorResponseBody = {
		code: errorCode,
		message,
	};

	if (err instanceof ZodError) {
		errorBody.details = err.issues;
	}

	if (process.env.NODE_ENV === "development") {
		errorBody.stack = err.stack;
	}

	res.status(statusCode).json({
		success: false,
		error: errorBody,
	});
};

export const notFound = (req: Request, res: Response): void => {
	res.status(404).json({
		success: false,
		error: {
			code: ErrorCode.NOT_FOUND,
			message: `Route ${req.originalUrl} not found`,
		},
	});
};
