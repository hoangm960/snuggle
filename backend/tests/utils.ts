import jwt from "jsonwebtoken";
import request from "supertest";

export const createTestToken = (payload: object, secret?: string): string => {
	return jwt.sign(payload, secret || "test-secret", { expiresIn: "1h" });
};

export const createMockUser = (overrides = {}) => ({
	uid: "test-user-uid-123",
	email: "test@example.com",
	displayName: "Test User",
	photoURL: "https://example.com/photo.jpg",
	role: "visitor" as const,
	accountStatus: "active" as const,
	authProvider: "email" as const,
	emailVerified: true,
	isKycVerified: false,
	...overrides,
});

export const createMockPet = (overrides = {}) => ({
	id: "pet-123",
	name: "Buddy",
	species: "dog",
	breed: "Golden Retriever",
	ageMonths: 24,
	size: "medium" as const,
	gender: "male" as const,
	status: "available" as const,
	shelterId: "shelter-123",
	shelterName: "Happy Paws Shelter",
	postedBy: "user-123",
	description: "A friendly dog",
	photoURLs: ["https://example.com/photo.jpg"],
	isVaccinated: true,
	isNeutered: true,
	createdAt: new Date(),
	updatedAt: new Date(),
	...overrides,
});

export const createMockShelter = (overrides = {}) => ({
	id: "shelter-123",
	name: "Happy Paws Shelter",
	adminUserId: "user-123",
	address: "123 Pet Street, City, ST 12345",
	contactEmail: "contact@happypaws.org",
	phone: "555-123-4567",
	description: "A no-kill shelter",
	photoURLs: ["https://example.com/shelter.jpg"],
	trustScore: 4.5,
	totalReviews: 100,
	status: "active" as const,
	createdAt: new Date(),
	updatedAt: new Date(),
	...overrides,
});

export const createMockApplication = (overrides = {}) => ({
	id: "app-123",
	petId: "pet-123",
	petName: "Buddy",
	adopterId: "user-456",
	adopterName: "John Doe",
	shelterId: "shelter-123",
	status: "pending" as const,
	message: "I would love to adopt this pet",
	appliedAt: new Date(),
	reviewedAt: undefined,
	...overrides,
});

export const createMockContract = (overrides = {}) => ({
	id: "contract-123",
	applicationId: "app-123",
	petId: "pet-123",
	adopterId: "user-456",
	contractFileURL: "https://example.com/contract.pdf",
	status: "draft" as const,
	createdAt: new Date(),
	...overrides,
});

export const createMockReview = (overrides = {}) => ({
	id: "review-123",
	shelterId: "shelter-123",
	reviewerId: "user-456",
	rating: 5,
	comment: "Great shelter!",
	status: "approved" as const,
	createdAt: new Date(),
	...overrides,
});

export const createMockSavedSearch = (overrides = {}) => ({
	id: "search-123",
	userId: "user-123",
	species: "dog",
	breed: "Golden Retriever",
	size: "medium",
	notifyOnMatch: true,
	createdAt: new Date(),
	...overrides,
});

export const createMockAdopterProfile = (overrides = {}) => ({
	id: "profile-123",
	userId: "user-123",
	homeType: "house" as const,
	hasChildren: true,
	hasOtherPets: false,
	activityLevel: "high" as const,
	preferredPetSize: ["medium", "large"],
	preferredSpecies: ["dog"],
	locationName: "123 Main St, City, ST 12345",
	lifestyleAnswers: {},
	completedAt: new Date(),
	updatedAt: new Date(),
	...overrides,
});

export const createMockHealthRecord = (overrides = {}) => ({
	id: "record-123",
	petId: "pet-123",
	type: "vaccine" as const,
	description: "Rabies vaccine",
	vetName: "Dr. Smith",
	recordDate: new Date(),
	createdAt: new Date(),
	...overrides,
});

export const expectSuccess = (res: request.Response) => {
	expect(res.status).toBeLessThan(400);
	return res.body;
};

export const expectError = (res: request.Response, statusCode: number) => {
	expect(res.status).toBe(statusCode);
	return res.body;
};
