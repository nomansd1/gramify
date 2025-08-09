import { Router } from 'express';

// Importing all routers from the v1 directory
import authRoutes from './auth/auth.routes.js';

const router = Router();

router.use('/auth', authRoutes);

export default router;