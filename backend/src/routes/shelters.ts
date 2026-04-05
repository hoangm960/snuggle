import { Router } from 'express';
import {
  getAllShelters,
  getShelterById,
  createShelter,
  updateShelter,
  deleteShelter,
} from '../controllers/shelterController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', getAllShelters);
router.get('/:id', getShelterById);
router.post('/', authenticate, createShelter);
router.put('/:id', authenticate, updateShelter);
router.delete('/:id', authenticate, deleteShelter);

export default router;
