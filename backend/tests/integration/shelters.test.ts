import express, { Express } from "express";
import request from "supertest";
import jwt from "jsonwebtoken";

const TEST_SECRET = "test-secret-key-for-testing";

const mockShelters = [
	{
		id: "shelter-1",
		name: "Happy Paws Shelter",
		address: "123 Pet Street, City, ST 12345",
		contactEmail: "contact@happypaws.org",
		phone: "555-123-4567",
		description: "A no-kill shelter",
		trustScore: 4.5,
		totalReviews: 100,
		status: "active",
	},
	{
		id: "shelter-2",
		name: "Furry Friends Rescue",
		address: "456 Animal Ave, Town, ST 67890",
		contactEmail: "info@furryfriends.org",
		phone: "555-987-6543",
		description: "Saving lives since 2000",
		trustScore: 4.8,
		totalReviews: 250,
		status: "active",
	},
];

const createTestApp = (): Express => {
	const app = express();
	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));

	app.get("/api/shelters", (_req, res) => {
		res.json({ success: true, data: mockShelters });
	});

	app.get("/api/shelters/:id", (req, res) => {
		const shelter = mockShelters.find((s) => s.id === req.params.id);
		if (!shelter) {
			res.status(404).json({ success: false, error: "Shelter not found" });
			return;
		}
		res.json({ success: true, data: shelter });
	});

	app.post("/api/shelters", (req, res) => {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			res.status(401).json({ success: false, error: "Unauthorized" });
			return;
		}

		const { name, address, contactEmail, phone, description } = req.body;
		if (!name || !address || !contactEmail) {
			res.status(400).json({ success: false, error: "Missing required fields" });
			return;
		}

		res.status(201).json({ success: true, data: { id: "shelter-new", ...req.body } });
	});

	app.put("/api/shelters/:id", (req, res) => {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			res.status(401).json({ success: false, error: "Unauthorized" });
			return;
		}

		const shelter = mockShelters.find((s) => s.id === req.params.id);
		if (!shelter) {
			res.status(404).json({ success: false, error: "Shelter not found" });
			return;
		}

		res.json({ success: true, data: { ...shelter, ...req.body } });
	});

	app.delete("/api/shelters/:id", (req, res) => {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			res.status(401).json({ success: false, error: "Unauthorized" });
			return;
		}

		res.json({ success: true, message: "Shelter deleted" });
	});

	return app;
};

describe("Shelters Routes", () => {
	let app: Express;
	let authToken: string;

	beforeEach(() => {
		app = createTestApp();
		authToken = jwt.sign({ uid: "admin-123", email: "admin@example.com" }, TEST_SECRET);
	});

	describe("GET /api/shelters", () => {
		it("should return all shelters", async () => {
			const response = await request(app).get("/api/shelters");

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data).toHaveLength(2);
		});

		it("should return empty array when no shelters", async () => {
			const app = express();
			app.use(express.json());
			app.get("/api/shelters", (_req, res) => {
				res.json({ success: true, data: [] });
			});

			const response = await request(app).get("/api/shelters");

			expect(response.status).toBe(200);
			expect(response.body.data).toHaveLength(0);
		});
	});

	describe("GET /api/shelters/:id", () => {
		it("should return shelter by id", async () => {
			const response = await request(app).get("/api/shelters/shelter-1");

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data.name).toBe("Happy Paws Shelter");
		});

		it("should return 404 for non-existent shelter", async () => {
			const response = await request(app).get("/api/shelters/non-existent");

			expect(response.status).toBe(404);
		});
	});

	describe("POST /api/shelters", () => {
		it("should create a new shelter with auth", async () => {
			const response = await request(app)
				.post("/api/shelters")
				.set("Authorization", `Bearer ${authToken}`)
				.send({
					name: "New Shelter",
					address: "789 New St, City, ST 11111",
					contactEmail: "new@shelter.org",
					phone: "555-111-1111",
					description: "New shelter",
				});

			expect(response.status).toBe(201);
			expect(response.body.success).toBe(true);
		});

		it("should return 401 without auth", async () => {
			const response = await request(app).post("/api/shelters").send({
				name: "New Shelter",
				address: "789 New St",
				contactEmail: "new@shelter.org",
			});

			expect(response.status).toBe(401);
		});

		it("should return 400 for missing fields", async () => {
			const response = await request(app)
				.post("/api/shelters")
				.set("Authorization", `Bearer ${authToken}`)
				.send({ name: "New Shelter" });

			expect(response.status).toBe(400);
		});
	});

	describe("PUT /api/shelters/:id", () => {
		it("should update a shelter", async () => {
			const response = await request(app)
				.put("/api/shelters/shelter-1")
				.set("Authorization", `Bearer ${authToken}`)
				.send({ name: "Updated Happy Paws" });

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
		});

		it("should return 401 without auth", async () => {
			const response = await request(app).put("/api/shelters/shelter-1").send({
				name: "Updated",
			});

			expect(response.status).toBe(401);
		});
	});

	describe("DELETE /api/shelters/:id", () => {
		it("should delete a shelter", async () => {
			const response = await request(app)
				.delete("/api/shelters/shelter-1")
				.set("Authorization", `Bearer ${authToken}`);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
		});

		it("should return 401 without auth", async () => {
			const response = await request(app).delete("/api/shelters/shelter-1");

			expect(response.status).toBe(401);
		});
	});
});
