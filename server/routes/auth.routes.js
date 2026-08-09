import { Router } from 'express';
import { loginUser, getMe } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/login', loginUser);
router.get('/me', requireAuth, getMe);

export default router;
