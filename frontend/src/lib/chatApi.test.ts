import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import api from "./api";
import { chatApi, adminChatApi } from "./chatApi";
import { Chat, Message } from "@/types";

vi.mock("./api", () => ({
	__esModule: true,
	default: {
		get: vi.fn(),
		post: vi.fn(),
		put: vi.fn(),
	},
}));

describe("chatApi", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("getChats", () => {
		it("should fetch chats successfully", async () => {
			const mockChats: Chat[] = [
				{ id: "chat1", participants: ["user1"], type: "support", status: "open", createdAt: new Date(), updatedAt: new Date() },
			];
			(api.get as any).mockResolvedValue({ data: { data: mockChats } });

			const result = await chatApi.getChats();

			expect(api.get).toHaveBeenCalledWith("/chats");
			expect(result).toEqual(mockChats);
		});

		it("should return empty array when no data", async () => {
			(api.get as any).mockResolvedValue({ data: {} });

			const result = await chatApi.getChats();

			expect(result).toEqual([]);
		});
	});

	describe("getChat", () => {
		it("should fetch single chat by id", async () => {
			const mockChat: Chat = { id: "chat1", participants: ["user1"], type: "support", status: "open", createdAt: new Date(), updatedAt: new Date() };
			(api.get as any).mockResolvedValue({ data: { data: mockChat } });

			const result = await chatApi.getChat("chat1");

			expect(api.get).toHaveBeenCalledWith("/chats/chat1");
			expect(result).toEqual(mockChat);
		});
	});

	describe("getMessages", () => {
		it("should fetch messages with default params", async () => {
			const mockMessages: Message[] = [{ id: "msg1", chatId: "chat1", senderId: "user1", content: "Hello", createdAt: new Date() }];
			(api.get as any).mockResolvedValue({ data: { data: mockMessages } });

			const result = await chatApi.getMessages("chat1");

			expect(api.get).toHaveBeenCalledWith("/chats/chat1/messages?limit=50");
			expect(result).toEqual(mockMessages);
		});

		it("should fetch messages with custom params", async () => {
			const mockMessages: Message[] = [];
			(api.get as any).mockResolvedValue({ data: { data: mockMessages } });

			await chatApi.getMessages("chat1", 20, "msg-before");

			expect(api.get).toHaveBeenCalledWith("/chats/chat1/messages?limit=20&before=msg-before");
		});
	});

	describe("sendMessage", () => {
		it("should send a message successfully", async () => {
			const mockMessage: Message = { id: "msg1", chatId: "chat1", senderId: "user1", content: "Hello", createdAt: new Date() };
			(api.post as any).mockResolvedValue({ data: { data: mockMessage } });

			const result = await chatApi.sendMessage("chat1", "Hello");

			expect(api.post).toHaveBeenCalledWith("/chats/chat1/messages", { content: "Hello" });
			expect(result).toEqual(mockMessage);
		});
	});

	describe("createSupportChat", () => {
		it("should create support chat successfully", async () => {
			const mockChat: Chat = { id: "chat1", participants: ["user1"], type: "support", status: "open", createdAt: new Date(), updatedAt: new Date() };
			(api.post as any).mockResolvedValue({ data: { data: mockChat } });

			const result = await chatApi.createSupportChat();

			expect(api.post).toHaveBeenCalledWith("/chats/support");
			expect(result).toEqual(mockChat);
		});
	});

	describe("getSupportChatStatus", () => {
		it("should return status with chat when hasChat is true", async () => {
			const mockChat: Chat = { id: "chat1", participants: ["user1"], type: "support", status: "open", createdAt: new Date(), updatedAt: new Date() };
			(api.get as any).mockResolvedValue({ data: { data: { hasChat: true, chat: mockChat, isClaimed: true } } });

			const result = await chatApi.getSupportChatStatus();

			expect(result).toEqual({ hasChat: true, chat: mockChat, isClaimed: true });
		});

		it("should return hasChat false when no chat", async () => {
			(api.get as any).mockResolvedValue({ data: { data: { hasChat: false } } });

			const result = await chatApi.getSupportChatStatus();

			expect(result).toEqual({ hasChat: false, isClaimed: false });
		});
	});

	describe("markMessageAsRead", () => {
		it("should mark message as read", async () => {
			(api.put as any).mockResolvedValue({});

			await chatApi.markMessageAsRead("chat1", "msg1");

			expect(api.put).toHaveBeenCalledWith("/chats/chat1/messages/msg1/read");
		});
	});
});

describe("adminChatApi", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("getPendingChats", () => {
		it("should fetch pending chats", async () => {
			const mockChats: Chat[] = [];
			(api.get as any).mockResolvedValue({ data: { data: mockChats } });

			const result = await adminChatApi.getPendingChats();

			expect(api.get).toHaveBeenCalledWith("/admin/chats/pending");
			expect(result).toEqual([]);
		});
	});

	describe("getAllChats", () => {
		it("should fetch all chats with limit", async () => {
			const mockChats: Chat[] = [];
			(api.get as any).mockResolvedValue({ data: { data: mockChats } });

			await adminChatApi.getAllChats(20);

			expect(api.get).toHaveBeenCalledWith("/admin/chats?limit=20");
		});
	});

	describe("getChatMessages", () => {
		it("should fetch chat messages for admin", async () => {
			const mockMessages: Message[] = [];
			(api.get as any).mockResolvedValue({ data: { data: mockMessages } });

			await adminChatApi.getChatMessages("chat1", 50);

			expect(api.get).toHaveBeenCalledWith("/admin/chats/chat1/messages?limit=50");
		});
	});

	describe("acceptChat", () => {
		it("should accept a chat", async () => {
			(api.post as any).mockResolvedValue({});

			await adminChatApi.acceptChat("chat1");

			expect(api.post).toHaveBeenCalledWith("/admin/chats/chat1/accept");
		});
	});
});
