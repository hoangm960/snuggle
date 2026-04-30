import {
	getUserChats,
	getChatById,
	getMessages,
	createChat,
	createSupportChat,
	getSupportChatStatus,
	sendMessage,
	markMessageAsRead,
} from "../../src/controllers/chatController";
import { Request, Response } from "express";
import { AppError } from "../../src/middleware/errorHandler";

// Mock Firebase module with inline mock functions
jest.mock("../../src/config/firebase", () => {
	// Create mock functions inside factory
	const mockDocGet = jest.fn();
	const mockDocUpdate = jest.fn();
	const mockDocDelete = jest.fn();
	const mockCollectionGet = jest.fn();
	const mockCollectionAdd = jest.fn();
	const mockWhere = jest.fn().mockReturnThis();
	const mockOrderBy = jest.fn().mockReturnThis();
	const mockLimit = jest.fn().mockReturnThis();

	return {
		db: {
			collection: jest.fn(() => ({
				doc: jest.fn(() => ({
					get: mockDocGet,
					update: mockDocUpdate,
					delete: mockDocDelete,
				})),
				where: mockWhere,
				orderBy: mockOrderBy,
				limit: mockLimit,
				get: mockCollectionGet,
				add: mockCollectionAdd,
			})),
		},
		auth: {
			getUser: jest.fn(),
			verifyIdToken: jest.fn(),
		},
	};
});

describe("ChatController", () => {
	let mockRes: Partial<Response>;
	let jsonMock: jest.Mock;
	let statusMock: jest.Mock;

	beforeEach(() => {
		jsonMock = jest.fn();
		statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		mockRes = {
			status: statusMock,
			json: jsonMock,
		} as Partial<Response>;
		jest.clearAllMocks();
	});

	describe("getUserChats", () => {
		it("should return user chats", async () => {
			const mockSnapshot = {
				forEach: jest.fn((callback: any) => {
					callback({
						id: "chat1",
						data: () => ({
							participantIds: ["user-123"],
							type: "support",
						}),
					});
				}),
			};

			const { db } = require("../../src/config/firebase");
			const mockCollection = db.collection();
			(mockCollection.get as jest.Mock).mockResolvedValue(mockSnapshot);

			const mockReq = { user: { uid: "user-123" } } as any as Request;

			await getUserChats(mockReq, mockRes as Response);

			expect(statusMock).toHaveBeenCalledWith(200);
		});

		it("should throw 401 when no user", async () => {
			const mockReq = { user: undefined } as any as Request;

			await expect(getUserChats(mockReq, mockRes as Response)).rejects.toThrow(AppError);
		});
	});

	describe("getChatById", () => {
		it("should return chat when user is participant", async () => {
			const { db } = require("../../src/config/firebase");
			const mockCollection = db.collection();
			const mockDoc = mockCollection.doc();
			(mockDoc.get as jest.Mock).mockResolvedValue({
				exists: true,
				data: () => ({
					participantIds: ["user-123", "admin-456"],
					type: "support",
				}),
			});

			const mockReq = {
				user: { uid: "user-123" },
				params: { id: "chat-123" },
			} as any as Request;

			await getChatById(mockReq, mockRes as Response);

			expect(statusMock).toHaveBeenCalledWith(200);
		});

		it("should throw 403 when user is not participant", async () => {
			const { db } = require("../../src/config/firebase");
			const mockCollection = db.collection();
			const mockDoc = mockCollection.doc();
			(mockDoc.get as jest.Mock).mockResolvedValue({
				exists: true,
				data: () => ({ participantIds: ["other-user"] }),
			});

			const mockReq = {
				user: { uid: "user-123" },
				params: { id: "chat-123" },
			} as any as Request;

			await expect(getChatById(mockReq, mockRes as Response)).rejects.toThrow(AppError);
		});
	});

	describe("sendMessage", () => {
		it("should send message successfully", async () => {
			const { db } = require("../../src/config/firebase");
			const mockCollection = db.collection();

			// First call for chats collection
			const mockChatDoc = mockCollection.doc();
			(mockChatDoc.get as jest.Mock).mockResolvedValue({
				exists: true,
				data: () => ({ participantIds: ["user-123"] }),
			});

			// Second call for messages collection
			mockCollection.add.mockResolvedValue({ id: "msg-123" });

			const mockReq = {
				user: { uid: "user-123" },
				params: { id: "chat-123" },
				body: { content: "Hello" },
			} as any as Request;

			await sendMessage(mockReq, mockRes as Response);

			expect(statusMock).toHaveBeenCalledWith(201);
		});

		it("should throw 400 when content is empty", async () => {
			const mockReq = {
				user: { uid: "user-123" },
				params: { id: "chat-123" },
				body: { content: "   " },
			} as any as Request;

			await expect(sendMessage(mockReq, mockRes as Response)).rejects.toThrow(AppError);
		});
	});

	describe("createSupportChat", () => {
		it("should create support chat when none exists", async () => {
			const { db } = require("../../src/config/firebase");
			const mockCollection = db.collection();
			(mockCollection.get as jest.Mock).mockResolvedValue({ empty: true, docs: [] });
			mockCollection.add.mockResolvedValue({ id: "chat-123" });

			const mockReq = { user: { uid: "user-123" } } as any as Request;

			await createSupportChat(mockReq, mockRes as Response);

			expect(statusMock).toHaveBeenCalledWith(201);
		});
	});

	describe("getSupportChatStatus", () => {
		it("should return hasChat false when no chat exists", async () => {
			const { db } = require("../../src/config/firebase");
			const mockCollection = db.collection();
			(mockCollection.get as jest.Mock).mockResolvedValue({ empty: true });

			const mockReq = { user: { uid: "user-123" } } as any as Request;

			await getSupportChatStatus(mockReq, mockRes as Response);

			expect(statusMock).toHaveBeenCalledWith(200);
		});
	});

	describe("markMessageAsRead", () => {
		it("should mark message as read", async () => {
			const { db } = require("../../src/config/firebase");
			const mockCollection = db.collection();

			// Chat doc
			const mockChatDoc = mockCollection.doc();
			(mockChatDoc.get as jest.Mock).mockResolvedValue({
				exists: true,
				data: () => ({ participantIds: ["user-123"] }),
			});

			// Message doc
			const mockMessageDoc = mockCollection.doc();
			const mockUpdate = jest.fn();
			mockMessageDoc.update = mockUpdate;

			const mockReq = {
				user: { uid: "user-123" },
				params: { id: "chat-123", messageId: "msg-123" },
			} as any as Request;

			await markMessageAsRead(mockReq, mockRes as Response);

			expect(statusMock).toHaveBeenCalledWith(200);
		});
	});
});
