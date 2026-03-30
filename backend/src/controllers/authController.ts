import { Request, Response } from 'express';
import { auth, db } from '../config/firebase';
import { AuthRequest, ApiResponse, User } from '../types';
import { AppError } from '../middleware/errorHandler';

const usersCollection = db.collection('users');

export const verifyToken = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const userDoc = await usersCollection.doc(req.user.uid).get();
    
    let user: User | null = null;
    if (userDoc.exists) {
      user = { id: userDoc.id, ...userDoc.data() } as User;
    }

    const response: ApiResponse<{ uid: string; email?: string; user?: User }> = {
      success: true,
      data: {
        uid: req.user.uid,
        email: req.user.email,
        user: user || undefined,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to verify token', 500);
  }
};

export const createUserProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { displayName, role } = req.body;

    const userData: Omit<User, 'id'> = {
      email: req.user.email || '',
      displayName: displayName || '',
      role: role || 'adopter',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await usersCollection.doc(req.user.uid).set(userData);

    const user: User = { id: req.user.uid, ...userData };

    const response: ApiResponse<User> = {
      success: true,
      data: user,
      message: 'User profile created successfully',
    };

    res.status(201).json(response);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to create user profile', 500);
  }
};

export const getUserProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const userDoc = await usersCollection.doc(req.user.uid).get();

    if (!userDoc.exists) {
      throw new AppError('User profile not found', 404);
    }

    const user: User = { id: userDoc.id, ...userDoc.data() } as User;

    const response: ApiResponse<User> = {
      success: true,
      data: user,
    };

    res.status(200).json(response);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to get user profile', 500);
  }
};

export const updateUserProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { displayName, role } = req.body;
    const updateData: Partial<User> = {
      updatedAt: new Date(),
    };

    if (displayName) updateData.displayName = displayName;
    if (role) updateData.role = role;

    await usersCollection.doc(req.user.uid).update(updateData);

    const updatedDoc = await usersCollection.doc(req.user.uid).get();
    const user: User = { id: updatedDoc.id, ...updatedDoc.data() } as User;

    const response: ApiResponse<User> = {
      success: true,
      data: user,
      message: 'User profile updated successfully',
    };

    res.status(200).json(response);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to update user profile', 500);
  }
};
