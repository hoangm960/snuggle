import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { Pet, AuthRequest, ApiResponse } from '../types';
import { AppError } from '../middleware/errorHandler';

const petsCollection = db.collection('pets');

export const getAllPets = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { species, status, shelterId } = req.query;
    
    let query: FirebaseFirestore.Query = petsCollection;

    if (species) {
      query = query.where('species', '==', species);
    }
    if (status) {
      query = query.where('status', '==', status);
    }
    if (shelterId) {
      query = query.where('shelterId', '==', shelterId);
    }

    const snapshot = await query.get();
    const pets: Pet[] = [];

    snapshot.forEach((doc) => {
      pets.push({ id: doc.id, ...doc.data() } as Pet);
    });

    const response: ApiResponse<Pet[]> = {
      success: true,
      data: pets,
    };

    res.status(200).json(response);
  } catch (error) {
    throw new AppError('Failed to fetch pets', 500);
  }
};

export const getPetById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const doc = await petsCollection.doc(id).get();

    if (!doc.exists) {
      throw new AppError('Pet not found', 404);
    }

    const response: ApiResponse<Pet> = {
      success: true,
      data: { id: doc.id, ...doc.data() } as Pet,
    };

    res.status(200).json(response);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to fetch pet', 500);
  }
};

export const createPet = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const petData: Omit<Pet, 'id'> = {
      name: req.body.name,
      species: req.body.species,
      breed: req.body.breed,
      ageMonths: req.body.ageMonths,
      size: req.body.size || 'medium',
      gender: req.body.gender,
      description: req.body.description,
      photoURLs: req.body.photoURLs,
      shelterId: req.body.shelterId || req.user.uid,
      status: 'available',
      isVaccinated: req.body.isVaccinated || false,
      isNeutered: req.body.isNeutered || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await petsCollection.add(petData);
    const pet: Pet = { id: docRef.id, ...petData };

    const response: ApiResponse<Pet> = {
      success: true,
      data: pet,
      message: 'Pet created successfully',
    };

    res.status(201).json(response);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to create pet', 500);
  }
};

export const updatePet = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { id } = req.params;
    const doc = await petsCollection.doc(id).get();

    if (!doc.exists) {
      throw new AppError('Pet not found', 404);
    }

    const petData = doc.data() as Pet;
    if (petData.shelterId !== req.user.uid) {
      throw new AppError('Not authorized to update this pet', 403);
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date(),
    };

    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.shelterId;

    await petsCollection.doc(id).update(updateData);

    const updatedDoc = await petsCollection.doc(id).get();
    const pet: Pet = { id: updatedDoc.id, ...updatedDoc.data() } as Pet;

    const response: ApiResponse<Pet> = {
      success: true,
      data: pet,
      message: 'Pet updated successfully',
    };

    res.status(200).json(response);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to update pet', 500);
  }
};

export const deletePet = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { id } = req.params;
    const doc = await petsCollection.doc(id).get();

    if (!doc.exists) {
      throw new AppError('Pet not found', 404);
    }

    const petData = doc.data() as Pet;
    if (petData.shelterId !== req.user.uid) {
      throw new AppError('Not authorized to delete this pet', 403);
    }

    await petsCollection.doc(id).delete();

    const response: ApiResponse = {
      success: true,
      message: 'Pet deleted successfully',
    };

    res.status(200).json(response);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to delete pet', 500);
  }
};
