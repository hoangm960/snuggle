import express, { Express } from "express";
import request from "supertest";
import jwt from "jsonwebtoken";
import multer from "multer";

const TEST_SECRET = "test-secret-key-for-testing";

const upload = multer({ storage: multer.memoryStorage() });

const createTestApp = (): Express => {
	const app = express();
	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));

	app.get("/api/kyc/me", (req, res) => {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			res.status(401).json({ success: false, error: "Unauthorized" });
			return;
		}

		res.status(200).json({
			success: true,
			data: {
				kyc: null,
				user: { id: "user1", email: "test@test.com", displayName: "Test User" },
			},
		});
	});

	app.post("/api/kyc/me", (req, res) => {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			res.status(401).json({ success: false, error: "Unauthorized" });
			return;
		}

		const { fullName, dateOfBirth, idNumber, phone, idDocumentURL, financialDocumentURL } =
			req.body;

		if (
			!fullName ||
			!dateOfBirth ||
			!idNumber ||
			!phone ||
			!idDocumentURL ||
			!financialDocumentURL
		) {
			res.status(400).json({ success: false, error: "All fields are required" });
			return;
		}

		res.status(201).json({
			success: true,
			message: "KYC verification submitted successfully",
			data: { id: "kyc1", status: "pending" },
		});
	});

	app.post("/api/kyc/upload", upload.single("file"), (req, res) => {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			res.status(401).json({ success: false, error: "Unauthorized" });
			return;
		}

		if (!req.file) {
			res.status(400).json({ success: false, error: "No file provided" });
			return;
		}

		res.status(200).json({
			success: true,
			data: { url: "https://example.com/kyc/id.jpg" },
		});
	});

	app.post("/api/kyc/otp/send", (req, res) => {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			res.status(401).json({ success: false, error: "Unauthorized" });
			return;
		}

		res.status(200).json({
			success: true,
			message: "Verification code sent to your email",
		});
	});

	app.post("/api/kyc/otp/verify", (req, res) => {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			res.status(401).json({ success: false, error: "Unauthorized" });
			return;
		}

		const { code } = req.body;
		if (!code) {
			res.status(400).json({ success: false, error: "Verification code is required" });
			return;
		}

		res.status(200).json({
			success: true,
			message: "Verification code confirmed",
		});
	});

	app.get("/api/kyc/pending", (req, res) => {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			res.status(401).json({ success: false, error: "Unauthorized" });
			return;
		}

		const token = authHeader.split("Bearer ")[1];
		let decoded;
		try {
			decoded = jwt.verify(token, TEST_SECRET);
		} catch {
			res.status(401).json({ success: false, error: "Invalid token" });
			return;
		}

		if (!(decoded as any).isAdmin) {
			res.status(403).json({ success: false, error: "Admin access required" });
			return;
		}

		res.status(200).json({
			success: true,
			data: { kycVerifications: [], total: 0, pending: 0, approved: 0, rejected: 0 },
		});
	});

	app.get("/api/kyc/stats", (req, res) => {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			res.status(401).json({ success: false, error: "Unauthorized" });
			return;
		}

		const token = authHeader.split("Bearer ")[1];
		let decoded;
		try {
			decoded = jwt.verify(token, TEST_SECRET);
		} catch {
			res.status(401).json({ success: false, error: "Invalid token" });
			return;
		}

		if (!(decoded as any).isAdmin) {
			res.status(403).json({ success: false, error: "Admin access required" });
			return;
		}

		res.status(200).json({
			success: true,
			data: {
				total: 0,
				pending: 0,
				approved: 0,
				rejected: 0,
				approvedToday: 0,
				rejectedToday: 0,
			},
		});
	});

	app.get("/api/kyc/:id", (req, res) => {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			res.status(401).json({ success: false, error: "Unauthorized" });
			return;
		}

		const token = authHeader.split("Bearer ")[1];
		let decoded;
		try {
			decoded = jwt.verify(token, TEST_SECRET);
		} catch {
			res.status(401).json({ success: false, error: "Invalid token" });
			return;
		}

		if (!(decoded as any).isAdmin) {
			res.status(403).json({ success: false, error: "Admin access required" });
			return;
		}

		res.status(200).json({
			success: true,
			data: {
				kyc: { id: req.params.id, status: "pending" },
				user: { id: "user1", email: "test@test.com", displayName: "Test User" },
			},
		});
	});

	app.post("/api/kyc/:id/approve", (req, res) => {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			res.status(401).json({ success: false, error: "Unauthorized" });
			return;
		}

		const token = authHeader.split("Bearer ")[1];
		let decoded;
		try {
			decoded = jwt.verify(token, TEST_SECRET);
		} catch {
			res.status(401).json({ success: false, error: "Invalid token" });
			return;
		}

		if (!(decoded as any).isAdmin) {
			res.status(403).json({ success: false, error: "Admin access required" });
			return;
		}

		res.status(200).json({
			success: true,
			message: "KYC verification approved",
			data: { id: req.params.id, status: "approved" },
		});
	});

	app.post("/api/kyc/:id/reject", (req, res) => {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			res.status(401).json({ success: false, error: "Unauthorized" });
			return;
		}

		const token = authHeader.split("Bearer ")[1];
		let decoded;
		try {
			decoded = jwt.verify(token, TEST_SECRET);
		} catch {
			res.status(401).json({ success: false, error: "Invalid token" });
			return;
		}

		if (!(decoded as any).isAdmin) {
			res.status(403).json({ success: false, error: "Admin access required" });
			return;
		}

		const { reason } = req.body;
		if (!reason) {
			res.status(400).json({ success: false, error: "Rejection reason is required" });
			return;
		}

		res.status(200).json({
			success: true,
			message: "KYC verification rejected",
			data: { id: req.params.id, status: "rejected", rejectionReason: reason },
		});
	});

	return app;
};

