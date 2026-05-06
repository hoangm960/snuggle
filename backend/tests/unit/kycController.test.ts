import {
	getPendingKYC,
	getKYCById,
	getUserWithKYC,
	approveKYC,
	rejectKYC,
	getKYCStats,
	getUserKYC,
} from "../../src/controllers/kycController";

jest.mock("../../src/config/firebase", () => {
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

jest.mock("../../src/services/emailService", () => ({
	sendKYCApprovedEmail: jest.fn().mockResolvedValue(undefined),
	sendKYCRejectedEmail: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../../src/controllers/adminController", () => ({
	logAdminAction: jest.fn().mockResolvedValue(undefined),
}));

describe("KYCController", () => {
	describe("getPendingKYC", () => {
		it("should return pending KYC verifications with counts", async () => {
			const mockSnapshot = {
				docs: [
					{
						id: "kyc1",
						data: () => ({
							status: "pending",
							submittedAt: { toDate: () => new Date("2024-01-01") },
						}),
					},
					{
						id: "kyc2",
						data: () => ({
							status: "approved",
							submittedAt: { toDate: () => new Date("2024-01-02") },
						}),
					},
					{
						id: "kyc3",
						data: () => ({
							status: "rejected",
							submittedAt: { toDate: () => new Date("2024-01-03") },
						}),
					},
				],
				size: 3,
			};

			const { db } = require("../../src/config/firebase");
			const mockCollection = db.collection();
			(mockCollection.get as jest.Mock).mockResolvedValue(mockSnapshot);

			const result = await getPendingKYC();

			expect(result.total).toBe(3);
			expect(result.pending).toBe(1);
			expect(result.approved).toBe(1);
			expect(result.rejected).toBe(1);
			expect(result.kycVerifications).toHaveLength(3);
		});

		it("should return empty batch when no verifications", async () => {
			const mockSnapshot = {
				docs: [],
				size: 0,
			};

			const { db } = require("../../src/config/firebase");
			const mockCollection = db.collection();
			(mockCollection.get as jest.Mock).mockResolvedValue(mockSnapshot);

			const result = await getPendingKYC();

			expect(result.total).toBe(0);
			expect(result.pending).toBe(0);
			expect(result.kycVerifications).toHaveLength(0);
		});
	});

	describe("getKYCById", () => {
		it("should return KYC verification by id", async () => {
			const mockDoc = {
				exists: true,
				id: "kyc1",
				data: () => ({
					status: "pending",
					fullName: "John Doe",
					submittedAt: { toDate: () => new Date("2024-01-01") },
				}),
			};

			const { db } = require("../../src/config/firebase");
			const mockCollection = db.collection();
			const mockDocRef = mockCollection.doc("kyc1");
			(mockDocRef.get as jest.Mock).mockResolvedValue(mockDoc);

			const result = await getKYCById("kyc1");

			expect(result.id).toBe("kyc1");
			expect(result.status).toBe("pending");
		});

		it("should throw error when KYC not found", async () => {
			const mockDoc = {
				exists: false,
			};

			const { db } = require("../../src/config/firebase");
			const mockCollection = db.collection();
			const mockDocRef = mockCollection.doc("nonexistent");
			(mockDocRef.get as jest.Mock).mockResolvedValue(mockDoc);

			await expect(getKYCById("nonexistent")).rejects.toThrow(
				"KYC verification not found"
			);
		});
	});

	describe("getKYCStats", () => {
		it("should return KYC stats with counts", async () => {
			const mockSnapshot = {
				docs: [
					{
						id: "kyc1",
						data: () => ({
							status: "pending",
							submittedAt: { toDate: () => new Date("2024-01-01") },
						}),
					},
					{
						id: "kyc2",
						data: () => ({
							status: "approved",
							reviewedAt: { toDate: () => new Date() },
						}),
					},
					{
						id: "kyc3",
						data: () => ({
							status: "rejected",
							reviewedAt: { toDate: () => new Date() },
						}),
					},
				],
				size: 3,
			};

			const { db } = require("../../src/config/firebase");
			const mockCollection = db.collection();
			(mockCollection.get as jest.Mock).mockResolvedValue(mockSnapshot);

			const result = await getKYCStats();

			expect(result.total).toBe(3);
			expect(result.pending).toBe(1);
			expect(result.approved).toBe(1);
			expect(result.rejected).toBe(1);
		});

		it("should return zero counts when no verifications", async () => {
			const mockSnapshot = {
				docs: [],
				size: 0,
			};

			const { db } = require("../../src/config/firebase");
			const mockCollection = db.collection();
			(mockCollection.get as jest.Mock).mockResolvedValue(mockSnapshot);

			const result = await getKYCStats();

			expect(result.total).toBe(0);
			expect(result.pending).toBe(0);
			expect(result.approved).toBe(0);
			expect(result.rejected).toBe(0);
		});
	});

	describe("getUserKYC", () => {
		it("should return KYC for user", async () => {
			const mockSnapshot = {
				empty: false,
				docs: [
					{
						id: "kyc1",
						data: () => ({
							status: "pending",
							userId: "user1",
							submittedAt: { toDate: () => new Date("2024-01-01") },
						}),
					},
				],
			};

			const { db } = require("../../src/config/firebase");
			const mockCollection = db.collection();
			(mockCollection.where as jest.Mock).mockReturnValue({
				orderBy: jest.fn().mockReturnValue({
					limit: jest.fn().mockReturnValue({
						get: jest.fn().mockResolvedValue(mockSnapshot),
					}),
				}),
			});

			const result = await getUserKYC("user1");

			expect(result).not.toBeNull();
			expect(result?.id).toBe("kyc1");
		});

		it("should return null when no KYC", async () => {
			const mockSnapshot = {
				empty: true,
				docs: [],
			};

			const { db } = require("../../src/config/firebase");
			const mockCollection = db.collection();
			(mockCollection.where as jest.Mock).mockReturnValue({
				orderBy: jest.fn().mockReturnValue({
					limit: jest.fn().mockReturnValue({
						get: jest.fn().mockResolvedValue(mockSnapshot),
					}),
				}),
			});

			const result = await getUserKYC("user1");

			expect(result).toBeNull();
		});
	});
});