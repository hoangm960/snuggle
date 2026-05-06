import api from "./api";
import {
	ApiResponse,
	KycStatusResponse,
	KycVerification,
	KycBatch,
	KycStats,
	KycWithUser,
} from "../types";

export const ekycApi = {
	getMyStatus: async (): Promise<KycStatusResponse> => {
		const response = await api.get<ApiResponse<KycStatusResponse>>("/kyc/me");
		return response.data.data!;
	},

	uploadFile: async (file: File, type: "id" | "financial"): Promise<string> => {
		const formData = new FormData();
		formData.append("file", file);
		formData.append("type", type);
		const response = await api.post<ApiResponse<{ url: string }>>("/kyc/upload", formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data.data!.url;
	},

	sendOtp: async (): Promise<void> => {
		await api.post<ApiResponse<never>>("/kyc/otp/send");
	},

	verifyOtp: async (code: string): Promise<void> => {
		await api.post<ApiResponse<never>>("/kyc/otp/verify", { code });
	},

	submitKyc: async (data: {
		fullName: string;
		dateOfBirth: string;
		idNumber: string;
		phone: string;
		idDocumentURL: string;
		financialDocumentURL: string;
	}): Promise<KycVerification> => {
		const response = await api.post<ApiResponse<KycVerification>>("/kyc/me", data);
		return response.data.data!;
	},

	getPendingKyc: async (): Promise<KycBatch> => {
		const response = await api.get<ApiResponse<KycBatch>>("/admin/kyc/pending");
		return response.data.data!;
	},

	getKycStats: async (): Promise<KycStats> => {
		const response = await api.get<ApiResponse<KycStats>>("/admin/kyc/stats");
		return response.data.data!;
	},

	getKycById: async (id: string): Promise<KycWithUser> => {
		const response = await api.get<ApiResponse<KycWithUser>>(`/admin/kyc/${id}`);
		return response.data.data!;
	},

	approveKyc: async (id: string): Promise<KycVerification> => {
		const response = await api.post<ApiResponse<KycVerification>>(
			`/admin/kyc/${id}/approve`,
			{}
		);
		return response.data.data!;
	},

	rejectKyc: async (id: string, reason: string): Promise<KycVerification> => {
		const response = await api.post<ApiResponse<KycVerification>>(`/admin/kyc/${id}/reject`, {
			reason,
		});
		return response.data.data!;
	},
};
