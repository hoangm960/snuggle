import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { Shelter, AuthRequest, ApiResponse } from '../types';
import { AppError } from '../middleware/errorHandler';

const sheltersCollection = db.collection('shelters');

export const getAllShelters = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const snapshot = await sheltersCollection.where('status', '==', 'active').get();
    const shelters: Shelter[] = [];

    snapshot.forEach((doc) => {
      shelters.push({ id: doc.id, ...doc.data() } as Shelter);
    });

    const response: ApiResponse<Shelter[]> = {
      success: true,
      data: shelters,
    };

    res.status(200).json(response);
  } catch (error) {
    throw new AppError('Failed to fetch shelters', 500);
  }
};

export const getShelterById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const doc = await sheltersCollection.doc(id).get();

    if (!doc.exists) {
      throw new AppError('Shelter not found', 404);
    }

    const response: ApiResponse<Shelter> = {
      success: true,
      data: { id: doc.id, ...doc.data() } as Shelter,
    };

    res.status(200).json(response);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to fetch shelter', 500);
  }
};

export const createShelter = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const shelterData: Omit<Shelter, 'id'> = {
      name: req.body.name,
      adminUserId: req.user.uid,
      address: req.body.address,
      geoPoint: req.body.geoPoint,
      contactEmail: req.body.contactEmail || req.user.email || '',
      phone: req.body.phone,
      description: req.body.description,
      photoURLs: req.body.photoURLs,
      trustScore: 0,
      totalReviews: 0,
      status: 'active',
      createdAt: new Date(),
    };

    const docRef = await sheltersCollection.add(shelterData);
    const shelter: Shelter = { id: docRef.id, ...shelterData };

    const response: ApiResponse<Shelter> = {
      success: true,
      data: shelter,
      message: 'Shelter created successfully',
    };

    res.status(201).json(response);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to create shelter', 500);
  }
};

export const updateShelter = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { id } = req.params;
    const doc = await sheltersCollection.doc(id).get();

    if (!doc.exists) {
      throw new AppError('Shelter not found', 404);
    }

    const shelterData = doc.data() as Shelter;
    if (shelterData.adminUserId !== req.user.uid) {
      throw new AppError('Not authorized to update this shelter', 403);
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date(),
    };

    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.adminUserId;
    delete updateData.trustScore;
    delete updateData.totalReviews;

    await sheltersCollection.doc(id).update(updateData);

    const updatedDoc = await sheltersCollection.doc(id).get();
    const shelter: Shelter = { id: updatedDoc.id, ...updatedDoc.data() } as Shelter;

    const response: ApiResponse<Shelter> = {
      success: true,
      data: shelter,
      message: 'Shelter updated successfully',
    };

    res.status(200).json(response);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to update shelter', 500);
  }
};

export const deleteShelter = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { id } = req.params;
    const doc = await sheltersCollection.doc(id).get();

    if (!doc.exists) {
      throw new AppError('Shelter not found', 404);
    }

    const shelterData = doc.data() as Shelter;
    if (shelterData.adminUserId !== req.user.uid) {
      throw new AppError('Not authorized to delete this shelter', 403);
    }

    await sheltersCollection.doc(id).update({ status: 'suspended' });

    const response: ApiResponse = {
      success: true,
      message: 'Shelter suspended successfully',
    };

    res.status(200).json(response);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to delete shelter', 500);
  }
};
