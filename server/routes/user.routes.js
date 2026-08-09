import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware.js';
import { getUsers, createUser, updateUserPermissions, deleteUser } from '../controllers/user.controller.js';

const router = Router();

// All user management routes require valid authentication & Admin role
router.get('/', requireAuth, requireAdmin, getUsers);
router.post('/', requireAuth, requireAdmin, createUser);
router.patch('/:id/permissions', requireAuth, requireAdmin, updateUserPermissions);
router.delete('/:id', requireAuth, requireAdmin, deleteUser);

export default router;
