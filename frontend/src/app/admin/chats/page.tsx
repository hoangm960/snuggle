"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { adminChatApi } from "@/lib/chatApi";
import { Chat, Message } from "@/types";
import { AdminLayout } from "../_components/AdminLayout";
import { MessageCircle, Clock, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/hooks/useSocket";

interface PendingChat extends Chat {
	userEmail?: string;
}

export default function AdminChatsPage() {
	const [pendingChats, setPendingChats] = useState<PendingChat[]>([]);
	const [allChats, setAllChats] = useState<Chat[]>([]);
	const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
	const [chatMessages, setChatMessages] = useState<Message[]>([]);
	const [newMessage, setNewMessage] = useState("");
	const [activeTab, setActiveTab] = useState<"pending" | "active">("pending");
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingMessages, setIsLoadingMessages] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isOtherTyping, setIsOtherTyping] = useState(false);
	const { user: currentUser } = useAuth();
	const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
const messagesEndRef = useRef<HTMLDivElement>(null);

	const handleNewMessage = useCallback((message: Message) => {
		if (message.chatId === selectedChat?.id) {
			setChatMessages((prev) => {
				if (prev.some((m) => m.id === message.id)) return prev;
				return [...prev, message];
			});
		}
	}, [selectedChat?.id]);

	const handleUserTyping = useCallback((data: { chatId: string; userId: string }) => {
		if (data.chatId === selectedChat?.id && data.userId !== currentUser?.id) {
			setIsOtherTyping(true);
			if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
			typingTimeoutRef.current = setTimeout(() => setIsOtherTyping(false), 3000);
		}
	}, [selectedChat?.id, currentUser?.id]);

	const { joinChat, leaveChat, sendMessage, sendTyping } = useSocket({
		onNewMessage: handleNewMessage,
		onUserTyping: handleUserTyping,
	});

	const loadPendingChats = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const chats = await adminChatApi.getPendingChats();
			setPendingChats(chats as PendingChat[]);
		} catch (err) {
			setError("Failed to load pending chats");
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	}, []);

	const loadAllChats = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const chats = await adminChatApi.getAllChats(50);
			setAllChats(chats.filter((c) => c.claimedBy));
		} catch (err) {
			setError("Failed to load chats");
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	}, []);

	const loadChatMessages = useCallback(async (chatId: string) => {
		setIsLoadingMessages(true);
		try {
			const messages = await adminChatApi.getChatMessages(chatId);
			setChatMessages(messages);
		} catch (err) {
			setError("Failed to load messages");
			console.error(err);
		} finally {
			setIsLoadingMessages(false);
		}
	}, []);

	useEffect(() => {
		loadPendingChats();
		loadAllChats();
	}, [loadPendingChats, loadAllChats]);

	useEffect(() => {
		if (selectedChat?.id) {
			loadChatMessages(selectedChat.id);
		}
	}, [selectedChat?.id, loadChatMessages]);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView();
	}, [chatMessages]);

	useEffect(() => {
		if (!selectedChat?.id) return;
		const chatId = selectedChat.id;
		joinChat(chatId);
		return () => leaveChat(chatId);
	}, [selectedChat?.id, joinChat, leaveChat]);

	const handleAccept = async (chatId: string) => {
		setIsLoading(true);
		try {
			await adminChatApi.acceptChat(chatId);
			await loadPendingChats();
			await loadAllChats();
		} catch (err) {
			setError("Failed to accept chat");
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	};

	const handleSendMessage = async () => {
		if (!selectedChat?.id || !newMessage.trim() || isLoading) return;
		setIsLoading(true);
		try {
			const content = newMessage.trim();
			sendMessage(selectedChat.id, content);
			const { chatApi } = await import("@/lib/chatApi");
			const message = await chatApi.sendMessage(selectedChat.id, content);
			setChatMessages((prev) => [...prev, message]);
			setNewMessage("");
		} catch (err) {
			setError("Failed to send message");
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setNewMessage(e.target.value);
		if (selectedChat?.id) {
			sendTyping(selectedChat.id);
		}
	};

	const formatTime = (date: Date) => {
		return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
	};

	const formatDate = (date: Date) => {
		return new Date(date).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
	};

	const displayedChats = activeTab === "pending" ? pendingChats : allChats;

	return (
		<AdminLayout
			title="Support Chats"
			subtitle="Manage customer support conversations"
		>
			<div className="flex h-[calc(100vh-180px)] gap-4">
				<div className="w-80 shrink-0 overflow-hidden rounded-xl border" style={{ borderColor: "#e5e7eb" }}>
					<div className="flex border-b" style={{ borderColor: "#e5e7eb" }}>
						<button
							onClick={() => setActiveTab("pending")}
							className="flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors"
							style={{
								backgroundColor: activeTab === "pending" ? "#7AADA1" : "transparent",
								color: activeTab === "pending" ? "white" : "#666",
							}}
						>
							<Clock size={16} />
							Pending
							{pendingChats.length > 0 && (
								<span
									className="ml-1 flex h-5 w-5 items-center justify-center rounded-full text-xs"
									style={{ backgroundColor: activeTab === "pending" ? "white" : "#EB4335", color: activeTab === "pending" ? "#7AADA1" : "white" }}
								>
									{pendingChats.length}
								</span>
							)}
						</button>
						<button
							onClick={() => setActiveTab("active")}
							className="flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors"
							style={{
								backgroundColor: activeTab === "active" ? "#7AADA1" : "transparent",
								color: activeTab === "active" ? "white" : "#666",
							}}
						>
							<CheckCircle size={16} />
							Active
						</button>
					</div>

					<div className="overflow-y-auto" style={{ height: "calc(100% - 49px)" }}>
						{displayedChats.length === 0 ? (
							<div className="flex h-full items-center justify-center text-gray-400">
								<div className="text-center">
									<MessageCircle size={32} className="mx-auto mb-2" />
									<p className="text-sm">No {activeTab} chats</p>
								</div>
							</div>
						) : (
							displayedChats.map((chat) => (
								<div
									key={chat.id}
									onClick={() => setSelectedChat(chat)}
									className="cursor-pointer border-b p-4 transition-colors hover:bg-gray-50"
									style={{ borderColor: "#e5e7eb" }}
								>
									<div className="mb-1 flex items-center justify-between">
										<span className="text-sm font-medium">
											Support Chat
										</span>
										{chat.createdAt && (
											<span className="text-xs text-gray-400">
												{formatDate(chat.createdAt)}
											</span>
										)}
									</div>
									{activeTab === "pending" ? (
										<button
											onClick={(e) => {
												e.stopPropagation();
												handleAccept(chat.id!);
											}}
											disabled={isLoading}
											className="mt-2 w-full rounded-lg py-2 text-sm font-medium text-white transition-opacity"
											style={{ backgroundColor: "#7AADA1", opacity: isLoading ? 0.5 : 1 }}
										>
											Accept Chat
										</button>
									) : (
										<p className="text-sm text-gray-500 truncate">
											{chat.lastMessage || "No messages yet"}
										</p>
									)}
								</div>
							))
						)}
					</div>
				</div>

				<div className="flex flex-1 flex-col overflow-hidden rounded-xl border" style={{ borderColor: "#e5e7eb" }}>
					{selectedChat ? (
						<>
							<div
								className="border-b px-4 py-3"
								style={{ borderColor: "#e5e7eb", backgroundColor: "#f9fafb" }}
							>
								<h3 className="font-medium">Chat Details</h3>
								<p className="text-sm text-gray-500">
									Created {selectedChat.createdAt ? formatDate(selectedChat.createdAt) : "N/A"}
								</p>
							</div>

							<div className="flex-1 overflow-y-auto p-4" style={{ backgroundColor: "#f9fafb" }}>
								{isLoadingMessages ? (
									<div className="flex h-full items-center justify-center text-gray-400">
										Loading messages...
									</div>
								) : chatMessages.length === 0 ? (
									<div className="flex h-full items-center justify-center text-gray-400">
										<div className="text-center">
											<MessageCircle size={32} className="mx-auto mb-2" />
											<p className="text-sm">No messages in this chat</p>
										</div>
									</div>
								) : (
									chatMessages.map((msg) => {
										const isAdmin = currentUser?.id && msg.senderId === currentUser.id;
										const isSystem = msg.type === "system";

										return (
											<div
												key={msg.id}
												className="mb-3 flex"
												style={{
													justifyContent: isSystem ? "center" : isAdmin ? "flex-end" : "flex-start",
												}}
											>
												{isSystem ? (
													<span
														className="rounded-full px-3 py-1 text-xs"
														style={{ backgroundColor: "#e5e7eb", color: "#666" }}
													>
														{msg.content}
													</span>
												) : (
													<div
														className="max-w-[70%] rounded-lg px-3 py-2 text-sm"
														style={{
															backgroundColor: isAdmin ? "#7AADA1" : "white",
															border: isAdmin ? "none" : "1px solid #e5e7eb",
															color: isAdmin ? "white" : "inherit",
														}}
													>
														<p>{msg.content}</p>
														<span className="text-xs" style={{ color: isAdmin ? "rgba(255,255,255,0.7)" : "#9ca3af" }}>
															{formatTime(msg.sentAt)}
														</span>
													</div>
												)}
											</div>
										);
							})
						)}
						<div ref={messagesEndRef} />
						{isOtherTyping && (
									<div className="text-xs text-gray-400 px-4 py-1">User is typing...</div>
								)}
							</div>

							{selectedChat.claimedBy && (
								<div className="border-t p-3" style={{ borderColor: "#e5e7eb" }}>
									<div className="flex gap-2">
										<input
											type="text"
											value={newMessage}
											onChange={handleInputChange}
											onKeyPress={handleKeyPress}
											placeholder="Type a message..."
											className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none"
											style={{ borderColor: "#e5e7eb" }}
											disabled={isLoading}
										/>
										<button
											onClick={handleSendMessage}
											disabled={!newMessage.trim() || isLoading}
											className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity"
											style={{
												backgroundColor: "#7AADA1",
												opacity: !newMessage.trim() || isLoading ? 0.5 : 1,
											}}
										>
											Send
										</button>
									</div>
								</div>
							)}
						</>
					) : (
						<div className="flex h-full items-center justify-center text-gray-400">
							<div className="text-center">
								<MessageCircle size={48} className="mx-auto mb-3" />
								<p className="text-sm">Select a chat to view messages</p>
							</div>
						</div>
					)}
				</div>
			</div>
		</AdminLayout>
	);
}