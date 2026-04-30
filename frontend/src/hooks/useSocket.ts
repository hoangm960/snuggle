"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";
import { getToken } from "@/lib/cookies";
import { Message } from "@/types";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:3001";

interface UseSocketOptions {
	onNewMessage?: (message: Message) => void;
	onUserTyping?: (data: { chatId: string; userId: string }) => void;
}

interface UseSocketReturn {
	socket: Socket | null;
	isConnected: boolean;
	joinChat: (chatId: string) => void;
	leaveChat: (chatId: string) => void;
	sendMessage: (chatId: string, content: string) => void;
	sendTyping: (chatId: string) => void;
}

export function useSocket(options?: UseSocketOptions): UseSocketReturn {
	const socketRef = useRef<Socket | null>(null);
	const [isConnected, setIsConnected] = useState(false);
	const optionsRef = useRef(options);
	optionsRef.current = options;

	useEffect(() => {
		const token = getToken();
		if (!token) return;

		const socket = io(SOCKET_URL, {
			auth: { token },
			transports: ["websocket", "polling"],
		});

		socket.on("connect", () => {
			setIsConnected(true);
			console.log("Socket connected");
		});

		socket.on("disconnect", () => {
			setIsConnected(false);
			console.log("Socket disconnected");
		});

		socket.on("new_message", (message: Message) => {
			optionsRef.current?.onNewMessage?.(message);
		});

		socket.on("user_typing", (data: { chatId: string; userId: string }) => {
			optionsRef.current?.onUserTyping?.(data);
		});

		socketRef.current = socket;

		return () => {
			socket.disconnect();
			socketRef.current = null;
		};
	}, []);

	const joinChat = useCallback((chatId: string) => {
		socketRef.current?.emit("join_chat", chatId);
	}, []);

	const leaveChat = useCallback((chatId: string) => {
		socketRef.current?.emit("leave_chat", chatId);
	}, []);

	const sendMessage = useCallback((chatId: string, content: string) => {
		socketRef.current?.emit("send_message", { chatId, content });
	}, []);

	const sendTyping = useCallback((chatId: string) => {
		socketRef.current?.emit("typing", { chatId });
	}, []);

	return {
		socket: socketRef.current,
		isConnected,
		joinChat,
		leaveChat,
		sendMessage,
		sendTyping,
	};
}