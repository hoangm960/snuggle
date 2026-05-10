import { Router } from "express";
import {
	register,
	login,
	googleSignIn,
	facebookSignIn,
	createUserProfile,
	verifyToken,
	getUserProfile,
	updateUserProfile,
	deleteUserAccount,
	resendVerification,
	verifyEmail,
	changePassword,
	updateNotificationPrefs,
	updateAppearance,
	uploadAvatar,
} from "../controllers/authController";
import { authenticate } from "../middleware/auth";
import { asyncHandler } from "../middleware/asyncHandler";
import { validate } from "../middleware/validate";
import { upload } from "../middleware/upload";
import {
	registerSchema,
	loginSchema,
	googleSignInSchema,
	facebookSignInSchema,
	resendVerificationSchema,
	verifyEmailSchema,
	updateUserProfileSchema,
	changePasswordSchema,
	updateNotificationPrefsSchema,
	updateAppearanceSchema,
} from "../utils/validators/authValidator";

const router = Router();

router.post("/register", validate(registerSchema), asyncHandler(register));
router.post("/login", validate(loginSchema), asyncHandler(login));
router.post("/google", validate(googleSignInSchema), asyncHandler(googleSignIn));
router.post("/facebook", validate(facebookSignInSchema), asyncHandler(facebookSignIn));
router.post(
	"/resend-verification",
	validate(resendVerificationSchema),
	asyncHandler(resendVerification)
);
router.post("/verify-email", validate(verifyEmailSchema), asyncHandler(verifyEmail));
router.post("/profile", authenticate, asyncHandler(createUserProfile));
router.get("/me", authenticate, asyncHandler(verifyToken));
router.get("/profile", authenticate, asyncHandler(getUserProfile));
router.put(
	"/profile",
	authenticate,
	validate(updateUserProfileSchema),
	asyncHandler(updateUserProfile)
);
router.put(
	"/password",
	authenticate,
	validate(changePasswordSchema),
	asyncHandler(changePassword)
);
router.put(
	"/notifications",
	authenticate,
	validate(updateNotificationPrefsSchema),
	asyncHandler(updateNotificationPrefs)
);
router.put(
	"/appearance",
	authenticate,
	validate(updateAppearanceSchema),
	asyncHandler(updateAppearance)
);
router.post(
	"/avatar",
	authenticate,
	upload.single("avatar"),
	asyncHandler(uploadAvatar)
);
router.delete("/account", authenticate, asyncHandler(deleteUserAccount));

export default router;
