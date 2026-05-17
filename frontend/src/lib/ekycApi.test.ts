import { describe, it, expect, vi, beforeEach } from "vitest";
import api from "./api";
import { ekycApi } from "./ekycApi";

vi.mock("./api", () => ({
	__esModule: true,
	default: {
		get: vi.fn(),
		post: vi.fn(),
	},
}));

describe("ekycApi", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("getMyStatus", () => {
		it("should fetch KYC status", async () => {
			const mockStatus = {
				kyc: null,
				user: {
					id: "user1",
					email: "test@test.com",
					displayName: "Test",
					isKycVerified: false,
				},
			};
			(api.get as any).mockResolvedValue({ data: { data: mockStatus } });

			const result = await ekycApi.getMyStatus();

			expect(api.get).toHaveBeenCalledWith("/kyc/me");
			expect(result).toEqual(mockStatus);
		});
	});

	describe("uploadFile", () => {
		it("should upload file and return URL", async () => {
			const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
			(api.post as any).mockResolvedValue({
				data: { data: { url: "https://example.com/file.jpg" } },
			});

			const result = await ekycApi.uploadFile(file, "id");

			expect(api.post).toHaveBeenCalledWith("/kyc/upload", expect.any(FormData), {
				headers: { "Content-Type": "multipart/form-data" },
			});
			expect(result).toBe("https://example.com/file.jpg");
		});
	});

	describe("sendOtp", () => {
		it("should send OTP request", async () => {
			(api.post as any).mockResolvedValue({});

			await ekycApi.sendOtp();

			expect(api.post).toHaveBeenCalledWith("/kyc/otp/send");
		});
	});

	describe("verifyOtp", () => {
		it("should verify OTP code", async () => {
			(api.post as any).mockResolvedValue({});

			await ekycApi.verifyOtp("123456");

			expect(api.post).toHaveBeenCalledWith("/kyc/otp/verify", { code: "123456" });
		});
	});

	describe("submitKyc", () => {
		it("should submit KYC data", async () => {
			const kycData = {
				fullName: "John Doe",
				dateOfBirth: "1990-01-01",
				idNumber: "ABC123",
				phone: "+1234567890",
				idDocumentURL: "https://example.com/id.pdf",
				financialDocumentURL: "https://example.com/fin.pdf",
			};
			const mockVerification = {
				id: "kyc1",
				status: "pending" as const,
				attemptCount: 1,
				submittedAt: new Date(),
			};
			(api.post as any).mockResolvedValue({ data: { data: mockVerification } });

			const result = await ekycApi.submitKyc(kycData);

			expect(api.post).toHaveBeenCalledWith("/kyc/me", kycData);
			expect(result).toEqual(mockVerification);
		});
	});

	describe("getPendingKyc", () => {
		it("should fetch pending KYC verifications", async () => {
			const mockBatch = {
				kycVerifications: [],
				total: 0,
				pending: 0,
				approved: 0,
				rejected: 0,
			};
			(api.get as any).mockResolvedValue({ data: { data: mockBatch } });

			const result = await ekycApi.getPendingKyc();

			expect(api.get).toHaveBeenCalledWith("/kyc/pending");
			expect(result).toEqual(mockBatch);
		});
	});

	describe("getKycStats", () => {
		it("should fetch KYC statistics", async () => {
			const mockStats = {
				total: 10,
				pending: 3,
				approved: 5,
				rejected: 2,
				approvedToday: 1,
				rejectedToday: 0,
			};
			(api.get as any).mockResolvedValue({ data: { data: mockStats } });

			const result = await ekycApi.getKycStats();

			expect(api.get).toHaveBeenCalledWith("/kyc/stats");
			expect(result).toEqual(mockStats);
		});
	});

	describe("getKycById", () => {
		it("should fetch KYC by id", async () => {
			const mockKycWithUser = {
				kyc: {
					id: "kyc1",
					status: "pending" as const,
					attemptCount: 1,
					submittedAt: new Date(),
				},
				user: { id: "user1", email: "test@test.com", displayName: "Test" },
			};
			(api.get as any).mockResolvedValue({ data: { data: mockKycWithUser } });

			const result = await ekycApi.getKycById("kyc1");

			expect(api.get).toHaveBeenCalledWith("/kyc/kyc1");
			expect(result).toEqual(mockKycWithUser);
		});
	});

	describe("approveKyc", () => {
		it("should approve KYC", async () => {
			const mockVerification = {
				id: "kyc1",
				status: "approved" as const,
				attemptCount: 1,
				submittedAt: new Date(),
			};
			(api.post as any).mockResolvedValue({ data: { data: mockVerification } });

			const result = await ekycApi.approveKyc("kyc1");

			expect(api.post).toHaveBeenCalledWith("/kyc/kyc1/approve", {});
			expect(result).toEqual(mockVerification);
		});
	});

	describe("rejectKyc", () => {
		it("should reject KYC with reason", async () => {
			const mockVerification = {
				id: "kyc1",
				status: "rejected" as const,
				attemptCount: 1,
				submittedAt: new Date(),
			};
			(api.post as any).mockResolvedValue({ data: { data: mockVerification } });

			const result = await ekycApi.rejectKyc("kyc1", "Invalid document");

			expect(api.post).toHaveBeenCalledWith("/kyc/kyc1/reject", {
				reason: "Invalid document",
			});
			expect(result).toEqual(mockVerification);
		});
	});
});
