import { Router } from 'express';

// Importing all routers from the v1 directory
import authRoutes from './auth.routes.js';
import profileRoutes from './profile.routes.js';
import postRoutes from './post.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', profileRoutes);
router.use('/posts', postRoutes);

export default router;