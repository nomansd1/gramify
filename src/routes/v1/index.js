import { Router } from 'express';

// Importing all routers from the v1 directory
import authRoutes from './auth.routes.js';
import profileRoutes from './profile.routes.js';
import postRoutes from './post.routes.js';
import followRoutes from './follow.routes.js';
import commentRoutes from './comment.routes.js';
import messageRoutes from './message.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', profileRoutes);
router.use('/posts', postRoutes);
router.use('/follow', followRoutes);
router.use('/posts', commentRoutes);
router.use('/messages', messageRoutes);

export default router;