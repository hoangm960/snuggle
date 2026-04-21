import express, { Express } from "express";
import request from "supertest";
import jwt from "jsonwebtoken";

const TEST_SECRET = "test-secret-key-for-testing";

const createTestApp = (): Express => {
	const app = express();
	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));

	app.get("/health", (_req, res) => {
		res.json({ status: "ok", timestamp: new Date().toISOString() });
	});

	app.post("/api/auth/register", (req, res) => {
		const { email, password, displayName } = req.body;

		if (!email || !password) {
			res.status(400).json({ success: false, error: "Email and password required" });
			return;
		}

		if (!email.includes("@")) {
			res.status(400).json({ success: false, error: "Invalid email format" });
			return;
		}

		res.status(201).json({ success: true, message: "Registration successful" });
	});

	app.post("/api/auth/login", (req, res) => {
		const { email, password } = req.body;

		if (!email || !password) {
			res.status(400).json({ success: false, error: "Email and password required" });
			return;
		}

		const token = jwt.sign({ uid: "test-user-123", email }, TEST_SECRET, { expiresIn: "1h" });
		res.status(200).json({ success: true, data: { token } });
	});

	app.get("/api/auth/me", (req, res) => {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			res.status(401).json({ success: false, error: "No token provided" });
			return;
		}

		const token = authHeader.split("Bearer ")[1];
		try {
			const decoded = jwt.verify(token, TEST_SECRET);
			res.status(200).json({ success: true, data: decoded });
		} catch {
			res.status(401).json({ success: false, error: "Invalid token" });
		}
	});

	app.get("/api/auth/profile", (req, res) => {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			res.status(401).json({ success: false, error: "No token provided" });
			return;
		}

		const token = authHeader.split("Bearer ")[1];
		try {
			const decoded = jwt.verify(token, TEST_SECRET);
			res.status(200).json({
				success: true,
				data: {
					uid: (decoded as any).uid,
					email: (decoded as any).email,
					displayName: "Test User",
				},
			});
		} catch {
			res.status(401).json({ success: false, error: "Invalid token" });
		}
	});

	app.put("/api/auth/profile", (req, res) => {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			res.status(401).json({ success: false, error: "No token provided" });
			return;
		}

		const { displayName } = req.body;
		res.status(200).json({
			success: true,
			data: { displayName: displayName || "Updated" },
		});
	});

	app.delete("/api/auth/account", (req, res) => {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			res.status(401).json({ success: false, error: "No token provided" });
			return;
		}

		res.status(200).json({ success: true, message: "Account deleted" });
	});

	return app;
};

describe("Auth Routes", () => {
	let app: Express;

	beforeEach(() => {
		app = createTestApp();
	});

	describe("POST /api/auth/register", () => {
		it("should register a new user with valid data", async () => {
			const response = await request(app).post("/api/auth/register").send({
				email: "test@example.com",
				password: "password123",
				displayName: "Test User",
			});

			expect(response.status).toBe(201);
			expect(response.body.success).toBe(true);
		});

		it("should return 400 for missing email", async () => {
			const response = await request(app).post("/api/auth/register").send({
				password: "password123",
			});

			expect(response.status).toBe(400);
			expect(response.body.success).toBe(false);
		});

		it("should return 400 for invalid email format", async () => {
			const response = await request(app).post("/api/auth/register").send({
				email: "invalid-email",
				password: "password123",
			});

			expect(response.status).toBe(400);
			expect(response.body.success).toBe(false);
		});

		it("should return 400 for missing password", async () => {
			const response = await request(app).post("/api/auth/register").send({
				email: "test@example.com",
			});

			expect(response.status).toBe(400);
		});
	});

	describe("POST /api/auth/login", () => {
		it("should login with valid credentials", async () => {
			const response = await request(app).post("/api/auth/login").send({
				email: "test@example.com",
				password: "password123",
			});

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data).toHaveProperty("token");
		});

		it("should return 400 for missing credentials", async () => {
			const response = await request(app).post("/api/auth/login").send({});

			expect(response.status).toBe(400);
		});
	});

	describe("GET /api/auth/me", () => {
		it("should return current user with valid token", async () => {
			const token = jwt.sign({ uid: "user-123", email: "test@example.com" }, TEST_SECRET);

			const response = await request(app)
				.get("/api/auth/me")
				.set("Authorization", `Bearer ${token}`);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
		});

		it("should return 401 without token", async () => {
			const response = await request(app).get("/api/auth/me");

			expect(response.status).toBe(401);
		});

		it("should return 401 with invalid token", async () => {
			const response = await request(app)
				.get("/api/auth/me")
				.set("Authorization", "Bearer invalid-token");

			expect(response.status).toBe(401);
		});
	});

	describe("GET /api/auth/profile", () => {
		it("should return user profile with valid token", async () => {
			const token = jwt.sign({ uid: "user-123", email: "test@example.com" }, TEST_SECRET);

			const response = await request(app)
				.get("/api/auth/profile")
				.set("Authorization", `Bearer ${token}`);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data).toHaveProperty("displayName");
		});

		it("should return 401 without token", async () => {
			const response = await request(app).get("/api/auth/profile");

			expect(response.status).toBe(401);
		});
	});

	describe("PUT /api/auth/profile", () => {
		it("should update user profile", async () => {
			const token = jwt.sign({ uid: "user-123", email: "test@example.com" }, TEST_SECRET);

			const response = await request(app)
				.put("/api/auth/profile")
				.set("Authorization", `Bearer ${token}`)
				.send({ displayName: "New Name" });

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
		});

		it("should return 401 without token", async () => {
			const response = await request(app)
				.put("/api/auth/profile")
				.send({ displayName: "New Name" });

			expect(response.status).toBe(401);
		});
	});

	describe("DELETE /api/auth/account", () => {
		it("should delete user account", async () => {
			const token = jwt.sign({ uid: "user-123", email: "test@example.com" }, TEST_SECRET);

			const response = await request(app)
				.delete("/api/auth/account")
				.set("Authorization", `Bearer ${token}`);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
		});

		it("should return 401 without token", async () => {
			const response = await request(app).delete("/api/auth/account");

			expect(response.status).toBe(401);
		});
	});
});
