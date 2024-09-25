import { Router } from 'express';
import apiRoutes from './api/index.js';
import htmlRoutes from './htmlRoutes.js';

const router = Router();

router.use('/api', apiRoutes);  // Handles all API routes.
router.use('/', htmlRoutes);    // Handles HTML routes.

export default router;
