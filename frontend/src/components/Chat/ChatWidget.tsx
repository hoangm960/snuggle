"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { chatApi } from "@/lib/chatApi";
import { useSocket } from "@/hooks/useSocket";
import { Chat, Message } from "@/types";

interface ChatWidgetProps {
	onClose: () => void;
}

export default function ChatWidget({ onClose }: ChatWidgetProps) {
	const { user } = useAuth();
	const [chat, setChat] = useState<Chat | null>(null);
	const [messages, setMessages] = useState<Message[]>([]);
	const [newMessage, setNewMessage] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isMinimized, setIsMinimized] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isOtherTyping, setIsOtherTyping] = useState(false);
	const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	const handleNewMessage = useCallback((message: Message) => {
		if (message.chatId === chat?.id) {
			setMessages((prev) => {
				if (prev.some((m) => m.id === message.id)) return prev;
				return [...prev, message];
			});
		}
	}, [chat?.id]);

	const handleUserTyping = useCallback((data: { chatId: string; userId: string }) => {
		if (data.chatId === chat?.id && data.userId !== user?.id && data.userId !== user?.uid) {
			setIsOtherTyping(true);
			if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
			typingTimeoutRef.current = setTimeout(() => setIsOtherTyping(false), 3000);
		}
	}, [chat?.id, user?.id, user?.uid]);

	const { joinChat, leaveChat, sendMessage, sendTyping } = useSocket({
		onNewMessage: handleNewMessage,
		onUserTyping: handleUserTyping,
	});

	const loadChat = useCallback(async () => {
		if (!user) return;
		setIsLoading(true);
		setError(null);
		try {
			const status = await chatApi.getSupportChatStatus();
			if (status.hasChat && status.chat) {
				setChat(status.chat);
				const msgs = await chatApi.getMessages(status.chat.id!);
				setMessages(msgs);
			} else {
				const newChat = await chatApi.createSupportChat();
				setChat(newChat);
				setMessages([]);
			}
		} catch (err) {
			setError("Failed to connect. Please try again.");
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	}, [user]);

	const loadMessages = useCallback(async () => {
		if (!chat?.id) return;
		try {
			const msgs = await chatApi.getMessages(chat.id);
			setMessages(msgs);
		} catch (err) {
			console.error(err);
		}
	}, [chat?.id]);

	useEffect(() => {
		loadChat();
	}, [loadChat]);

	useEffect(() => {
		if (!chat?.id) return;
		const chatId = chat.id;
		joinChat(chatId);
		return () => leaveChat(chatId);
	}, [chat?.id, joinChat, leaveChat]);

	const handleSendMessage = async () => {
		if (!chat?.id || !newMessage.trim() || isLoading) return;
		setIsLoading(true);
		try {
			const content = newMessage.trim();
			sendMessage(chat.id, content);
			const message = await chatApi.sendMessage(chat.id, content);
			setMessages((prev) => [...prev, message]);
			setNewMessage("");
		} catch (err) {
			setError("Failed to send message.");
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
		if (chat?.id) {
			sendTyping(chat.id);
		}
	};

	return (
		<div
			className="fixed bottom-20 right-6 z-50 w-80 overflow-hidden rounded-xl shadow-2xl"
			style={{
				height: isMinimized ? "auto" : "450px",
				backgroundColor: "white",
				border: "1px solid #e5e7eb",
			}}
		>
			<div
				className="flex items-center justify-between px-4 py-3"
				style={{ backgroundColor: "#7AADA1" }}
			>
				<span className="font-medium text-white">Support Chat</span>
				<div className="flex gap-2">
					<button
						onClick={() => setIsMinimized(!isMinimized)}
						className="p-1 text-white hover:opacity-80"
						aria-label={isMinimized ? "Expand" : "Minimize"}
					>
						{isMinimized ? (
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
								<polyline points="17 11 12 6 7 11" />
								<polyline points="17 18 12 13 7 18" />
							</svg>
						) : (
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
								<polyline points="17 6 12 11 7 6" />
								<polyline points="17 13 12 18 7 13" />
							</svg>
						)}
					</button>
					<button onClick={onClose} className="p-1 text-white hover:opacity-80" aria-label="Close">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
							<line x1="18" y1="6" x2="6" y2="18" />
							<line x1="6" y1="6" x2="18" y2="18" />
						</svg>
					</button>
				</div>
			</div>

			{!isMinimized && (
				<>
					{error && (
						<div className="px-4 py-2 text-sm" style={{ color: "#EB4335" }}>
							{error}
						</div>
					)}

					<div
						className="overflow-y-auto px-3 py-2"
						style={{ height: "320px", backgroundColor: "#f9fafb" }}
					>
						{isLoading && messages.length === 0 ? (
							<div className="flex h-full items-center justify-center text-gray-400">
								Loading...
							</div>
						) : messages.length === 0 ? (
							<div className="flex h-full items-center justify-center text-center text-gray-400">
								<div className="text-sm">No messages yet. Start the conversation!</div>
							</div>
) : (
							messages.map((msg) => {
								const isOwnMessage = msg.senderId === user?.uid || msg.senderId === user?.id;
								return (
									<div
										key={msg.id}
										className="mb-2 flex"
										style={{
											justifyContent: isOwnMessage ? "flex-end" : "flex-start",
										}}
									>
										<div
											className="max-w-[75%] rounded-lg px-3 py-2 text-sm"
											style={{
												backgroundColor: isOwnMessage ? "#7AADA1" : "white",
												color: isOwnMessage ? "white" : "#333",
												border: isOwnMessage ? "none" : "1px solid #e5e7eb",
											}}
										>
											{msg.content}
										</div>
									</div>
								);
							})
						)}
						{isOtherTyping && (
							<div className="text-xs text-gray-400 px-3 py-1">Someone is typing...</div>
						)}
					</div>

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
								disabled={!chat?.id || isLoading}
							/>
							<button
								onClick={handleSendMessage}
								disabled={!newMessage.trim() || !chat?.id || isLoading}
								className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity"
								style={{
									backgroundColor: "#7AADA1",
									opacity: !newMessage.trim() || !chat?.id || isLoading ? 0.5 : 1,
								}}
							>
								Send
							</button>
						</div>
					</div>
				</>
			)}
		</div>
	);
}