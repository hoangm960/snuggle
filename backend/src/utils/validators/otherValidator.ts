import { z } from "zod";

export const createShelterSchema = z.object({
	name: z.string().min(1, "Name is required").max(200),
	address: z.string().min(1, "Address is required").max(500),
	contactEmail: z.string().email("Invalid email format"),
	phone: z.string().max(20).optional(),
	description: z.string().max(2000).optional(),
	photoURLs: z.array(z.string().url()).max(10).default([]),
});

export const updateShelterSchema = createShelterSchema.partial();

export const createApplicationSchema = z.object({
	petId: z.string().min(1, "Pet ID is required"),
	message: z.string().max(2000).optional(),
});

export const updateApplicationSchema = z.object({
	status: z.enum(["pending", "approved", "rejected", "completed"]).optional(),
	adminNote: z.string().max(1000).optional(),
});

export const createContractSchema = z.object({
	applicationId: z.string().min(1, "Application ID is required"),
	petId: z.string().min(1, "Pet ID is required"),
	adopterId: z.string().min(1, "Adopter ID is required"),
});

export const updateContractSchema = z.object({
	status: z.enum(["draft", "signed", "archived"]).optional(),
	contractFileURL: z.string().url().optional(),
});
