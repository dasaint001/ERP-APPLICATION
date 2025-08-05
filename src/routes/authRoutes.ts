import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authMiddleware } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbacMiddleware';
import { UserRole } from '../entity/User';

const router = Router();

// Endpoint for the VERY FIRST admin registration
router.post('/initial-admin', AuthController.createFirstAdmin);

router.post('/register', authMiddleware, authorize([UserRole.ADMIN]), AuthController.register);

// Team members login
router.post('/login', AuthController.login);

// Get authenticated user's profile
router.get('/me', authMiddleware, AuthController.getMe);

export default router;
