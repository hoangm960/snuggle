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
	location?: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface NotificationPrefs {
	newRequest: boolean;
	requestApproved: boolean;
	newMessage: boolean;
	weeklyReport: boolean;
	systemAlerts: boolean;
}

export interface AppearancePrefs {
	darkMode: boolean;
	compactView: boolean;
	accentColor: string;
}

export interface User {
	id?: string;
	email: string;
	displayName: string;
	role: "visitor" | "adopter" | "shelter" | "admin";
	photoURL?: string;
	phone?: string;
	bio?: string;
	notificationPrefs?: NotificationPrefs;
	appearance?: AppearancePrefs;
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

export interface AdoptionApplication {
	id?: string;
	petId: string;
	name: string;
	adopterId: string;
	adopterName: string;
	shelterId: string;
	status: "pending" | "approved" | "rejected" | "completed";
	message?: string;
	adminNote?: string;
	chatId?: string;
	reviewedBy?: string;
	appliedAt: Date | string;
	reviewedAt?: Date | string;
	// Applicant information
	applicantFullName?: string;
	applicantAddress?: string;
	applicantApartment?: string;
	applicantCity?: string;
	applicantState?: string;
	applicantZipCode?: string;
	applicantPhone?: string;
	applicantEmail?: string;
	applicantDateOfBirth?: string;
	applicantAge?: string;
	applicantIdLicense?: string;
	spousePartnerName?: string;
	employmentStatus?: "full-time" | "part-time" | "unemployed" | "student" | "retired";
	// Living arrangement
	housingType?: "rent" | "own" | "parents";
	landlordAllowsPets?: "yes" | "no" | "not-sure";
	landlordAllowsHowMany?: string;
	landlordContact?: string;
	homeType?: "house" | "condo" | "mobile-home" | "apartment" | "other";
	otherHomeType?: string;
	lengthAtAddress?: string;
	planningToMove?: string;
	householdAgreement?: string;
	householdAllergies?: boolean;
	// About the adoption
	reasonForAdopting?: string;
	petWillStay?: string;
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

export interface KycBatch {
	kycVerifications: KycVerification[];
	total: number;
	pending: number;
	approved: number;
	rejected: number;
}

export interface KycStats {
	total: number;
	pending: number;
	approved: number;
	rejected: number;
	approvedToday: number;
	rejectedToday: number;
}

export interface KycWithUser {
	kyc: KycVerification;
	user: {
		id: string;
		email: string;
		displayName: string;
		photoURL?: string;
	};
}

export interface QuizOption {
	value: string;
	label: string;
	subLabel?: string;
	icon: string;
	weights: {
		species?: { dog?: number; cat?: number; other?: number };
		size?: { small?: number; medium?: number; large?: number };
	};
}

export interface QuizQuestion {
	id?: string;
	order: number;
	category: string;
	question: string;
	options: QuizOption[];
	isActive: boolean;
	createdAt: Date | string;
	updatedAt: Date | string;
}

export interface QuizMatch {
	pet: {
		id?: string;
		name: string;
		species: string;
		breed: string;
		ageMonths: number;
		size: string;
		gender: string;
		thumbnail?: string;
		description?: string;
		status: string;
	};
	pct: number;
}
