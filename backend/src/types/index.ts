import { Request } from 'express';
import admin from 'firebase-admin';

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email?: string;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface User {
  id?: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'visitor' | 'admin';
  accountStatus: 'active' | 'suspended';
  authProvider: 'email' | 'google' | 'apple';
  emailVerified: boolean;
  isKycVerified: boolean;
  shelterId?: string;
  fcmTokens?: string[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface Pet {
  id?: string;
  name: string;
  species: 'dog' | 'cat' | 'other';
  breed: string;
  age: number;
  gender: 'male' | 'female';
  description: string;
  imageUrl: string;
  shelterId: string;
  status: 'available' | 'adopted' | 'pending';
  createdAt: Date;
  updatedAt: Date;
}

  id?: string;
  createdAt: Date;
}

  message?: string;
}
