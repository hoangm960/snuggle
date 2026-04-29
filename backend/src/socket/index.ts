import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import { auth } from "../config/firebase";

interface AuthenticatedSocket extends Socket {
	userId?: string;
}

interface SocketEvents {
	join_chat: string;
	send_message: {
		chatId: string;
		content: string;
	};
	typing: {
		chatId: string;
	};
	leave_chat: string;
}

const isCustomToken = (token: string): boolean => {
	try {
		const decoded = jwt.decode(token);
		return !!(decoded && typeof decoded === "object" && "uid" in decoded);
	} catch {
		return false;
	}
};

export const initializeSocket = (httpServer: HttpServer): Server => {
	const io = new Server(httpServer, {
		cors: {
			origin: process.env.FRONTEND_URL || "http://localhost:3000",
			methods: ["GET", "POST"],
			credentials: true,
		},
	});

	io.use(async (socket: AuthenticatedSocket, next) => {
		const token =
			socket.handshake.auth.token || socket.handshake.query.token;

		if (!token || typeof token !== "string") {
			return next(new Error("Authentication required"));
		}

		try {
			if (isCustomToken(token)) {
				const decoded = jwt.decode(token) as jwt.JwtPayload;
				const uid = decoded?.uid;

				if (!uid) {
					return next(new Error("Invalid token"));
				}

				const userRecord = await auth.getUser(uid);
				socket.userId = userRecord.uid;
			} else {
				const decodedToken = await auth.verifyIdToken(token);
				socket.userId = decodedToken.uid;
			}

			next();
		} catch {
			next(new Error("Invalid token"));
		}
	});

	io.on("connection", (socket: AuthenticatedSocket) => {
		console.log(`User connected: ${socket.userId}`);

		socket.on("join_chat", (chatId: string) => {
			if (!socket.userId) return;

			const room = `chat:${chatId}`;
			socket.join(room);
			console.log(`User ${socket.userId} joined room: ${room}`);
		});

		socket.on("leave_chat", (chatId: string) => {
			if (!socket.userId) return;

			const room = `chat:${chatId}`;
			socket.leave(room);
			console.log(`User ${socket.userId} left room: ${room}`);
		});

		socket.on("send_message", (data: { chatId: string; content: string }) => {
			if (!socket.userId) return;

			io.to(`chat:${data.chatId}`).emit("new_message", {
				chatId: data.chatId,
				senderId: socket.userId,
				content: data.content,
				sentAt: new Date().toISOString(),
			});
		});

		socket.on("typing", (data: { chatId: string }) => {
			if (!socket.userId) return;

			socket.to(`chat:${data.chatId}`).emit("user_typing", {
				chatId: data.chatId,
				userId: socket.userId,
			});
		});

		socket.on("disconnect", () => {
			console.log(`User disconnected: ${socket.userId}`);
		});
	});

	return io;
};

export const emitToRoom = (
	io: Server,
	room: string,
	event: string,
	data: unknown
): void => {
	io.to(room).emit(event, data);
};

export const emitToUser = (
	io: Server,
	userId: string,
	event: string,
	data: unknown
): void => {
	io.to(`user:${userId}`).emit(event, data);
};