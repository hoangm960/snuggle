import { Response } from "express";
import { db } from "../config/firebase";
import { Chat, Message, AuthRequest, ApiResponse } from "../types";
import { AppError } from "../middleware/errorHandler";

const chatsCollection = db.collection("chats");
const messagesCollection = db.collection("messages");
const applicationsCollection = db.collection("adoptionApplications");

export const getUserChats = async (req: AuthRequest, res: Response): Promise<void> => {
	if (!req.user) {
		throw new AppError("Unauthorized", 401);
	}

	const userId = req.user.uid;
	const query = chatsCollection.where("participantIds", "array-contains", userId);

	const snapshot = await query.orderBy("lastMessageAt", "desc").get();
	const chats: Chat[] = [];

	snapshot.forEach((doc) => {
		const data = doc.data();
		chats.push({
			id: doc.id,
			...data,
			createdAt: data.createdAt?.toDate(),
			lastMessageAt: data.lastMessageAt?.toDate(),
		} as Chat);
	});

	const response: ApiResponse<Chat[]> = {
		success: true,
		data: chats,
	};

	res.status(200).json(response);
};

export const getChatById = async (req: AuthRequest, res: Response): Promise<void> => {
	if (!req.user) {
		throw new AppError("Unauthorized", 401);
	}

	const { id } = req.params;
	const doc = await chatsCollection.doc(id).get();

	if (!doc.exists) {
		throw new AppError("Chat not found", 404);
	}

	const chatData = doc.data();

	if (!chatData || !chatData.participantIds.includes(req.user.uid)) {
		throw new AppError("Not authorized to view this chat", 403);
	}

	const response: ApiResponse<Chat> = {
		success: true,
		data: {
			id: doc.id,
			...chatData,
			createdAt: (chatData.createdAt as { toDate(): Date })?.toDate(),
			lastMessageAt: (chatData.lastMessageAt as { toDate(): Date })?.toDate(),
		} as Chat,
	};

	res.status(200).json(response);
};

export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
	if (!req.user) {
		throw new AppError("Unauthorized", 401);
	}

	const { id } = req.params;
	const { limit = "50", before } = req.query;

	const chatDoc = await chatsCollection.doc(id).get();
	if (!chatDoc.exists) {
		throw new AppError("Chat not found", 404);
	}

	const chatData = chatDoc.data() as Chat;
	if (!chatData.participantIds.includes(req.user.uid)) {
		throw new AppError("Not authorized to view this chat", 403);
	}

	let query: FirebaseFirestore.Query = messagesCollection
		.where("chatId", "==", id)
		.orderBy("sentAt", "desc")
		.limit(Number(limit));

	if (before) {
		const beforeDoc = await messagesCollection.doc(before as string).get();
		if (beforeDoc.exists) {
			const beforeData = beforeDoc.data() as Message;
			query = query.where("sentAt", "<", beforeData.sentAt);
		}
	}

	const snapshot = await query.get();
	const messages: Message[] = [];

	snapshot.forEach((doc) => {
		const data = doc.data();
		messages.push({
			id: doc.id,
			...data,
			sentAt: data.sentAt?.toDate(),
		} as Message);
	});

	messages.reverse();

	const response: ApiResponse<Message[]> = {
		success: true,
		data: messages,
	};

	res.status(200).json(response);
};

