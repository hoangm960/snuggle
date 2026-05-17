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
	sendOtpEmail: jest.fn().mockResolvedValue(undefined),
}));

import { generateAndSendOtp, verifyOtpCode } from "../../src/services/otpService";

describe("otpService", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("generateAndSendOtp", () => {
		it("should generate OTP and send email when no active OTP exists", async () => {
			const { db } = require("../../src/config/firebase");
			const { sendOtpEmail } = require("../../src/services/emailService");
			const mockCollection = db.collection();
			mockCollection.get.mockResolvedValue({ empty: true, docs: [] });
			mockCollection.add.mockResolvedValue({ id: "otp-123" });

			await generateAndSendOtp("user-123", "test@example.com", "Test User");

			expect(mockCollection.add).toHaveBeenCalledWith(
				expect.objectContaining({
					userId: "user-123",
					email: "test@example.com",
				})
			);
			const added = mockCollection.add.mock.calls[0][0];
			expect(added.code).toMatch(/^\d{6}$/);
			expect(added.expiresAt).toBeInstanceOf(Date);
			expect(sendOtpEmail).toHaveBeenCalledWith({
				to: "test@example.com",
				displayName: "Test User",
				code: added.code,
			});
		});

		it("should throw if an active OTP already exists", async () => {
			const { db } = require("../../src/config/firebase");
			const mockCollection = db.collection();
			mockCollection.get.mockResolvedValue({
				empty: false,
				docs: [{ id: "existing-otp" }],
			});

			await expect(
				generateAndSendOtp("user-123", "test@example.com", "Test User")
			).rejects.toThrow("A valid OTP code is already active. Please check your email.");

			expect(mockCollection.add).not.toHaveBeenCalled();
		});

		it("should clean up expired OTPs before creating new one", async () => {
			const { db } = require("../../src/config/firebase");
			const mockCollection = db.collection();
			const mockDelete = jest.fn().mockResolvedValue(undefined);

			mockCollection.get
				.mockResolvedValueOnce({ empty: true, docs: [] })
				.mockResolvedValueOnce({
					empty: false,
					docs: [
						{ id: "expired-1", ref: { delete: mockDelete } },
						{ id: "expired-2", ref: { delete: mockDelete } },
					],
				});
			mockCollection.add.mockResolvedValue({ id: "otp-123" });

			await generateAndSendOtp("user-123", "test@example.com", "Test User");

			expect(mockDelete).toHaveBeenCalledTimes(2);
		});

		it("should delete OTP token if email sending fails", async () => {
			const { db } = require("../../src/config/firebase");
			const { sendOtpEmail } = require("../../src/services/emailService");
			const mockCollection = db.collection();
			const mockDocDelete = jest.fn().mockResolvedValue(undefined);

			mockCollection.get
				.mockResolvedValueOnce({ empty: true, docs: [] })
				.mockResolvedValueOnce({ empty: true, docs: [] })
				.mockResolvedValueOnce({
					empty: false,
					docs: [{ id: "otp-123", ref: { delete: mockDocDelete } }],
				});
			mockCollection.add.mockResolvedValue({ id: "otp-123" });
			sendOtpEmail.mockRejectedValue(new Error("SMTP error"));

			await expect(
				generateAndSendOtp("user-123", "test@example.com", "Test User")
			).rejects.toThrow("Failed to send verification code email");

			expect(mockDocDelete).toHaveBeenCalled();
		});
	});

	describe("verifyOtpCode", () => {
		it("should return true for valid OTP and delete it", async () => {
			const { db } = require("../../src/config/firebase");
			const mockCollection = db.collection();
			const mockDocDelete = jest.fn().mockResolvedValue(undefined);
			mockCollection.get.mockResolvedValue({
				empty: false,
				docs: [{ id: "otp-123", ref: { delete: mockDocDelete } }],
			});

			const result = await verifyOtpCode("user-123", "123456");

			expect(result).toBe(true);
			expect(mockDocDelete).toHaveBeenCalled();
		});

		it("should return false for invalid OTP", async () => {
			const { db } = require("../../src/config/firebase");
			const mockCollection = db.collection();
			mockCollection.get.mockResolvedValue({ empty: true, docs: [] });

			const result = await verifyOtpCode("user-123", "wrong-code");

			expect(result).toBe(false);
		});

		it("should query with correct parameters", async () => {
			const { db } = require("../../src/config/firebase");
			const mockCollection = db.collection();
			mockCollection.get.mockResolvedValue({ empty: true, docs: [] });

			await verifyOtpCode("user-123", "123456");

			expect(mockCollection.where).toHaveBeenCalledWith("userId", "==", "user-123");
			expect(mockCollection.where).toHaveBeenCalledWith("code", "==", "123456");
			expect(mockCollection.where).toHaveBeenCalledWith("expiresAt", ">", expect.any(Date));
			expect(mockCollection.limit).toHaveBeenCalledWith(1);
		});
	});
});
