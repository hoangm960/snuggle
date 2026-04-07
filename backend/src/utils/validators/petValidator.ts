import { z } from "zod";

export const createPetSchema = z.object({
	name: z.string().min(1, "Name is required").max(100),
	species: z.enum(["dog", "cat", "bird", "rabbit", "other"]),
	breed: z.string().max(100).optional(),
	ageMonths: z.number().int().min(0, "Age must be positive").max(360, "Age seems invalid"),
	size: z.enum(["small", "medium", "large"]).default("medium"),
	gender: z.enum(["male", "female"]),
	description: z.string().max(2000).optional(),
	photoURLs: z.array(z.string().url()).max(10).default([]),
	shelterId: z.string().optional(),
	isVaccinated: z.boolean().default(false),
	isNeutered: z.boolean().default(false),
});

export const updatePetSchema = createPetSchema.partial().extend({
	status: z.enum(["available", "pending", "adopted"]).optional(),
});

export const petQuerySchema = z.object({
	species: z.enum(["dog", "cat", "bird", "rabbit", "other"]).optional(),
	status: z.enum(["available", "pending", "adopted"]).optional(),
	shelterId: z.string().optional(),
	search: z.string().optional(),
});
