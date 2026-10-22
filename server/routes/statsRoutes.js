import express from 'express';
import * as authController from '../controllers/authController.js';
import * as statsController from '../controllers/statsController.js';

const router = express.Router();


router.use(authController.protect, authController.restrictTo('admin'));

router.get('/dashboard', statsController.getDashboardStats);

export default router;