export const createChat = async (req: AuthRequest, res: Response): Promise<void> => {
	if (!req.user) {
		throw new AppError("Unauthorized", 401);
	}

	const { applicationId } = req.body;

	if (applicationId) {
		const applicationDoc = await applicationsCollection.doc(applicationId).get();
		if (!applicationDoc.exists) {
			throw new AppError("Application not found", 404);
		}

		const applicationData = applicationDoc.data() as {
			adopterId: string;
			shelterId: string;
		} | undefined;

		if (!applicationData) {
			throw new AppError("Application data not found", 404);
		}

		const existingChats = await chatsCollection
			.where("applicationId", "==", applicationId)
			.get();

		if (!existingChats.empty) {
			const existingChat = existingChats.docs[0];
			const response: ApiResponse<Chat> = {
				success: true,
				data: { id: existingChat.id, ...existingChat.data() } as Chat,
			};
			res.status(200).json(response);
			return;
		}

		const participantIds = [
			applicationData.adopterId,
			applicationData.shelterId,
		];

		const chatData: Omit<Chat, "id"> = {
			type: "application",
			applicationId,
			participantIds,
			createdAt: new Date(),
		};

		const docRef = await chatsCollection.add(chatData);
		const chat: Chat = { id: docRef.id, ...chatData };

		await applicationsCollection.doc(applicationId).update({ chatId: docRef.id });

		const response: ApiResponse<Chat> = {
			success: true,
			data: chat,
			message: "Chat created successfully",
		};

		res.status(201).json(response);
		return;
	}

	throw new AppError("Application ID is required for this chat type", 400);
};

export const createSupportChat = async (req: AuthRequest, res: Response): Promise<void> => {
	if (!req.user) {
		throw new AppError("Unauthorized", 401);
	}

	const userId = req.user.uid;

	const existingChats = await chatsCollection
		.where("participantIds", "array-contains", userId)
		.where("type", "==", "support")
		.get();

	const activeSupportChat = existingChats.docs.find((doc) => {
		const data = doc.data() as Chat;
		return data.claimedBy !== undefined;
	});

	if (!existingChats.empty && activeSupportChat) {
		const response: ApiResponse<Chat> = {
			success: true,
			data: { id: activeSupportChat.id, ...activeSupportChat.data() } as Chat,
		};
		res.status(200).json(response);
		return;
	}

	const chatData: Omit<Chat, "id"> = {
		type: "support",
		participantIds: [userId],
		claimedBy: null,
		createdAt: new Date(),
	};

	const docRef = await chatsCollection.add(chatData);
	const chat: Chat = { id: docRef.id, ...chatData };

	const response: ApiResponse<Chat> = {
		success: true,
		data: chat,
		message: "Support chat created. An admin will be with you shortly.",
	};

	res.status(201).json(response);
};

export const getSupportChatStatus = async (req: AuthRequest, res: Response): Promise<void> => {
	if (!req.user) {
		throw new AppError("Unauthorized", 401);
	}

	const userId = req.user.uid;

	const existingChats = await chatsCollection
		.where("participantIds", "array-contains", userId)
		.where("type", "==", "support")
		.get();

	if (existingChats.empty) {
		const response: ApiResponse<{ hasChat: false }> = {
			success: true,
			data: { hasChat: false },
		};
		res.status(200).json(response);
		return;
	}

	const chat = existingChats.docs[0];
	const chatData = chat.data() as Chat;

	const response: ApiResponse<{
		hasChat: true;
		chat: Chat;
		isClaimed: boolean;
	}> = {
		success: true,
		data: {
			hasChat: true,
			chat: { id: chat.id, ...chatData } as Chat,
			isClaimed: chatData.claimedBy !== undefined,
		},
	};

	res.status(200).json(response);
};

export const getPendingChats = async (): Promise<Chat[]> => {
	const query = chatsCollection
		.where("type", "==", "support")
		.where("claimedBy", "==", null)
		.orderBy("createdAt", "desc");

	const snapshot = await query.get();
	const chats: Chat[] = [];

	snapshot.forEach((doc) => {
		const data = doc.data();
		chats.push({
			id: doc.id,
			...data,
			createdAt: data.createdAt?.toDate(),
			lastMessageAt: data.lastMessageAt?.toDate(),
			claimedAt: data.claimedAt?.toDate(),
		} as Chat);
	});

	return chats;
};

