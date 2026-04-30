import api from "./api";
import { Chat, Message, ApiResponse } from "../types";

export const chatApi = {
	getChats: async (): Promise<Chat[]> => {
		const response = await api.get<ApiResponse<Chat[]>>("/chats");
		return response.data.data || [];
	},

	getChat: async (chatId: string): Promise<Chat> => {
		const response = await api.get<ApiResponse<Chat>>(`/chats/${chatId}`);
		return response.data.data!;
	},

	getMessages: async (chatId: string, limit = 50, before?: string): Promise<Message[]> => {
		const params = new URLSearchParams();
		params.append("limit", limit.toString());
		if (before) params.append("before", before);
		const response = await api.get<ApiResponse<Message[]>>(`/chats/${chatId}/messages?${params}`);
		return response.data.data || [];
	},

	sendMessage: async (chatId: string, content: string): Promise<Message> => {
		const response = await api.post<ApiResponse<Message>>(`/chats/${chatId}/messages`, { content });
		return response.data.data!;
	},

	createSupportChat: async (): Promise<Chat> => {
		const response = await api.post<ApiResponse<Chat>>("/chats/support");
		return response.data.data!;
	},

	getSupportChatStatus: async (): Promise<{ hasChat: boolean; chat?: Chat; isClaimed: boolean }> => {
		const response = await api.get<ApiResponse<{ hasChat: true; chat: Chat; isClaimed: boolean } | { hasChat: false }>>("/chats/support/status");
		const data = response.data.data!;
		if (!data.hasChat) {
			return { hasChat: false, isClaimed: false };
		}
		return data as { hasChat: true; chat: Chat; isClaimed: boolean };
	},

	markMessageAsRead: async (chatId: string, messageId: string): Promise<void> => {
		await api.put(`/chats/${chatId}/messages/${messageId}/read`);
	},
};

export const adminChatApi = {
	getPendingChats: async (): Promise<Chat[]> => {
		const response = await api.get<ApiResponse<Chat[]>>("/admin/chats/pending");
		return response.data.data || [];
	},

	getAllChats: async (limit = 20): Promise<Chat[]> => {
		const response = await api.get<ApiResponse<Chat[]>>(`/admin/chats?limit=${limit}`);
		return response.data.data || [];
	},

	getChatMessages: async (chatId: string, limit = 50): Promise<Message[]> => {
		const response = await api.get<ApiResponse<Message[]>>(`/admin/chats/${chatId}/messages?limit=${limit}`);
		return response.data.data || [];
	},

	acceptChat: async (chatId: string): Promise<void> => {
		await api.post(`/admin/chats/${chatId}/accept`);
	},
};