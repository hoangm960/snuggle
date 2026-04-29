import {
  createShelterSchema,
  updateShelterSchema,
  createApplicationSchema,
  updateApplicationSchema,
  createContractSchema,
  updateContractSchema,
} from "../../src/utils/validators/otherValidator";

describe("Other Validators", () => {
  describe("createShelterSchema", () => {
    it("should validate valid shelter data", () => {
      const validData = {
        name: "Happy Paws Shelter",
        address: "123 Pet Street, City, State 12345",
        contactEmail: "contact@happypaws.org",
        phone: "555-1234",
        description: "A loving shelter for pets",
      };

      const result = createShelterSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject missing required fields", () => {
      const invalidData = {
        name: "Happy Paws",
      };

      const result = createShelterSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject invalid email format", () => {
      const invalidData = {
        name: "Happy Paws",
        address: "123 Street",
        contactEmail: "not-an-email",
      };

      const result = createShelterSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("updateShelterSchema", () => {
    it("should validate empty update data", () => {
      const validData = {};

      const result = updateShelterSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should validate partial update data", () => {
      const validData = {
        name: "Updated Name",
      };

      const result = updateShelterSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe("createApplicationSchema", () => {
    it("should validate valid application data", () => {
      const validData = {
        petId: "pet-123",
        petName: "Buddy",
      };

      const result = createApplicationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject missing petId", () => {
      const invalidData = {
        petName: "Buddy",
        message: "I would love to adopt!",
      };

      const result = createApplicationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should accept missing petName", () => {
      const validData = {
        petId: "pet-123",
      };

      const result = createApplicationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept optional message", () => {
      const validData = {
        petId: "pet-123",
        petName: "Buddy",
        message: "I have a large backyard and work from home",
      };

      const result = createApplicationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe("updateApplicationSchema", () => {
    it("should validate empty update data", () => {
      const validData = {};

      const result = updateApplicationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should validate status update", () => {
      const validData = {
        status: "approved",
      };

      const result = updateApplicationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid status", () => {
      const invalidData = {
        status: "invalid-status",
      };

      const result = updateApplicationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("createContractSchema", () => {
    it("should validate valid contract data", () => {
      const validData = {
        applicationId: "app-123",
        petId: "pet-123",
        adopterId: "user-123",
      };

      const result = createContractSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject missing required fields", () => {
      const invalidData = {
        applicationId: "app-123",
      };

      const result = createContractSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("updateContractSchema", () => {
    it("should validate empty update data", () => {
      const validData = {};

      const result = updateContractSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should validate status update", () => {
      const validData = {
        status: "signed",
      };

      const result = updateContractSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid status", () => {
      const invalidData = {
        status: "pending",
      };

      const result = updateContractSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should validate contractFileURL", () => {
      const validData = {
        contractFileURL: "https://example.com/contract.pdf",
      };

      const result = updateContractSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});