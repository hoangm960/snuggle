import { Router } from "express";
import {
	getUserChats,
	getChatById,
	getMessages,
	createChat,
	createSupportChat,
	getSupportChatStatus,
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
router.get("/support/status", authenticate, asyncHandler(getSupportChatStatus));
router.post("/", authenticate, validate(createChatSchema), asyncHandler(createChat));
router.post("/support", authenticate, asyncHandler(createSupportChat));
router.post("/:id/messages", authenticate, validate(sendMessageSchema), asyncHandler(sendMessage));
router.put("/:id/messages/:messageId/read", authenticate, asyncHandler(markMessageAsRead));

export default router;