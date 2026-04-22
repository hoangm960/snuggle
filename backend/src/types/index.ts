import { Request } from "express";
import admin from "firebase-admin";

export type GeoPoint = admin.firestore.GeoPoint;

export interface AuthRequest extends Request {
	user?: {
		uid: string;
		email?: string;
		displayName?: string;
	};
	file?: Express.Multer.File;
}

export interface ApiResponse<T = unknown> {
	success: boolean;
	data?: T;
	message?: string;
	error?: string;
	emailVerificationRequired?: boolean;
}

export interface User {
	id?: string;
	email: string;
	displayName: string;
	photoURL?: string;
	role: "visitor" | "admin";
	accountStatus: "active" | "suspended";
	authProvider: "email" | "google" | "apple" | "facebook";
	emailVerified: boolean;
	isKycVerified: boolean;
	shelterId?: string;
	fcmTokens?: string[];
	loginCount?: number;
	lastLoginAt?: Date;
	createdAt: Date;
	updatedAt?: Date;
}

export interface SavedSearch {
	id?: string;
	userId?: string;
	species?: string;
	breed?: string;
	size?: string;
	maxDistanceKm?: number;
	notifyOnMatch: boolean;
	createdAt: Date;
}

export interface KycVerification {
	id?: string;
	userId?: string;
	status: "pending" | "approved" | "rejected";
	idDocumentURL?: string;
	selfieURL?: string;
	kycProvider?: string;
	rejectionReason?: string;
	attemptCount: number;
	reviewedBy?: string;
	submittedAt: Date;
	reviewedAt?: Date;
}

export interface AdopterProfile {
	id?: string;
	userId?: string;
	homeType: "apartment" | "house" | "townhouse" | "condo" | "farm" | "other";
	hasChildren: boolean;
	hasOtherPets: boolean;
	activityLevel: "low" | "medium" | "high";
	preferredPetSize?: string[];
	preferredSpecies?: string[];
	locationName?: string;
	geoPoint?: GeoPoint;
	lifestyleAnswers?: Record<string, string>;
	completedAt?: Date;
	updatedAt: Date;
}

export interface Shelter {
	id?: string;
	name: string;
	adminUserId: string;
	address: string;
	geoPoint?: GeoPoint;
	contactEmail: string;
	phone?: string;
	description?: string;
	photoURLs?: string[];
	trustScore: number;
	totalReviews: number;
	status: "active" | "suspended";
	createdAt: Date;
	updatedAt?: Date;
}

export interface Review {
	id?: string;
	shelterId?: string;
	reviewerId: string;
	rating: number;
	comment?: string;
	status: "pending" | "approved" | "removed";
	createdAt: Date;
}

export interface Pet {
	id?: string;
	name: string;
	species: string;
	breed: string;
	ageMonths: number;
	size: "small" | "medium" | "large";
	gender: "male" | "female";
	status: "available" | "pending" | "adopted";
	shelterId: string;
	shelterName?: string;
	postedBy?: string;
	description?: string;
	photoURLs?: string[];
	thumbnail?: string;
	isVaccinated: boolean;
	isNeutered: boolean;
	geoPoint?: GeoPoint;
	contractId?: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface HealthRecord {
	id?: string;
	petId?: string;
	type: "vaccine" | "checkup" | "treatment";
	description: string;
	vetName?: string;
	batchNumber?: string;
	documentURL?: string;
	addedBy?: string;
	recordDate: Date;
	createdAt: Date;
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
	appliedAt: Date;
	reviewedAt?: Date;
}

export interface AdoptionContract {
	id?: string;
	applicationId: string;
	petId: string;
	adopterId: string;
	contractFileURL?: string;
	contractHash?: string;
	adopterSignedAt?: Date;
	shelterSignedAt?: Date;
	status: "draft" | "signed" | "archived";
	createdAt: Date;
}

export interface Chat {
	id?: string;
	applicationId: string;
	participantIds: string[];
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

export interface JournalPost {
	id?: string;
	petId: string;
	authorId: string;
	contractId?: string;
	content: string;
	photoURLs?: string[];
	status: "pending" | "approved" | "highlighted" | "deleted";
	createdAt: Date;
}

export interface Notification {
	id?: string;
	userId: string;
	type: string;
	title: string;
	body: string;
	linkId?: string;
	linkedType?: string;
	isRead: boolean;
	createdAt: Date;
}
