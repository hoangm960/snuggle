import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { getActiveQuestions, getMatches } from "../controllers/quizController";

const router = Router();

router.get("/questions", asyncHandler(getActiveQuestions));
router.post("/match", asyncHandler(getMatches));

export default router;
