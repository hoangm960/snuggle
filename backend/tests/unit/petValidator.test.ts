import {
	createPetSchema,
	updatePetSchema,
	petQuerySchema,
} from "../../src/utils/validators/petValidator";

describe("Pet Validators", () => {
	describe("createPetSchema", () => {
		it("should validate valid pet data", () => {
			const validData = {
				name: "Buddy",
				species: "dog",
				breed: "Golden Retriever",
				ageMonths: 24,
				size: "medium",
				gender: "male",
				shelterId: "shelter-123",
			};

			const result = createPetSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});

		it("should reject missing required fields", () => {
			const invalidData = {
				name: "Buddy",
			};

			const result = createPetSchema.safeParse(invalidData);
			expect(result.success).toBe(false);
		});

		it("should reject invalid size", () => {
			const invalidData = {
				name: "Buddy",
				species: "dog",
				breed: "Golden Retriever",
				ageMonths: 24,
				size: "invalid",
				gender: "male",
				shelterId: "shelter-123",
			};

			const result = createPetSchema.safeParse(invalidData);
			expect(result.success).toBe(false);
		});

		it("should reject negative age", () => {
			const invalidData = {
				name: "Buddy",
				species: "dog",
				breed: "Golden Retriever",
				ageMonths: -5,
				size: "medium",
				gender: "male",
				shelterId: "shelter-123",
			};

			const result = createPetSchema.safeParse(invalidData);
			expect(result.success).toBe(false);
		});
	});

	describe("updatePetSchema", () => {
		it("should validate empty update data", () => {
			const validData = {};

			const result = updatePetSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});

		it("should validate partial update data", () => {
			const validData = {
				name: "Updated Name",
			};

			const result = updatePetSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});
	});

	describe("petQuerySchema", () => {
		it("should validate empty query", () => {
			const validData = {};

			const result = petQuerySchema.safeParse(validData);
			expect(result.success).toBe(true);
		});

		it("should validate query with filters", () => {
			const validData = {
				species: "dog",
				size: "medium",
				status: "available",
			};

			const result = petQuerySchema.safeParse(validData);
			expect(result.success).toBe(true);
		});

		it("should reject invalid status in query", () => {
			const invalidData = {
				status: "invalid-status",
			};

			const result = petQuerySchema.safeParse(invalidData);
			expect(result.success).toBe(false);
		});
	});
});
