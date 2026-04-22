import { Router } from "express";
import {
	getUserChats,
	getChatById,
	getMessages,
	createChat,
	sendMessage,
	markMessageAsRead,
} from "../controllers/chatController";
import { authenticate } from "../middleware/auth";
import { asyncHandler } from "../middleware/asyncHandler";
import { validate } from "../middleware/validate";
import { createChatSchema, sendMessageSchema } from "../utils/validators/chatValidator";

const router = Router();

router.get("/", authenticate, asyncHandler(getUserChats));
router.get("/:id", authenticate, asyncHandler(getChatById));
router.get("/:id/messages", authenticate, asyncHandler(getMessages));
router.post("/", authenticate, validate(createChatSchema), asyncHandler(createChat));
router.post("/:id/messages", authenticate, validate(sendMessageSchema), asyncHandler(sendMessage));
router.put("/:id/messages/:messageId/read", authenticate, asyncHandler(markMessageAsRead));

export default router;