export const acceptChat = async (
	req: AuthRequest,
	_res: Response
): Promise<void> => {
	if (!req.user) {
		throw new AppError("Unauthorized", 401);
	}

	const { id } = req.params;
	const adminId = req.user.uid;

	const chatDoc = await chatsCollection.doc(id).get();
	if (!chatDoc.exists) {
		throw new AppError("Chat not found", 404);
	}

	const chatData = chatDoc.data() as Chat;

	if (chatData.claimedBy) {
		throw new AppError("Chat already claimed", 400);
	}

	await chatsCollection.doc(id).update({
		claimedBy: adminId,
		claimedAt: new Date(),
		participantIds: [chatData.participantIds[0], adminId],
	});

	const messageData: Omit<Message, "id"> = {
		chatId: id,
		senderId: adminId,
		content: "An admin has joined the chat. How can I help you?",
		type: "system",
		isRead: true,
		sentAt: new Date(),
	};

	await messagesCollection.add(messageData);
};

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
	if (!req.user) {
		throw new AppError("Unauthorized", 401);
	}

	const { id } = req.params;
	const { content } = req.body;

	if (!content || content.trim().length === 0) {
		throw new AppError("Message content is required", 400);
	}

	const chatDoc = await chatsCollection.doc(id).get();
	if (!chatDoc.exists) {
		throw new AppError("Chat not found", 404);
	}

	const chatData = chatDoc.data() as Chat;
	if (!chatData.participantIds.includes(req.user.uid)) {
		throw new AppError("Not authorized to send messages in this chat", 403);
	}

	const messageData: Omit<Message, "id"> = {
		chatId: id,
		senderId: req.user.uid,
		content: content.trim(),
		type: "text",
		isRead: false,
		sentAt: new Date(),
	};

	const docRef = await messagesCollection.add(messageData);
	const message: Message = { id: docRef.id, ...messageData };

	await chatsCollection.doc(id).update({
		lastMessage: content.trim(),
		lastMessageAt: messageData.sentAt,
	});

	const response: ApiResponse<Message> = {
		success: true,
		data: message,
	};

	res.status(201).json(response);
};

export const markMessageAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
	if (!req.user) {
		throw new AppError("Unauthorized", 401);
	}

	const { id, messageId } = req.params;

	const chatDoc = await chatsCollection.doc(id).get();
	if (!chatDoc.exists) {
		throw new AppError("Chat not found", 404);
	}

	const chatData = chatDoc.data() as Chat;
	if (!chatData.participantIds.includes(req.user.uid)) {
		throw new AppError("Not authorized", 403);
	}

	await messagesCollection.doc(messageId).update({ isRead: true });

	const response: ApiResponse = {
		success: true,
	};

	res.status(200).json(response);
};

interface AdminChatOptions {
	limit?: number;
	search?: string;
}

export const getAllChats = async (options: AdminChatOptions): Promise<Chat[]> => {
	const { limit = 20 } = options;

	const query = chatsCollection.orderBy("createdAt", "desc").limit(limit);

	const snapshot = await query.get();
	const chats: Chat[] = [];

	snapshot.forEach((doc) => {
		const data = doc.data();
		chats.push({
			id: doc.id,
			...data,
			createdAt: data.createdAt?.toDate(),
			lastMessageAt: data.lastMessageAt?.toDate(),
			claimedAt: data.claimedAt?.toDate(),
		} as Chat);
	});

	return chats;
};

interface AdminMessageOptions {
	chatId: string;
	limit?: number;
}

export const getChatMessages = async (
	options: AdminMessageOptions
): Promise<Message[]> => {
	const { chatId, limit = 50 } = options;

	const query = messagesCollection
		.where("chatId", "==", chatId)
		.orderBy("sentAt", "desc")
		.limit(limit);

	const snapshot = await query.get();
	const messages: Message[] = [];

	snapshot.forEach((doc) => {
		const data = doc.data();
		messages.push({
			id: doc.id,
			...data,
			sentAt: data.sentAt?.toDate(),
		} as Message);
	});

	messages.reverse();

	return messages;
};