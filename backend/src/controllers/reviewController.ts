import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { Review, AuthRequest, ApiResponse } from '../types';
import { AppError } from '../middleware/errorHandler';

const getReviewsCollection = (shelterId: string) => 
  db.collection('shelters').doc(shelterId).collection('reviews');

export const getShelterReviews = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { shelterId } = req.params;
    const { status } = req.query;
    
    let query: FirebaseFirestore.Query = getReviewsCollection(shelterId);
    
    if (status) {
      query = query.where('status', '==', status);
    }

    const snapshot = await query.orderBy('createdAt', 'desc').get();
    const reviews: Review[] = [];

    snapshot.forEach((doc) => {
      reviews.push({ id: doc.id, shelterId, ...doc.data() } as Review);
    });

    const response: ApiResponse<Review[]> = {
      success: true,
      data: reviews,
    };

    res.status(200).json(response);
  } catch (error) {
    throw new AppError('Failed to fetch reviews', 500);
  }
};

export const createReview = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { shelterId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      throw new AppError('Rating must be between 1 and 5', 400);
    }

    const reviewData: Omit<Review, 'id'> = {
      shelterId,
      reviewerId: req.user.uid,
      rating,
      comment,
      status: 'pending',
      createdAt: new Date(),
    };

    const docRef = await getReviewsCollection(shelterId).add(reviewData);
    const review: Review = { id: docRef.id, ...reviewData };

    const response: ApiResponse<Review> = {
      success: true,
      data: review,
      message: 'Review submitted successfully',
    };

    res.status(201).json(response);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to create review', 500);
  }
};

export const updateReviewStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { shelterId, id } = req.params;
    const { status } = req.body;

    if (!['approved', 'removed'].includes(status)) {
      throw new AppError('Invalid status', 400);
    }

    const doc = await getReviewsCollection(shelterId).doc(id).get();
    if (!doc.exists) {
      throw new AppError('Review not found', 404);
    }

    await getReviewsCollection(shelterId).doc(id).update({ status });

    if (status === 'approved') {
      await updateShelterTrustScore(shelterId);
    }

    const updatedDoc = await getReviewsCollection(shelterId).doc(id).get();
    const review: Review = { id: updatedDoc.id, ...updatedDoc.data() } as Review;

    const response: ApiResponse<Review> = {
      success: true,
      data: review,
      message: `Review ${status} successfully`,
    };

    res.status(200).json(response);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to update review', 500);
  }
};

async function updateShelterTrustScore(shelterId: string): Promise<void> {
  const snapshot = await getReviewsCollection(shelterId)
    .where('status', '==', 'approved')
    .get();

  let totalRating = 0;
  let count = 0;

  snapshot.forEach((doc) => {
    const data = doc.data();
    totalRating += data.rating;
    count++;
  });

  const trustScore = count > 0 ? totalRating / count : 0;

  await db.collection('shelters').doc(shelterId).update({
    trustScore: Math.round(trustScore * 10) / 10,
    totalReviews: count,
  });
}
