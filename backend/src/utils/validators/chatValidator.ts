import { z } from "zod";

export const createChatSchema = z.object({
	applicationId: z.string().min(1, "Application ID is required"),
	petId: z.string().min(1, "Pet ID is required").optional(),
});

export const sendMessageSchema = z.object({
	content: z.string().min(1, "Message content is required").max(2000),
	metadata: z.record(z.string(), z.unknown()).optional(),
});

export const chatQuerySchema = z.object({
	limit: z.number().int().min(1).max(100).optional(),
	before: z.string().optional(),
});