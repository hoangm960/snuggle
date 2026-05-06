import { requireAdmin } from "../../src/middleware/admin";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../../src/middleware/errorHandler";

// Mock Firebase module
jest.mock("../../src/config/firebase", () => {
	const mockGet = jest.fn();
	const mockDoc = jest.fn(() => ({ get: mockGet }));
	const mockCollection = jest.fn(() => ({ doc: mockDoc }));

	return {
		db: {
			collection: mockCollection,
		},
	};
});

describe("requireAdmin middleware", () => {
	let mockReq: any;
	let mockRes: Partial<Response>;
	let mockNext: jest.Mock;
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

	it("should call next with error when no user", async () => {
		mockReq = {
			user: undefined,
		};

		await requireAdmin(mockReq, mockRes as Response, mockNext);

		expect(mockNext).toHaveBeenCalled();
		const error = mockNext.mock.calls[0][0];
		expect(error).toBeInstanceOf(AppError);
		expect(error.statusCode).toBe(401);
	});

	it("should call next with error when user profile not found", async () => {
		mockReq = {
			user: { uid: "user-123" },
		};

		const { db } = require("../../src/config/firebase");
		const mockCollection = db.collection();
		const mockDoc = mockCollection.doc();
		(mockDoc.get as jest.Mock).mockResolvedValue({ exists: false });

		await requireAdmin(mockReq, mockRes as Response, mockNext);

		expect(mockNext).toHaveBeenCalled();
		const error = mockNext.mock.calls[0][0];
		expect(error).toBeInstanceOf(AppError);
		expect(error.statusCode).toBe(404);
	});

	it("should call next with error when user is not admin", async () => {
		mockReq = {
			user: { uid: "user-123" },
		};

		const { db } = require("../../src/config/firebase");
		const mockCollection = db.collection();
		const mockDoc = mockCollection.doc();
		(mockDoc.get as jest.Mock).mockResolvedValue({
			exists: true,
			data: () => ({ role: "visitor" }),
		});

		await requireAdmin(mockReq, mockRes as Response, mockNext);

		expect(mockNext).toHaveBeenCalled();
		const error = mockNext.mock.calls[0][0];
		expect(error).toBeInstanceOf(AppError);
		expect(error.statusCode).toBe(403);
	});

	it("should call next without error when user is admin", async () => {
		mockReq = {
			user: { uid: "admin-123" },
		};

		const { db } = require("../../src/config/firebase");
		const mockCollection = db.collection();
		const mockDoc = mockCollection.doc();
		(mockDoc.get as jest.Mock).mockResolvedValue({
			exists: true,
			data: () => ({ role: "admin" }),
		});

		await requireAdmin(mockReq, mockRes as Response, mockNext);

		expect(mockNext).toHaveBeenCalledWith();
	});
});
