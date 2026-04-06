import { Router } from 'express';
import {
	getAllShelters,
	getShelterById,
	createShelter,
	updateShelter,
	deleteShelter,
} from '../controllers/shelterController';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import { validate } from '../middleware/validate';
import { createShelterSchema, updateShelterSchema } from '../utils/validators/otherValidator';

const router = Router();

router.get('/', asyncHandler(getAllShelters));
router.get('/:id', asyncHandler(getShelterById));
router.post('/', authenticate, validate(createShelterSchema), asyncHandler(createShelter));
router.put('/:id', authenticate, validate(updateShelterSchema), asyncHandler(updateShelter));
router.delete('/:id', authenticate, asyncHandler(deleteShelter));

export default router;
