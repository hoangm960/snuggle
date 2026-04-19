import express, { Express } from "express";
import request from "supertest";
import jwt from "jsonwebtoken";

const TEST_SECRET = "test-secret-key-for-testing";

const mockPets = [
	{
		id: "pet-1",
		name: "Buddy",
		species: "dog",
		breed: "Golden Retriever",
		ageMonths: 24,
		size: "medium",
		gender: "male",
		status: "available",
		shelterId: "shelter-1",
	},
	{
		id: "pet-2",
		name: "Whiskers",
		species: "cat",
		breed: "Persian",
		ageMonths: 12,
		size: "small",
		gender: "female",
		status: "available",
		shelterId: "shelter-1",
	},
];

const createTestApp = (): Express => {
	const app = express();
	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));

	app.get("/api/pets", (req, res) => {
		const { species, size, status } = req.query;
		let pets = [...mockPets];

		if (species) {
			pets = pets.filter((p) => p.species === species);
		}
		if (size) {
			pets = pets.filter((p) => p.size === size);
		}
		if (status) {
			pets = pets.filter((p) => p.status === status);
		}

		res.json({ success: true, data: pets });
	});

	app.get("/api/pets/:id", (req, res) => {
		const pet = mockPets.find((p) => p.id === req.params.id);
		if (!pet) {
			res.status(404).json({ success: false, error: "Pet not found" });
			return;
		}
		res.json({ success: true, data: pet });
	});

	app.post("/api/pets", (req, res) => {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			res.status(401).json({ success: false, error: "Unauthorized" });
			return;
		}

		const { name, species, breed, ageMonths, size, gender, shelterId } = req.body;
		if (!name || !species || !breed || !ageMonths || !size || !gender || !shelterId) {
			res.status(400).json({ success: false, error: "Missing required fields" });
			return;
		}

		const newPet = { id: "pet-new", ...req.body, status: "available" };
		res.status(201).json({ success: true, data: newPet });
	});

	app.put("/api/pets/:id", (req, res) => {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			res.status(401).json({ success: false, error: "Unauthorized" });
			return;
		}

		const pet = mockPets.find((p) => p.id === req.params.id);
		if (!pet) {
			res.status(404).json({ success: false, error: "Pet not found" });
			return;
		}

		res.json({ success: true, data: { ...pet, ...req.body } });
	});

	app.delete("/api/pets/:id", (req, res) => {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			res.status(401).json({ success: false, error: "Unauthorized" });
			return;
		}

		const pet = mockPets.find((p) => p.id === req.params.id);
		if (!pet) {
			res.status(404).json({ success: false, error: "Pet not found" });
			return;
		}

		res.json({ success: true, message: "Pet deleted" });
	});

	app.get("/api/pets/:petId/health-records", (req, res) => {
		res.json({ success: true, data: [] });
	});

	app.post("/api/pets/:petId/health-records", (req, res) => {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			res.status(401).json({ success: false, error: "Unauthorized" });
			return;
		}

		res.status(201).json({ success: true, data: { id: "record-new", ...req.body } });
	});

	app.delete("/api/pets/:petId/health-records/:id", (req, res) => {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			res.status(401).json({ success: false, error: "Unauthorized" });
			return;
		}

		res.json({ success: true, message: "Health record deleted" });
	});

	return app;
};

describe("Pets Routes", () => {
	let app: Express;
	let authToken: string;

	beforeEach(() => {
		app = createTestApp();
		authToken = jwt.sign({ uid: "user-123", email: "test@example.com" }, TEST_SECRET);
	});

	describe("GET /api/pets", () => {
		it("should return all pets", async () => {
			const response = await request(app).get("/api/pets");

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data).toHaveLength(2);
		});

		it("should filter pets by species", async () => {
			const response = await request(app).get("/api/pets").query({ species: "dog" });

			expect(response.status).toBe(200);
			expect(response.body.data).toHaveLength(1);
			expect(response.body.data[0].species).toBe("dog");
		});

		it("should filter pets by size", async () => {
			const response = await request(app).get("/api/pets").query({ size: "small" });

			expect(response.status).toBe(200);
			expect(response.body.data).toHaveLength(1);
			expect(response.body.data[0].size).toBe("small");
		});

		it("should filter pets by status", async () => {
			const response = await request(app).get("/api/pets").query({ status: "available" });

			expect(response.status).toBe(200);
			expect(response.body.data[0].status).toBe("available");
		});
	});

	describe("GET /api/pets/:id", () => {
		it("should return pet by id", async () => {
			const response = await request(app).get("/api/pets/pet-1");

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data.name).toBe("Buddy");
		});

		it("should return 404 for non-existent pet", async () => {
			const response = await request(app).get("/api/pets/non-existent");

			expect(response.status).toBe(404);
		});
	});

	describe("POST /api/pets", () => {
		it("should create a new pet with auth", async () => {
			const response = await request(app)
				.post("/api/pets")
				.set("Authorization", `Bearer ${authToken}`)
				.send({
					name: "New Pet",
					species: "dog",
					breed: "Labrador",
					ageMonths: 18,
					size: "large",
					gender: "female",
					shelterId: "shelter-1",
				});

			expect(response.status).toBe(201);
			expect(response.body.success).toBe(true);
		});

		it("should return 401 without auth", async () => {
			const response = await request(app).post("/api/pets").send({
				name: "New Pet",
				species: "dog",
				breed: "Labrador",
				ageMonths: 18,
				size: "large",
				gender: "female",
				shelterId: "shelter-1",
			});

			expect(response.status).toBe(401);
		});

		it("should return 400 for missing fields", async () => {
			const response = await request(app)
				.post("/api/pets")
				.set("Authorization", `Bearer ${authToken}`)
				.send({ name: "New Pet" });

			expect(response.status).toBe(400);
		});
	});

	describe("PUT /api/pets/:id", () => {
		it("should update a pet", async () => {
			const response = await request(app)
				.put("/api/pets/pet-1")
				.set("Authorization", `Bearer ${authToken}`)
				.send({ name: "Updated Buddy" });

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
		});

		it("should return 401 without auth", async () => {
			const response = await request(app).put("/api/pets/pet-1").send({ name: "Updated" });

			expect(response.status).toBe(401);
		});
	});

	describe("DELETE /api/pets/:id", () => {
		it("should delete a pet", async () => {
			const response = await request(app)
				.delete("/api/pets/pet-1")
				.set("Authorization", `Bearer ${authToken}`);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
		});

		it("should return 401 without auth", async () => {
			const response = await request(app).delete("/api/pets/pet-1");

			expect(response.status).toBe(401);
		});

		it("should return 404 for non-existent pet", async () => {
			const response = await request(app)
				.delete("/api/pets/non-existent")
				.set("Authorization", `Bearer ${authToken}`);

			expect(response.status).toBe(404);
		});
	});

	describe("Health Records", () => {
		it("should get health records", async () => {
			const response = await request(app).get("/api/pets/pet-1/health-records");

			expect(response.status).toBe(200);
		});

		it("should create health record with auth", async () => {
			const response = await request(app)
				.post("/api/pets/pet-1/health-records")
				.set("Authorization", `Bearer ${authToken}`)
				.send({ type: "vaccine", description: "Rabies" });

			expect(response.status).toBe(201);
		});

		it("should delete health record with auth", async () => {
			const response = await request(app)
				.delete("/api/pets/pet-1/health-records/record-1")
				.set("Authorization", `Bearer ${authToken}`);

			expect(response.status).toBe(200);
		});
	});
});
