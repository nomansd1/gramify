import { Router } from "express";
// Importing v1 router
import v1Router from './v1/index.js';

const router = Router();

router.use('/v1', v1Router);

export default router;