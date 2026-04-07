import { Router } from 'express';
import {
	getAllPets,
	getPetById,
	createPet,
	updatePet,
	deletePet,
} from '../controllers/petController';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import { validate } from '../middleware/validate';
import { createPetSchema, updatePetSchema, petQuerySchema } from '../utils/validators/petValidator';
import { validateQuery } from '../middleware/validate';
import {
	createHealthRecord,
	deleteHealthRecord,
	getPetHealthRecords,
} from '../controllers/healthRecordController';

const router = Router();

router.get('/', validateQuery(petQuerySchema), asyncHandler(getAllPets));
router.get('/:id', asyncHandler(getPetById));
router.post('/', authenticate, validate(createPetSchema), asyncHandler(createPet));
router.put('/:id', authenticate, validate(updatePetSchema), asyncHandler(updatePet));
router.delete('/:id', authenticate, asyncHandler(deletePet));

router.get('/:petId/health-records', getPetHealthRecords);
router.post('/:petId/health-records', authenticate, createHealthRecord);
router.delete('/:petId/health-records/:id', authenticate, deleteHealthRecord);

export default router;
