import { authenticate, optionalAuth } from "../../src/middleware/auth";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

jest.mock("../../src/config/firebase", () => ({
	auth: {
		getUser: jest.fn(),
		verifyIdToken: jest.fn(),
	},
}));

import { auth } from "../../src/config/firebase";

describe("auth middleware", () => {
	let mockReq: Partial<Request>;
	let mockRes: Partial<Response>;
	let mockNext: NextFunction;
	let jsonMock: jest.Mock;
	let statusMock: jest.Mock;

	beforeEach(() => {
		jsonMock = jest.fn();
		statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		mockRes = {
			status: statusMock,
		};
		mockNext = jest.fn();
		jest.clearAllMocks();
	});

	describe("authenticate", () => {
		it("should return 401 when no authorization header", async () => {
			mockReq = {
				headers: {},
			};

			await authenticate(mockReq as any, mockRes as Response, mockNext);

			expect(statusMock).toHaveBeenCalledWith(401);
			expect(jsonMock).toHaveBeenCalledWith({
				success: false,
				error: "No token provided",
			});
		});

		it("should return 401 when authorization header is not Bearer", async () => {
			mockReq = {
				headers: {
					authorization: "Basic sometoken",
				},
			};

			await authenticate(mockReq as any, mockRes as Response, mockNext);

			expect(statusMock).toHaveBeenCalledWith(401);
		});

		it("should authenticate with custom token containing uid", async () => {
			const token = jwt.sign({ uid: "user-123" }, "secret");
			mockReq = {
				headers: {
					authorization: `Bearer ${token}`,
				},
			};

			(auth.getUser as jest.Mock).mockResolvedValue({
				uid: "user-123",
				email: "test@example.com",
			});

			await authenticate(mockReq as any, mockRes as Response, mockNext);

			expect(mockNext).toHaveBeenCalled();
			expect((mockReq as any).user).toEqual({
				uid: "user-123",
				email: "test@example.com",
			});
		});

		it("should return 401 with invalid custom token (no uid)", async () => {
			const token = jwt.sign({ data: "invalid" }, "secret");
			mockReq = {
				headers: {
					authorization: `Bearer ${token}`,
				},
			};

			await authenticate(mockReq as any, mockRes as Response, mockNext);

			expect(statusMock).toHaveBeenCalledWith(401);
		});

		it("should authenticate with Firebase token", async () => {
			const mockDecodedToken = {
				uid: "firebase-user-123",
				email: "firebase@example.com",
			};

			mockReq = {
				headers: {
					authorization: "Bearer firebase-token",
				},
			};

			(auth.verifyIdToken as jest.Mock).mockResolvedValue(mockDecodedToken);

			await authenticate(mockReq as any, mockRes as Response, mockNext);

			expect(mockNext).toHaveBeenCalled();
			expect((mockReq as any).user).toEqual({
				uid: "firebase-user-123",
				email: "firebase@example.com",
			});
		});

		it("should return 401 with invalid Firebase token", async () => {
			mockReq = {
				headers: {
					authorization: "Bearer invalid-token",
				},
			};

			(auth.verifyIdToken as jest.Mock).mockRejectedValue(new Error("Invalid token"));

			await authenticate(mockReq as any, mockRes as Response, mockNext);

			expect(statusMock).toHaveBeenCalledWith(401);
		});
	});

	describe("optionalAuth", () => {
		it("should set user with custom token and call next", async () => {
			const token = jwt.sign({ uid: "user-123" }, "secret");
			mockReq = {
				headers: {
					authorization: `Bearer ${token}`,
				},
			};

			(auth.getUser as jest.Mock).mockResolvedValue({
				uid: "user-123",
				email: "test@example.com",
			});

			await optionalAuth(mockReq as any, mockRes as Response, mockNext);

			expect(mockNext).toHaveBeenCalled();
			expect((mockReq as any).user).toBeDefined();
		});

		it("should call next even without token", async () => {
			mockReq = {
				headers: {},
			};

			await optionalAuth(mockReq as any, mockRes as Response, mockNext);

			expect(mockNext).toHaveBeenCalled();
			expect((mockReq as any).user).toBeUndefined();
		});

		it("should call next even with invalid token", async () => {
			mockReq = {
				headers: {
					authorization: "Bearer invalid-token",
				},
			};

			(auth.verifyIdToken as jest.Mock).mockRejectedValue(new Error("Invalid"));

			await optionalAuth(mockReq as any, mockRes as Response, mockNext);

			expect(mockNext).toHaveBeenCalled();
		});
	});
});
