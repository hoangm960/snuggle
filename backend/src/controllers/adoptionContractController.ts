import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { AdoptionContract, AuthRequest, ApiResponse } from '../types';
import { AppError } from '../middleware/errorHandler';

const contractsCollection = db.collection('adoptionContracts');
const applicationsCollection = db.collection('adoptionApplications');
const petsCollection = db.collection('pets');

export const getAllContracts = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { adopterId, shelterId } = req.query;
    let query: FirebaseFirestore.Query = contractsCollection;

    if (adopterId) {
      query = query.where('adopterId', '==', adopterId);
    }

    const snapshot = await query.get();
    const contracts: AdoptionContract[] = [];

    snapshot.forEach((doc) => {
      contracts.push({ id: doc.id, ...doc.data() } as AdoptionContract);
    });

    const response: ApiResponse<AdoptionContract[]> = {
      success: true,
      data: contracts,
    };

    res.status(200).json(response);
  } catch (error) {
    throw new AppError('Failed to fetch contracts', 500);
  }
};

export const getContractById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const doc = await contractsCollection.doc(id).get();

    if (!doc.exists) {
      throw new AppError('Contract not found', 404);
    }

    const response: ApiResponse<AdoptionContract> = {
      success: true,
      data: { id: doc.id, ...doc.data() } as AdoptionContract,
    };

    res.status(200).json(response);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to fetch contract', 500);
  }
};

export const createContract = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { applicationId } = req.body;

    const appDoc = await applicationsCollection.doc(applicationId).get();
    if (!appDoc.exists) {
      throw new AppError('Application not found', 404);
    }

    const appData = appDoc.data();
    if (appData?.status !== 'approved') {
      throw new AppError('Application must be approved before creating contract', 400);
    }

    const contractData: Omit<AdoptionContract, 'id'> = {
      applicationId,
      petId: appData?.petId,
      adopterId: appData?.adopterId,
      status: 'draft',
      createdAt: new Date(),
    };

    const docRef = await contractsCollection.add(contractData);
    const contract: AdoptionContract = { id: docRef.id, ...contractData };

    await petsCollection.doc(appData?.petId).update({ contractId: docRef.id });

    const response: ApiResponse<AdoptionContract> = {
      success: true,
      data: contract,
      message: 'Contract created successfully',
    };

    res.status(201).json(response);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to create contract', 500);
  }
};

export const signContract = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { id } = req.params;
    const { role, contractFileURL, contractHash } = req.body;

    const doc = await contractsCollection.doc(id).get();
    if (!doc.exists) {
      throw new AppError('Contract not found', 404);
    }

    const contractData = doc.data() as AdoptionContract;
    const updateData: Partial<AdoptionContract> = {};

    if (role === 'adopter') {
      if (contractData.adopterId !== req.user.uid) {
        throw new AppError('Not authorized to sign as adopter', 403);
      }
      updateData.adopterSignedAt = new Date();
    } else if (role === 'shelter') {
      updateData.shelterSignedAt = new Date();
    }

    if (contractFileURL) updateData.contractFileURL = contractFileURL;
    if (contractHash) updateData.contractHash = contractHash;

    if (contractData.adopterSignedAt && updateData.shelterSignedAt) {
      updateData.status = 'signed';
    }

    await contractsCollection.doc(id).update(updateData);

    const updatedDoc = await contractsCollection.doc(id).get();
    const contract: AdoptionContract = { id: updatedDoc.id, ...updatedDoc.data() } as AdoptionContract;

    const response: ApiResponse<AdoptionContract> = {
      success: true,
      data: contract,
      message: 'Contract signed successfully',
    };

    res.status(200).json(response);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to sign contract', 500);
  }
};

export const archiveContract = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { id } = req.params;

    await contractsCollection.doc(id).update({ status: 'archived' });

    const response: ApiResponse = {
      success: true,
      message: 'Contract archived successfully',
    };

    res.status(200).json(response);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to archive contract', 500);
  }
};
