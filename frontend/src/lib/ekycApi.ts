import api from "./api";
import { ApiResponse, KycStatusResponse, KycVerification } from "../types";

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
			headers: {
				"Content-Type": "multipart/form-data",
			},
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
};
