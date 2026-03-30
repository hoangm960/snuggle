import { Router } from 'express';
import {
  getAllPets,
  getPetById,
  createPet,
  updatePet,
  deletePet,
} from '../controllers/petController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', getAllPets);
router.get('/:id', getPetById);
router.post('/', authenticate, createPet);
router.put('/:id', authenticate, updatePet);
router.delete('/:id', authenticate, deletePet);

export default router;
