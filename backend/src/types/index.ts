import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email?: string;
  };
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

export interface User {
  id?: string;
  email: string;
  displayName: string;
  role: 'adopter' | 'shelter' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
