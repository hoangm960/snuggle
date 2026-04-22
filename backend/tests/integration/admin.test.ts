import express, { Express } from "express";
import request from "supertest";
import jwt from "jsonwebtoken";

const TEST_SECRET = "test-secret-key-for-testing";

const mockAdmins: any[] = [];
const mockChats = [
  { id: 'chat-1', participants: ['user-1', 'user-2'], lastMessage: { content: 'Hello' } },
  { id: 'chat-2', participants: ['user-1', 'user-3'], lastMessage: { content: 'Hi' } },
];
const mockMessages = [
  { id: 'msg-1', chatId: 'chat-1', senderId: 'user-2', content: 'Hello!', isRead: false },
  { id: 'msg-2', chatId: 'chat-1', senderId: 'user-1', content: 'Hi there!', isRead: true },
];
const mockStats = {
	totalPets: 150,
	totalShelters: 25,
	totalApplications: 500,
	totalUsers: 1000,
	activeAdoptions: 75,
};

const createTestApp = (): Express => {
	const app = express();
	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));

	const adminCheck = (req: any, res: any, next: any) => {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			res.status(401).json({ success: false, error: "Unauthorized" });
			return;
		}

		const token = authHeader.split("Bearer ")[1];
		try {
			const decoded = jwt.verify(token, TEST_SECRET) as any;
			if (decoded.role !== "admin") {
				res.status(403).json({ success: false, error: "Forbidden" });
				return;
			}
			next();
		} catch {
			res.status(401).json({ success: false, error: "Invalid token" });
		}
	};

	app.get("/api/admin/stats", adminCheck, (_req, res) => {
		res.json({ success: true, data: mockStats });
	});

	app.get("/api/admin/users", adminCheck, (_req, res) => {
		res.json({ success: true, data: mockAdmins });
	});

	app.get("/api/admin/users/:id", adminCheck, (req, res) => {
		res.json({ success: true, data: { id: req.params.id } });
	});

	app.put("/api/admin/users/:id/status", adminCheck, (req, res) => {
		const { status } = req.body;
		res.json({ success: true, data: { status } });
	});

	app.delete("/api/admin/users/:id", adminCheck, (_req, res) => {
		res.json({ success: true, message: "User deleted" });
	});

	app.get('/api/admin/chats', adminCheck, (_req, res) => {
		res.json({ success: true, data: mockChats });
	});

	app.get('/api/admin/chats/:id/messages', adminCheck, (req, res) => {
		const messages = mockMessages.filter((m) => m.chatId === req.params.id);
		res.json({ success: true, data: messages });
	});

	return app;
};

describe("Admin Routes", () => {
	let app: Express;
	let adminToken: string;
	let userToken: string;

	beforeEach(() => {
		app = createTestApp();
		adminToken = jwt.sign(
			{ uid: "admin-1", email: "admin@example.com", role: "admin" },
			TEST_SECRET
		);
		userToken = jwt.sign(
			{ uid: "user-1", email: "user@example.com", role: "visitor" },
			TEST_SECRET
		);
	});

	describe("GET /api/admin/stats", () => {
		it("should return stats with admin token", async () => {
			const response = await request(app)
				.get("/api/admin/stats")
				.set("Authorization", `Bearer ${adminToken}`);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
		});

		it("should return 401 without token", async () => {
			const response = await request(app).get("/api/admin/stats");

			expect(response.status).toBe(401);
		});

		it("should return 403 with non-admin token", async () => {
			const response = await request(app)
				.get("/api/admin/stats")
				.set("Authorization", `Bearer ${userToken}`);

			expect(response.status).toBe(403);
		});
	});

	describe("GET /api/admin/users", () => {
		it("should return users list with admin token", async () => {
			const response = await request(app)
				.get("/api/admin/users")
				.set("Authorization", `Bearer ${adminToken}`);

			expect(response.status).toBe(200);
		});
	});

	describe("PUT /api/admin/users/:id/status", () => {
		it("should update user status", async () => {
			const response = await request(app)
				.put("/api/admin/users/user-1/status")
				.set("Authorization", `Bearer ${adminToken}`)
				.send({ status: "suspended" });

			expect(response.status).toBe(200);
		});
	});

	describe("DELETE /api/admin/users/:id", () => {
		it("should delete user", async () => {
			const response = await request(app)
				.delete("/api/admin/users/user-1")
				.set("Authorization", `Bearer ${adminToken}`);

			expect(response.status).toBe(200);
		});
	});

	describe('GET /api/admin/chats', () => {
		it('should return all chats with admin token', async () => {
			const response = await request(app)
				.get('/api/admin/chats')
				.set('Authorization', `Bearer ${adminToken}`);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data).toHaveLength(2);
		});

		it('should return 401 without token', async () => {
			const response = await request(app).get('/api/admin/chats');

			expect(response.status).toBe(401);
		});

		it('should return 403 with non-admin token', async () => {
			const response = await request(app)
				.get('/api/admin/chats')
				.set('Authorization', `Bearer ${userToken}`);

			expect(response.status).toBe(403);
		});
	});

	describe('GET /api/admin/chats/:id/messages', () => {
		it('should return messages in chat with admin token', async () => {
			const response = await request(app)
				.get('/api/admin/chats/chat-1/messages')
				.set('Authorization', `Bearer ${adminToken}`);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data).toHaveLength(2);
		});

		it('should return 401 without token', async () => {
			const response = await request(app).get(
				'/api/admin/chats/chat-1/messages'
			);

			expect(response.status).toBe(401);
		});

		it('should return 403 with non-admin token', async () => {
			const response = await request(app)
				.get('/api/admin/chats/chat-1/messages')
				.set('Authorization', `Bearer ${userToken}`);

			expect(response.status).toBe(403);
		});
	});
});
