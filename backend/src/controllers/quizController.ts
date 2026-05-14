import { Request, Response } from "express";
import { db } from "../config/firebase";
import { AuthRequest, QuizQuestion, Pet, ApiResponse } from "../types";
import { AppError } from "../middleware/errorHandler";
import { errorLogger } from "../utils/logger";

export const getActiveQuestions = async (_req: Request, res: Response): Promise<void> => {
	try {
		const snapshot = await db.collection("quizQuestions").orderBy("order", "asc").get();

		const questions: QuizQuestion[] = snapshot.docs
			.map((doc) => ({ id: doc.id, ...doc.data() }) as QuizQuestion)
			.filter((q) => q.isActive);

		res.status(200).json({ success: true, data: questions });
	} catch (err) {
		errorLogger.error({ message: (err as Error).message });
		res.status(500).json({ success: false, error: "Failed to fetch quiz questions" });
	}
};

export const getMatches = async (req: Request, res: Response): Promise<void> => {
	try {
		const answers: Record<string, string> = req.body.answers;

		if (!answers || typeof answers !== "object") {
			throw new AppError("Answers are required", 400);
		}

		const questionIds = Object.keys(answers);
		if (questionIds.length === 0) {
			throw new AppError("At least one answer is required", 400);
		}

		// Fetch questions for the answered IDs
		const questionDocs = await Promise.all(
			questionIds.map((id) => db.collection("quizQuestions").doc(id).get())
		);
		const questions: QuizQuestion[] = questionDocs
			.filter((d) => d.exists)
			.map((d) => ({ id: d.id, ...d.data() }) as QuizQuestion);

		// Compute max possible score and per-question weights
		let maxTotal = 0;
		const questionWeights: { species: Record<string, number>; size: Record<string, number> }[] =
			[];

		for (const question of questions) {
			const answerValue = answers[question.id!];
			const option = question.options.find((o) => o.value === answerValue);
			if (!option) continue;

			const speciesWeights = option.weights.species || {};
			const sizeWeights = option.weights.size || {};

			const maxSpecies = Math.max(0, ...Object.values(speciesWeights).map(Number));
			const maxSize = Math.max(0, ...Object.values(sizeWeights).map(Number));
			maxTotal += maxSpecies + maxSize;

			questionWeights.push({
				species: speciesWeights as Record<string, number>,
				size: sizeWeights as Record<string, number>,
			});
		}

		// Fetch all available pets
		const petsSnapshot = await db.collection("pets").where("status", "==", "available").get();

		const pets: Pet[] = petsSnapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		})) as Pet[];

		// Score each pet
		const scored = pets.map((pet) => {
			let score = 0;
			for (const weights of questionWeights) {
				score += weights.species[pet.species] || 0;
				score += weights.size[pet.size] || 0;
			}
			const pct = maxTotal > 0 ? Math.round((score / maxTotal) * 100) : 50;
			return {
				pet: {
					id: pet.id,
					name: pet.name,
					species: pet.species,
					breed: pet.breed,
					ageMonths: pet.ageMonths,
					size: pet.size,
					gender: pet.gender,
					thumbnail: pet.thumbnail,
					description: pet.description,
					status: pet.status,
				},
				pct,
			};
		});

		scored.sort((a, b) => b.pct - a.pct);

		const response: ApiResponse = { success: true, data: scored.slice(0, 6) };
		res.status(200).json(response);
	} catch (error) {
		if (error instanceof AppError) throw error;
		errorLogger.error({ message: (error as Error).message });
		throw new AppError("Failed to calculate matches", 500);
	}
};

// Admin handlers

export const getAllQuestions = async (_req: AuthRequest, res: Response): Promise<void> => {
	try {
		const snapshot = await db.collection("quizQuestions").orderBy("order", "asc").get();
		const questions: QuizQuestion[] = snapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		})) as QuizQuestion[];
		res.status(200).json({ success: true, data: questions });
	} catch (err) {
		errorLogger.error({ message: (err as Error).message });
		res.status(500).json({ success: false, error: "Failed to fetch questions" });
	}
};

export const createQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		const { category, question, options, isActive, order } = req.body;

		if (!category || !question || !options || !Array.isArray(options)) {
			throw new AppError("Missing required fields", 400);
		}

		// Determine next order if not provided
		let resolvedOrder = order;
		if (resolvedOrder === undefined) {
			const snapshot = await db
				.collection("quizQuestions")
				.orderBy("order", "desc")
				.limit(1)
				.get();
			resolvedOrder = snapshot.empty ? 0 : (snapshot.docs[0].data().order || 0) + 1;
		}

		const data: Omit<QuizQuestion, "id"> = {
			order: resolvedOrder,
			category,
			question,
			options,
			isActive: isActive !== false,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		const ref = await db.collection("quizQuestions").add(data);
		res.status(201).json({ success: true, data: { id: ref.id, ...data } });
	} catch (error) {
		if (error instanceof AppError) throw error;
		throw new AppError("Failed to create question", 500);
	}
};

export const updateQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		const { id } = req.params;
		const updates = { ...req.body, updatedAt: new Date() };
		delete updates.id;

		await db.collection("quizQuestions").doc(id).update(updates);
		const doc = await db.collection("quizQuestions").doc(id).get();
		res.status(200).json({ success: true, data: { id: doc.id, ...doc.data() } });
	} catch (error) {
		if (error instanceof AppError) throw error;
		throw new AppError("Failed to update question", 500);
	}
};

export const deleteQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		const { id } = req.params;
		await db.collection("quizQuestions").doc(id).delete();
		res.status(200).json({ success: true, message: "Question deleted" });
	} catch (error) {
		if (error instanceof AppError) throw error;
		throw new AppError("Failed to delete question", 500);
	}
};
