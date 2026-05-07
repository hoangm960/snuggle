import { AppError, ErrorCode, errorHandler, notFound } from "../../src/middleware/errorHandler";
import { ZodError } from "zod";
import { Request, Response, NextFunction } from "express";

describe("AppError", () => {
	it("should create error with default error code based on status code", () => {
		const error = new AppError("Bad request", 400);
		expect(error.message).toBe("Bad request");
		expect(error.statusCode).toBe(400);
		expect(error.errorCode).toBe(ErrorCode.BAD_REQUEST);
		expect(error.isOperational).toBe(true);
	});

	it("should create error with custom error code", () => {
		const error = new AppError("Unauthorized", 401, ErrorCode.UNAUTHORIZED);
		expect(error.errorCode).toBe(ErrorCode.UNAUTHORIZED);
	});

	it("should map 401 to UNAUTHORIZED", () => {
		const error = new AppError("Unauthorized", 401);
		expect(error.errorCode).toBe(ErrorCode.UNAUTHORIZED);
	});

	it("should map 403 to FORBIDDEN", () => {
		const error = new AppError("Forbidden", 403);
		expect(error.errorCode).toBe(ErrorCode.FORBIDDEN);
	});

	it("should map 404 to NOT_FOUND", () => {
		const error = new AppError("Not found", 404);
		expect(error.errorCode).toBe(ErrorCode.NOT_FOUND);
	});

	it("should map 409 to CONFLICT", () => {
		const error = new AppError("Conflict", 409);
		expect(error.errorCode).toBe(ErrorCode.CONFLICT);
	});

	it("should map unknown status to INTERNAL_ERROR", () => {
		const error = new AppError("Error", 500);
		expect(error.errorCode).toBe(ErrorCode.INTERNAL_ERROR);
	});
});

describe("errorHandler", () => {
	let mockReq: Partial<Request>;
	let mockRes: Partial<Response>;
	let mockNext: NextFunction;
	let jsonMock: jest.Mock;
	let statusMock: jest.Mock;

	beforeEach(() => {
		jsonMock = jest.fn();
		statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		mockReq = {
			originalUrl: "/api/test",
			method: "GET",
		};
		mockRes = {
			status: statusMock,
		};
		mockNext = jest.fn();
	});

	it("should handle AppError", () => {
		const error = new AppError("Test error", 400, ErrorCode.BAD_REQUEST);

		errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

		expect(statusMock).toHaveBeenCalledWith(400);
		expect(jsonMock).toHaveBeenCalledWith({
			success: false,
			error: {
				code: ErrorCode.BAD_REQUEST,
				message: "Test error",
			},
		});
	});

	it("should handle ZodError", () => {
		const error = new ZodError([]);

		errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

		expect(statusMock).toHaveBeenCalledWith(400);
		expect(jsonMock).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				error: expect.objectContaining({
					code: ErrorCode.VALIDATION_ERROR,
					message: "Validation failed",
				}),
			})
		);
	});

	it("should handle generic Error", () => {
		const error = new Error("Generic error");

		errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

		expect(statusMock).toHaveBeenCalledWith(500);
		expect(jsonMock).toHaveBeenCalledWith({
			success: false,
			error: {
				code: ErrorCode.INTERNAL_ERROR,
				message: "Internal server error",
			},
		});
	});

	it("should include stack trace in development", () => {
		const originalEnv = process.env.NODE_ENV;
		process.env.NODE_ENV = "development";

		const error = new AppError("Test error", 400);
		error.stack = "Error: Test error\n    at test";

		errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

		const jsonCall = jsonMock.mock.calls[0][0];
		expect(jsonCall.error.stack).toBe("Error: Test error\n    at test");

		process.env.NODE_ENV = originalEnv;
	});

	it("should not include stack trace in production", () => {
		const originalEnv = process.env.NODE_ENV;
		process.env.NODE_ENV = "production";

		const error = new AppError("Test error", 400);

		errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

		const jsonCall = jsonMock.mock.calls[0][0];
		expect(jsonCall.error.stack).toBeUndefined();

		process.env.NODE_ENV = originalEnv;
	});
});

describe("notFound", () => {
	it("should return 404 with NOT_FOUND error code", () => {
		const mockReq = {
			originalUrl: "/api/nonexistent",
		} as Request;
		const jsonMock = jest.fn();
		const mockRes = {
			status: jest.fn().mockReturnValue({ json: jsonMock }),
		} as unknown as Response;

		notFound(mockReq, mockRes);

		expect(mockRes.status).toHaveBeenCalledWith(404);
		expect(jsonMock).toHaveBeenCalledWith({
			success: false,
			error: {
				code: ErrorCode.NOT_FOUND,
				message: "Route /api/nonexistent not found",
			},
		});
	});
});
