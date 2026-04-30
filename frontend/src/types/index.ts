export interface AuthRequest extends Request {
	user?: {
		uid: string;
		email?: string;
	};
}

export interface Pet {
	id?: string;
	name: string;
	species: "dog" | "cat" | "other";
	breed: string;
	age: number;
	ageMonths?: number;
	gender: "male" | "female";
	description: string;
	thumbnail?: string;
	photoUrls?: string[];
	shelterId: string;
	status: "available" | "adopted" | "pending";
	isVaccinated?: boolean;
	isNeutered?: boolean;
	arrivalDate?: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface User {
	id?: string;
	email: string;
	displayName: string;
	role: "adopter" | "shelter" | "admin";
	createdAt: Date;
	updatedAt: Date;
}

export interface ApiResponse<T = unknown> {
	success: boolean;
	data?: T;
	message?: string;
	error?: string;
}

export interface Chat {
	id?: string;
	type: "application" | "support";
	applicationId?: string;
	participantIds: string[];
	claimedBy?: string;
	claimedAt?: Date;
	lastMessage?: string;
	lastMessageAt?: Date;
	createdAt: Date;
}

export interface Message {
	id?: string;
	chatId?: string;
	senderId: string;
	content: string;
	type: "text" | "image" | "system";
	isRead: boolean;
	sentAt: Date;
}

export interface KycVerification {
	id?: string;
	userId?: string;
	status: "pending" | "approved" | "rejected";
	fullName?: string;
	dateOfBirth?: string;
	idNumber?: string;
	phone?: string;
	idDocumentURL?: string;
	financialDocumentURL?: string;
	kycProvider?: string;
	rejectionReason?: string;
	attemptCount: number;
	submittedAt: Date;
	reviewedAt?: Date;
}

export interface KycStatusResponse {
	kyc: KycVerification | null;
	user: {
		id: string;
		email: string;
		displayName: string;
		photoURL?: string;
		isKycVerified: boolean;
	} | null;
}
