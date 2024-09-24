import { Router } from 'express';
const router = Router();

import weatherRoutes from './weatherRoutes.js'; // Ensure the correct path
import htmlRoutes from '../htmlRoutes.js';      // Adjust this path as needed

router.use('/api/weather', weatherRoutes);
router.use('/', htmlRoutes);

export default router;
