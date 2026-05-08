"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { chatApi } from "@/lib/chatApi";
import { useSocket } from "@/hooks/useSocket";
import { Chat, Message } from "@/types";
import { X, Send, Bot, User } from "lucide-react";

interface ChatWidgetProps {
	onClose: () => void;
}

function now(): string {
	return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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
	const bottomRef = useRef<HTMLDivElement>(null);

	const handleNewMessage = useCallback(
		(message: Message) => {
			if (message.chatId === chat?.id) {
				if (message.senderId === user?.id) return;
				setMessages((prev) => {
					if (prev.some((m) => m.id === message.id)) return prev;
					return [...prev, message];
				});
			}
		},
		[chat?.id, user?.id]
	);

	const handleUserTyping = useCallback(
		(data: { chatId: string; userId: string }) => {
			if (data.chatId === chat?.id && data.userId !== user?.id) {
				setIsOtherTyping(true);
				if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
				typingTimeoutRef.current = setTimeout(() => setIsOtherTyping(false), 3000);
			}
		},
		[chat?.id, user?.id]
	);

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
		if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

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
		<>
			<div
				className="fixed bottom-24 right-6 z-50 flex w-80 flex-col overflow-hidden rounded-2xl shadow-2xl"
				style={{
					maxHeight: "480px",
					background: "#fff",
					border: "1px solid #E8E8E8",
				}}
			>
				<div
					className="flex items-center gap-3 px-4 py-3"
					style={{
						background: "linear-gradient(135deg, #7AADA1, #216959)",
						color: "#fff",
					}}
				>
					<div
						className="size-8 rounded-full flex items-center justify-center"
						style={{ background: "rgba(255,255,255,0.2)" }}
					>
						<Bot className="size-4" />
					</div>
					<div>
						<p
							style={{
								fontFamily: "'Space Grotesk', sans-serif",
								fontSize: "14px",
								fontWeight: 600,
							}}
						>
							Snuggle Support
						</p>
						<p style={{ fontSize: "11px", opacity: 0.8 }}>Usually replies instantly</p>
					</div>
					<button
						onClick={onClose}
						className="ml-auto size-7 rounded-lg flex items-center justify-center"
						style={{ background: "rgba(255,255,255,0.15)" }}
					>
						<X className="size-3.5" />
					</button>
				</div>

				<div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: "#F9F6F2" }}>
					{error && (
						<div className="rounded-lg px-3 py-2 text-sm" style={{ background: "#fff", color: "#EB4335" }}>
							{error}
						</div>
					)}

					{isLoading && messages.length === 0 ? (
						<div className="flex h-full items-center justify-center text-gray-400">Loading...</div>
					) : messages.length === 0 ? (
						<div className="flex h-full items-center justify-center text-center text-gray-400">
							<div className="text-sm">No messages yet. Start the conversation!</div>
						</div>
					) : (
						messages.map((msg) => {
							const isOwnMessage = msg.senderId === user?.id;
							return (
								<div
									key={msg.id}
									className={`flex items-end gap-2 ${isOwnMessage ? "flex-row-reverse" : ""}`}
								>
									<div
										className="size-6 rounded-full flex items-center justify-center shrink-0"
										style={{
											background: isOwnMessage ? "#216959" : "#E8F4F1",
										}}
									>
										{isOwnMessage ? (
											<User className="size-3.5 text-white" />
										) : (
											<Bot className="size-3.5" style={{ color: "#7AADA1" }} />
										)}
									</div>
									<div className="max-w-[78%]">
										<div
											className="rounded-2xl px-3 py-2"
											style={{
												background: isOwnMessage
													? "linear-gradient(135deg, #7AADA1, #216959)"
													: "#fff",
												color: isOwnMessage ? "#fff" : "#333",
												borderBottomLeftRadius: isOwnMessage ? "4px" : undefined,
												borderBottomRightRadius: isOwnMessage ? undefined : "4px",
												border: isOwnMessage ? "none" : "1px solid #F0F0F0",
											}}
										>
											<p style={{ fontSize: "13px", lineHeight: 1.5 }}>{msg.content}</p>
										</div>
										<p
											style={{
												fontSize: "10px",
												color: "#bbb",
												marginTop: "3px",
												textAlign: isOwnMessage ? "right" : "left",
											}}
										>
											{now()}
										</p>
									</div>
								</div>
							);
						})
					)}
					{isOtherTyping && (
						<div className="flex items-end gap-2">
							<div
								className="size-6 rounded-full flex items-center justify-center"
								style={{ background: "#E8F4F1" }}
							>
								<Bot className="size-3.5" style={{ color: "#7AADA1" }} />
							</div>
							<div
								className="rounded-2xl px-4 py-3 flex gap-1"
								style={{
									background: "#fff",
									border: "1px solid #F0F0F0",
									borderBottomLeftRadius: "4px",
								}}
							>
								{[0, 1, 2].map((i) => (
									<span
										key={i}
										className="size-1.5 rounded-full"
										style={{
											background: "#ccc",
											animation: `bounce 1.2s ${i * 0.2}s infinite`,
										}}
									/>
								))}
							</div>
						</div>
					)}
					<div ref={bottomRef} />
				</div>

				<div
					className="p-3 flex gap-2"
					style={{ background: "#fff", borderTop: "1px solid #F0F0F0" }}
				>
					<input
						value={newMessage}
						onChange={handleInputChange}
						onKeyDown={handleKeyPress}
						placeholder="Type a message..."
						className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
						style={{
							background: "#F9F6F2",
							border: "1px solid #E8E8E8",
							color: "#333",
						}}
						disabled={!chat?.id || isLoading}
					/>
					<button
						onClick={handleSendMessage}
						disabled={!newMessage.trim() || !chat?.id || isLoading}
						className="size-9 rounded-xl flex items-center justify-center transition-opacity disabled:opacity-40"
						style={{ background: "linear-gradient(135deg, #7AADA1, #216959)", color: "#fff" }}
					>
						<Send className="size-4" />
					</button>
				</div>
			</div>

			<style>{`
				@keyframes bounce {
					0%, 80%, 100% { transform: translateY(0); }
					40% { transform: translateY(-4px); }
				}
			`}</style>
		</>
	);
}
