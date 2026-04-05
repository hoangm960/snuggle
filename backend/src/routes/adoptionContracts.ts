import { Router } from 'express';
import {
  getAllContracts,
  getContractById,
  createContract,
  signContract,
  archiveContract,
} from '../controllers/adoptionContractController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getAllContracts);
router.get('/:id', getContractById);
router.post('/', authenticate, createContract);
router.put('/:id/sign', authenticate, signContract);
router.put('/:id/archive', authenticate, archiveContract);

export default router;
