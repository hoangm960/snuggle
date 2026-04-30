import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSocket } from "./useSocket";
import { getToken } from "@/lib/cookies";
import { io } from "socket.io-client";

vi.mock("@/lib/cookies", () => ({
	getToken: vi.fn(),
}));

vi.mock("socket.io-client", () => ({
	io: vi.fn(() => ({
		on: vi.fn(),
		emit: vi.fn(),
		disconnect: vi.fn(),
		connected: false,
	})),
}));

describe("useSocket", () => {
	let mockSocket: any;

	beforeEach(() => {
		vi.clearAllMocks();
		(getToken as any).mockReturnValue("mock-token");

		mockSocket = {
			on: vi.fn(),
			emit: vi.fn(),
			disconnect: vi.fn(),
			connected: false,
		};

		(io as any).mockReturnValue(mockSocket);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("should not create socket when no token", () => {
		(getToken as any).mockReturnValue(null);

		const { result } = renderHook(() => useSocket());

		expect(io).not.toHaveBeenCalled();
		expect(result.current.socket).toBeNull();
		expect(result.current.isConnected).toBe(false);
	});

	it("should create socket with token", () => {
		(getToken as any).mockReturnValue("test-token");

		renderHook(() => useSocket());

		expect(io).toHaveBeenCalledWith(expect.any(String), {
			auth: { token: "test-token" },
			transports: ["websocket", "polling"],
		});
	});

	it("should provide joinChat function", () => {
		const { result } = renderHook(() => useSocket());

		expect(typeof result.current.joinChat).toBe("function");
	});

	it("should provide leaveChat function", () => {
		const { result } = renderHook(() => useSocket());

		expect(typeof result.current.leaveChat).toBe("function");
	});

	it("should provide sendMessage function", () => {
		const { result } = renderHook(() => useSocket());

		expect(typeof result.current.sendMessage).toBe("function");
	});

	it("should provide sendTyping function", () => {
		const { result } = renderHook(() => useSocket());

		expect(typeof result.current.sendTyping).toBe("function");
	});

	it("should emit join_chat event", () => {
		const { result } = renderHook(() => useSocket());

		act(() => {
			result.current.joinChat("chat1");
		});

		expect(mockSocket.emit).toHaveBeenCalledWith("join_chat", "chat1");
	});

	it("should emit leave_chat event", () => {
		const { result } = renderHook(() => useSocket());

		act(() => {
			result.current.leaveChat("chat1");
		});

		expect(mockSocket.emit).toHaveBeenCalledWith("leave_chat", "chat1");
	});

	it("should emit send_message event", () => {
		const { result } = renderHook(() => useSocket());

		act(() => {
			result.current.sendMessage("chat1", "Hello");
		});

		expect(mockSocket.emit).toHaveBeenCalledWith("send_message", { chatId: "chat1", content: "Hello" });
	});

	it("should emit typing event", () => {
		const { result } = renderHook(() => useSocket());

		act(() => {
			result.current.sendTyping("chat1");
		});

		expect(mockSocket.emit).toHaveBeenCalledWith("typing", { chatId: "chat1" });
	});

	it("should handle connect event", () => {
		let connectHandler: () => void;

		mockSocket.on.mockImplementation((event: string, handler: any) => {
			if (event === "connect") {
				connectHandler = handler;
			}
		});

		const { result } = renderHook(() => useSocket());

		act(() => {
			connectHandler!();
		});

		expect(result.current.isConnected).toBe(true);
	});

	it("should handle disconnect event", () => {
		let disconnectHandler: () => void;

		mockSocket.on.mockImplementation((event: string, handler: any) => {
			if (event === "disconnect") {
				disconnectHandler = handler;
			}
		});

		const { result } = renderHook(() => useSocket());

		act(() => {
			disconnectHandler!();
		});

		expect(result.current.isConnected).toBe(false);
	});

	it("should call onNewMessage callback", () => {
		const onNewMessage = vi.fn();
		let messageHandler: (message: any) => void;

		mockSocket.on.mockImplementation((event: string, handler: any) => {
			if (event === "new_message") {
				messageHandler = handler;
			}
		});

		renderHook(() => useSocket({ onNewMessage }));

		const mockMessage = { id: "msg1", content: "Hello" };
		act(() => {
			messageHandler!(mockMessage);
		});

		expect(onNewMessage).toHaveBeenCalledWith(mockMessage);
	});

	it("should call onUserTyping callback", () => {
		const onUserTyping = vi.fn();
		let typingHandler: (data: any) => void;

		mockSocket.on.mockImplementation((event: string, handler: any) => {
			if (event === "user_typing") {
				typingHandler = handler;
			}
		});

		renderHook(() => useSocket({ onUserTyping }));

		const mockData = { chatId: "chat1", userId: "user1" };
		act(() => {
			typingHandler!(mockData);
		});

		expect(onUserTyping).toHaveBeenCalledWith(mockData);
	});

	it("should disconnect socket on cleanup", () => {
		const { unmount } = renderHook(() => useSocket());

		unmount();

		expect(mockSocket.disconnect).toHaveBeenCalled();
	});
});
