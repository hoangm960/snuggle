import { useState, useEffect } from "react";
import api from "@/lib/api";
import type { QuizQuestion, QuizMatch } from "@/types";

interface UseQuizReturn {
	questions: QuizQuestion[];
	loading: boolean;
	matching: boolean;
	matches: QuizMatch[] | null;
	submitAnswers: (answers: Record<string, string>) => Promise<void>;
	reset: () => void;
}

export const useQuiz = (): UseQuizReturn => {
	const [questions, setQuestions] = useState<QuizQuestion[]>([]);
	const [loading, setLoading] = useState(false);
	const [matching, setMatching] = useState(false);
	const [matches, setMatches] = useState<QuizMatch[] | null>(null);

	useEffect(() => {
		const fetch = async () => {
			setLoading(true);
			try {
				const res = await api.get("/quiz/questions");
				setQuestions(res.data.data || []);
			} catch {
				// silently fail — admin may not have set up questions yet
			} finally {
				setLoading(false);
			}
		};
		fetch();
	}, []);

	const submitAnswers = async (answers: Record<string, string>) => {
		setMatching(true);
		try {
			const res = await api.post("/quiz/match", { answers });
			setMatches(res.data.data || []);
		} catch {
			setMatches([]);
		} finally {
			setMatching(false);
		}
	};

	const reset = () => {
		setMatches(null);
	};

	return { questions, loading, matching, matches, submitAnswers, reset };
};