describe("KYC API", () => {
	const app = createTestApp();
	const userToken = jwt.sign({ uid: "user-123", email: "test@example.com" }, TEST_SECRET);
	const adminToken = jwt.sign(
		{ uid: "admin-123", email: "admin@test.com", isAdmin: true },
		TEST_SECRET
	);

	describe("GET /api/kyc/me", () => {
		it("should return KYC status for authenticated user", async () => {
			const response = await request(app)
				.get("/api/kyc/me")
				.set("Authorization", `Bearer ${userToken}`);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data).toHaveProperty("user");
		});

		it("should return 401 without token", async () => {
			const response = await request(app).get("/api/kyc/me");

			expect(response.status).toBe(401);
		});
	});

	describe("POST /api/kyc/me", () => {
		it("should submit KYC verification", async () => {
			const response = await request(app)
				.post("/api/kyc/me")
				.set("Authorization", `Bearer ${userToken}`)
				.send({
					fullName: "John Doe",
					dateOfBirth: "1990-01-01",
					idNumber: "123456",
					phone: "+1234567890",
					idDocumentURL: "https://example.com/id.jpg",
					financialDocumentURL: "https://example.com/financial.jpg",
				});

			expect(response.status).toBe(201);
			expect(response.body.success).toBe(true);
			expect(response.body.data.status).toBe("pending");
		});

		it("should return 400 when fields are missing", async () => {
			const response = await request(app)
				.post("/api/kyc/me")
				.set("Authorization", `Bearer ${userToken}`)
				.send({ fullName: "John Doe" });

			expect(response.status).toBe(400);
		});

		it("should return 401 without token", async () => {
			const response = await request(app).post("/api/kyc/me");

			expect(response.status).toBe(401);
		});
	});

	describe("POST /api/kyc/upload", () => {
		it("should upload KYC file", async () => {
			const response = await request(app)
				.post("/api/kyc/upload")
				.set("Authorization", `Bearer ${userToken}`)
				.attach("file", Buffer.from("test content"), "test.jpg");

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data).toHaveProperty("url");
		});

		it("should return 401 without token", async () => {
			const response = await request(app)
				.post("/api/kyc/upload")
				.attach("file", Buffer.from("test content"), "test.jpg");

			expect(response.status).toBe(401);
		});
	});

	describe("POST /api/kyc/otp/send", () => {
		it("should send OTP verification code", async () => {
			const response = await request(app)
				.post("/api/kyc/otp/send")
				.set("Authorization", `Bearer ${userToken}`);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
		});

		it("should return 401 without token", async () => {
			const response = await request(app).post("/api/kyc/otp/send");

			expect(response.status).toBe(401);
		});
	});

	describe("POST /api/kyc/otp/verify", () => {
		it("should verify OTP code", async () => {
			const response = await request(app)
				.post("/api/kyc/otp/verify")
				.set("Authorization", `Bearer ${userToken}`)
				.send({ code: "123456" });

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
		});

		it("should return 400 when code is missing", async () => {
			const response = await request(app)
				.post("/api/kyc/otp/verify")
				.set("Authorization", `Bearer ${userToken}`)
				.send({});

			expect(response.status).toBe(400);
		});

		it("should return 401 without token", async () => {
			const response = await request(app).post("/api/kyc/otp/verify");

			expect(response.status).toBe(401);
		});
	});

	describe("Admin Endpoints", () => {
		describe("GET /api/kyc/pending", () => {
			it("should return pending KYC list for admin", async () => {
				const response = await request(app)
					.get("/api/kyc/pending")
					.set("Authorization", `Bearer ${adminToken}`);

				expect(response.status).toBe(200);
				expect(response.body.success).toBe(true);
				expect(response.body.data).toHaveProperty("kycVerifications");
			});

			it("should return 403 for non-admin user", async () => {
				const response = await request(app)
					.get("/api/kyc/pending")
					.set("Authorization", `Bearer ${userToken}`);

				expect(response.status).toBe(403);
			});
		});

		describe("GET /api/kyc/stats", () => {
			it("should return KYC stats for admin", async () => {
				const response = await request(app)
					.get("/api/kyc/stats")
					.set("Authorization", `Bearer ${adminToken}`);

				expect(response.status).toBe(200);
				expect(response.body.success).toBe(true);
				expect(response.body.data).toHaveProperty("total");
			});

			it("should return 403 for non-admin user", async () => {
				const response = await request(app)
					.get("/api/kyc/stats")
					.set("Authorization", `Bearer ${userToken}`);

				expect(response.status).toBe(403);
			});
		});

		describe("GET /api/kyc/:id", () => {
			it("should return KYC details for admin", async () => {
				const response = await request(app)
					.get("/api/kyc/kyc1")
					.set("Authorization", `Bearer ${adminToken}`);

				expect(response.status).toBe(200);
				expect(response.body.success).toBe(true);
				expect(response.body.data).toHaveProperty("kyc");
				expect(response.body.data).toHaveProperty("user");
			});

			it("should return 403 for non-admin user", async () => {
				const response = await request(app)
					.get("/api/kyc/kyc1")
					.set("Authorization", `Bearer ${userToken}`);

				expect(response.status).toBe(403);
			});
		});

		describe("POST /api/kyc/:id/approve", () => {
			it("should approve KYC for admin", async () => {
				const response = await request(app)
					.post("/api/kyc/kyc1/approve")
					.set("Authorization", `Bearer ${adminToken}`);

				expect(response.status).toBe(200);
				expect(response.body.success).toBe(true);
				expect(response.body.data.status).toBe("approved");
			});

			it("should return 403 for non-admin user", async () => {
				const response = await request(app)
					.post("/api/kyc/kyc1/approve")
					.set("Authorization", `Bearer ${userToken}`);

				expect(response.status).toBe(403);
			});
		});

		describe("POST /api/kyc/:id/reject", () => {
			it("should reject KYC for admin", async () => {
				const response = await request(app)
					.post("/api/kyc/kyc1/reject")
					.set("Authorization", `Bearer ${adminToken}`)
					.send({ reason: "Invalid documents" });

				expect(response.status).toBe(200);
				expect(response.body.success).toBe(true);
				expect(response.body.data.status).toBe("rejected");
			});

			it("should return 400 when reason is missing", async () => {
				const response = await request(app)
					.post("/api/kyc/kyc1/reject")
					.set("Authorization", `Bearer ${adminToken}`)
					.send({});

				expect(response.status).toBe(400);
			});

			it("should return 403 for non-admin user", async () => {
				const response = await request(app)
					.post("/api/kyc/kyc1/reject")
					.set("Authorization", `Bearer ${userToken}`)
					.send({ reason: "Reason" });

				expect(response.status).toBe(403);
			});
		});
	});
});
