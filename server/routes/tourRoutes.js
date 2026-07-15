import express from 'express';
import * as tourController from '../controllers/tourController.js';
const router = express.Router();

router.route('/').get(tourController.getAllTour).post(tourController.createTour);

export default router;
