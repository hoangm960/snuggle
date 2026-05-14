import {
	createChatSchema,
	sendMessageSchema,
	chatQuerySchema,
} from "../../src/utils/validators/chatValidator";

describe("Chat Validators", () => {
	describe("createChatSchema", () => {
		it("should validate with required fields only", () => {
			const result = createChatSchema.safeParse({ applicationId: "app-123" });
			expect(result.success).toBe(true);
		});

		it("should validate with all fields", () => {
			const result = createChatSchema.safeParse({
				applicationId: "app-123",
				petId: "pet-456",
			});
			expect(result.success).toBe(true);
		});

		it("should reject empty applicationId", () => {
			const result = createChatSchema.safeParse({ applicationId: "" });
			expect(result.success).toBe(false);
		});

		it("should reject missing applicationId", () => {
			const result = createChatSchema.safeParse({});
			expect(result.success).toBe(false);
		});
	});

	describe("sendMessageSchema", () => {
		it("should validate valid message", () => {
			const result = sendMessageSchema.safeParse({ content: "Hello" });
			expect(result.success).toBe(true);
		});

		it("should validate with metadata", () => {
			const result = sendMessageSchema.safeParse({
				content: "Hello",
				metadata: { type: "text" },
			});
			expect(result.success).toBe(true);
		});

		it("should reject empty content", () => {
			const result = sendMessageSchema.safeParse({ content: "" });
			expect(result.success).toBe(false);
		});

		it("should reject missing content", () => {
			const result = sendMessageSchema.safeParse({});
			expect(result.success).toBe(false);
		});

		it("should reject content exceeding max length", () => {
			const result = sendMessageSchema.safeParse({ content: "a".repeat(2001) });
			expect(result.success).toBe(false);
		});

		it("should accept content at max length", () => {
			const result = sendMessageSchema.safeParse({ content: "a".repeat(2000) });
			expect(result.success).toBe(true);
		});
	});

	describe("chatQuerySchema", () => {
		it("should parse valid limit", () => {
			const result = chatQuerySchema.safeParse({ limit: 50 });
			expect(result.success).toBe(true);
		});

		it("should parse valid before cursor", () => {
			const result = chatQuerySchema.safeParse({ before: "msg-123" });
			expect(result.success).toBe(true);
		});

		it("should parse empty object", () => {
			const result = chatQuerySchema.safeParse({});
			expect(result.success).toBe(true);
		});

		it("should reject limit below minimum", () => {
			const result = chatQuerySchema.safeParse({ limit: 0 });
			expect(result.success).toBe(false);
		});

		it("should reject limit above maximum", () => {
			const result = chatQuerySchema.safeParse({ limit: 101 });
			expect(result.success).toBe(false);
		});

		it("should accept limit at boundaries", () => {
			expect(chatQuerySchema.safeParse({ limit: 1 }).success).toBe(true);
			expect(chatQuerySchema.safeParse({ limit: 100 }).success).toBe(true);
		});
	});
});
