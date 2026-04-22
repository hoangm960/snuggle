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

export const createSavedSearchSchema = z.object({
	name: z.string().min(1, "Name is required").max(100),
	searchCriteria: z.object({
		species: z.enum(["dog", "cat", "bird", "rabbit", "other"]).optional(),
		size: z.enum(["small", "medium", "large"]).optional(),
		ageMonthsMin: z.number().int().min(0).optional(),
		ageMonthsMax: z.number().int().min(0).optional(),
		gender: z.enum(["male", "female"]).optional(),
		isVaccinated: z.boolean().optional(),
		isNeutered: z.boolean().optional(),
	}).optional(),
	notifyOnNewMatches: z.boolean().default(false),
});

export const createReviewSchema = z.object({
	rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
	comment: z.string().max(2000).optional(),
});

export const updateReviewStatusSchema = z.object({
	status: z.enum(["pending", "approved", "rejected"]).optional(),
});

export const createAdopterProfileSchema = z.object({
	firstName: z.string().min(1, "First name is required").max(100),
	lastName: z.string().min(1, "Last name is required").max(100),
	dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date format"),
	address: z.string().max(500).optional(),
	phone: z.string().max(20).optional(),
	occupation: z.string().max(100).optional(),
	hasOtherPets: z.boolean().default(false),
	hasChildren: z.boolean().default(false),
	housingType: z.enum(["house", "apartment", "other"]).optional(),
	hasFence: z.boolean().default(false),
	experienceWithPets: z.enum(["none", "some", "experienced"]).optional(),
	adoptionReason: z.string().max(1000).optional(),
});

export const updateAdopterProfileSchema = createAdopterProfileSchema.partial();

export const inviteUserSchema = z.object({
	email: z.string().email("Invalid email format"),
	role: z.enum(["visitor", "admin"]),
});

export const updateUserSchema = z.object({
	role: z.enum(["visitor", "admin"]).optional(),
	accountStatus: z.enum(["active", "suspended"]).optional(),
});
