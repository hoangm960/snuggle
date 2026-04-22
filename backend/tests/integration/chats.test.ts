import express, { Express } from "express";
import request from "supertest";
import jwt from "jsonwebtoken";

const TEST_SECRET = "test-secret-key-for-testing";

const mockChats = [
  {
    id: "chat-1",
    participants: ["user-1", "user-2"],
    lastMessage: { content: "Hello!", createdAt: new Date() },
    unreadCount: 2,
    createdAt: new Date(),
  },
  {
    id: "chat-2",
    participants: ["user-1", "user-3"],
    lastMessage: { content: "Hi there", createdAt: new Date() },
    unreadCount: 0,
    createdAt: new Date(),
  },
];

const mockMessages = [
  {
    id: "msg-1",
    chatId: "chat-1",
    senderId: "user-2",
    content: "Hello!",
    isRead: false,
    createdAt: new Date(),
  },
  {
    id: "msg-2",
    chatId: "chat-1",
    senderId: "user-1",
    content: "Hi there!",
    isRead: true,
    createdAt: new Date(),
  },
];

const createTestApp = (): Express => {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const authenticate = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const token = authHeader.split("Bearer ")[1];
    try {
      const decoded = jwt.verify(token, TEST_SECRET) as any;
      req.user = decoded;
      next();
    } catch {
      res.status(401).json({ success: false, error: "Invalid token" });
    }
  };

  app.get("/api/chats", authenticate, (_req, res) => {
    res.json({ success: true, data: mockChats });
  });

  app.get("/api/chats/:id", authenticate, (req, res) => {
    const chat = mockChats.find((c) => c.id === req.params.id);
    if (!chat) {
      res.status(404).json({ success: false, error: "Chat not found" });
      return;
    }
    res.json({ success: true, data: chat });
  });

  app.get("/api/chats/:id/messages", authenticate, (req, res) => {
    const messages = mockMessages.filter((m) => m.chatId === req.params.id);
    res.json({ success: true, data: messages });
  });

  app.post("/api/chats", authenticate, (req: any, res: any) => {
    const { participantId } = req.body;
    if (!participantId) {
      res.status(400).json({ success: false, error: "Participant ID is required" });
      return;
    }
    res.status(201).json({
      success: true,
      data: {
        id: "chat-new",
        participants: [req.user.uid, participantId],
      },
    });
  });

  app.post("/api/chats/:id/messages", authenticate, (req: any, res: any) => {
    const { content } = req.body;
    if (!content) {
      res.status(400).json({ success: false, error: "Content is required" });
      return;
    }
    res.status(201).json({
      success: true,
      data: {
        id: "msg-new",
        chatId: req.params.id,
        senderId: req.user.uid,
        content,
        isRead: false,
        createdAt: new Date(),
      },
    });
  });

  app.put("/api/chats/:id/messages/:messageId/read", authenticate, (req, res) => {
    res.json({ success: true, data: { isRead: true } });
  });

  return app;
};

describe("Chat Routes", () => {
  let app: Express;
  let authToken: string;

  beforeEach(() => {
    app = createTestApp();
    authToken = jwt.sign(
      { uid: "user-1", email: "test@example.com" },
      TEST_SECRET
    );
  });

  describe("GET /api/chats", () => {
    it("should return user's chats with auth", async () => {
      const response = await request(app)
        .get("/api/chats")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it("should return 401 without token", async () => {
      const response = await request(app).get("/api/chats");

      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/chats/:id", () => {
    it("should return chat by id", async () => {
      const response = await request(app)
        .get("/api/chats/chat-1")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe("chat-1");
    });

    it("should return 404 for non-existent chat", async () => {
      const response = await request(app)
        .get("/api/chats/non-existent")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it("should return 401 without token", async () => {
      const response = await request(app).get("/api/chats/chat-1");

      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/chats/:id/messages", () => {
    it("should return messages in chat", async () => {
      const response = await request(app)
        .get("/api/chats/chat-1/messages")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it("should return 401 without token", async () => {
      const response = await request(app).get("/api/chats/chat-1/messages");

      expect(response.status).toBe(401);
    });
  });

  describe("POST /api/chats", () => {
    it("should create a new chat with auth", async () => {
      const response = await request(app)
        .post("/api/chats")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ participantId: "user-2" });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it("should return 400 for missing participantId", async () => {
      const response = await request(app)
        .post("/api/chats")
        .set("Authorization", `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
    });

    it("should return 401 without token", async () => {
      const response = await request(app)
        .post("/api/chats")
        .send({ participantId: "user-2" });

      expect(response.status).toBe(401);
    });
  });

  describe("POST /api/chats/:id/messages", () => {
    it("should send a message with auth", async () => {
      const response = await request(app)
        .post("/api/chats/chat-1/messages")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ content: "Test message" });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it("should return 400 for missing content", async () => {
      const response = await request(app)
        .post("/api/chats/chat-1/messages")
        .set("Authorization", `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
    });

    it("should return 401 without token", async () => {
      const response = await request(app)
        .post("/api/chats/chat-1/messages")
        .send({ content: "Test" });

      expect(response.status).toBe(401);
    });
  });

  describe("PUT /api/chats/:id/messages/:messageId/read", () => {
    it("should mark message as read with auth", async () => {
      const response = await request(app)
        .put("/api/chats/chat-1/messages/msg-1/read")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it("should return 401 without token", async () => {
      const response = await request(app).put(
        "/api/chats/chat-1/messages/msg-1/read"
      );

      expect(response.status).toBe(401);
    });
  });
});