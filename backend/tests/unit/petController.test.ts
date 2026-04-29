import { getAllPets, getPetById, createPet, updatePet, deletePet } from "../../src/controllers/petController";
import { Request, Response } from "express";
import { AppError } from "../../src/middleware/errorHandler";

// Mock Firebase module with inline mock functions
jest.mock("../../src/config/firebase", () => {
	// Create mock functions inside factory
	const mockDocGet = jest.fn();
	const mockDocUpdate = jest.fn();
	const mockDocDelete = jest.fn();
	const mockCollectionGet = jest.fn();
	const mockCollectionAdd = jest.fn();
	const mockWhere = jest.fn().mockReturnThis();
	const mockOrderBy = jest.fn().mockReturnThis();
	const mockLimit = jest.fn().mockReturnThis();

	return {
		db: {
			collection: jest.fn(() => ({
				doc: jest.fn(() => ({
					get: mockDocGet,
					update: mockDocUpdate,
					delete: mockDocDelete,
				})),
				where: mockWhere,
				orderBy: mockOrderBy,
				limit: mockLimit,
				get: mockCollectionGet,
				add: mockCollectionAdd,
			})),
		},
		auth: {
			getUser: jest.fn(),
			verifyIdToken: jest.fn(),
		},
	};
});

describe("PetController", () => {
	let mockRes: Partial<Response>;
	let jsonMock: jest.Mock;
	let statusMock: jest.Mock;

	beforeEach(() => {
		jsonMock = jest.fn();
		statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		mockRes = {
			status: statusMock,
			json: jsonMock,
		} as Partial<Response>;
		jest.clearAllMocks();
	});

	describe("getAllPets", () => {
		it("should return all pets without filters", async () => {
			const mockSnapshot = {
				forEach: jest.fn((callback: any) => {
					callback({
						id: "pet1",
						data: () => ({ name: "Buddy", species: "dog" }),
					});
				}),
			};

			// Get the mock and set return value
			const { db } = require("../../src/config/firebase");
			const mockCollection = db.collection();
			(mockCollection.get as jest.Mock).mockResolvedValue(mockSnapshot);

			const mockReq = { query: {} } as any as Request;

			await getAllPets(mockReq, mockRes as Response);

			expect(statusMock).toHaveBeenCalledWith(200);
		});
	});

	describe("getPetById", () => {
		it("should return pet when found", async () => {
			const { db } = require("../../src/config/firebase");
			const mockCollection = db.collection();
			const mockDoc = mockCollection.doc();
			(mockDoc.get as jest.Mock).mockResolvedValue({
				exists: true,
				data: () => ({ name: "Buddy", species: "dog" }),
			});

			const mockReq = { params: { id: "pet-123" } } as any as Request;

			await getPetById(mockReq, mockRes as Response);

			expect(statusMock).toHaveBeenCalledWith(200);
		});

		it("should throw 404 when pet not found", async () => {
			const { db } = require("../../src/config/firebase");
			const mockCollection = db.collection();
			const mockDoc = mockCollection.doc();
			(mockDoc.get as jest.Mock).mockResolvedValue({ exists: false });

			const mockReq = { params: { id: "nonexistent" } } as any as Request;

			await expect(getPetById(mockReq, mockRes as Response)).rejects.toThrow(AppError);
		});
	});

	describe("createPet", () => {
		it("should create pet with valid data", async () => {
			const { db } = require("../../src/config/firebase");
			const mockCollection = db.collection();
			mockCollection.add.mockResolvedValue({ id: "new-pet-123" });

			const mockReq = {
				user: { uid: "shelter-123" },
				body: {
					name: "Buddy",
					species: "dog",
					breed: "Golden Retriever",
					ageMonths: 24,
					size: "medium",
					gender: "male",
					description: "Friendly dog",
					photoURLs: ["https://example.com/photo.jpg"],
				},
			} as any as Request;

			await createPet(mockReq, mockRes as Response);

			expect(statusMock).toHaveBeenCalledWith(201);
		});

		it("should throw 401 when no user", async () => {
			const mockReq = { user: undefined, body: {} } as any as Request;

			await expect(createPet(mockReq, mockRes as Response)).rejects.toThrow(AppError);
		});
	});

	describe("updatePet", () => {
		it("should throw 403 when user is not owner", async () => {
			const { db } = require("../../src/config/firebase");
			const mockCollection = db.collection();
			const mockDoc = mockCollection.doc();
			(mockDoc.get as jest.Mock).mockResolvedValue({
				exists: true,
				data: () => ({ shelterId: "other-shelter", name: "Old Name" }),
			});

			const mockReq = {
				user: { uid: "shelter-123" },
				params: { id: "pet-123" },
				body: { name: "New Name" },
			} as any as Request;

			await expect(updatePet(mockReq, mockRes as Response)).rejects.toThrow(AppError);
		});
	});

	describe("deletePet", () => {
		it("should throw 404 when pet not found", async () => {
			const { db } = require("../../src/config/firebase");
			const mockCollection = db.collection();
			const mockDoc = mockCollection.doc();
			(mockDoc.get as jest.Mock).mockResolvedValue({ exists: false });

			const mockReq = {
				user: { uid: "shelter-123" },
				params: { id: "nonexistent" },
			} as any as Request;

			await expect(deletePet(mockReq, mockRes as Response)).rejects.toThrow(AppError);
		});
	});
});
