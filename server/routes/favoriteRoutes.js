import express from 'express';
import * as authController from '../controllers/authController.js';
import * as favoriteController from '../controllers/favoriteController.js';

const router = express.Router();

router.use(authController.protect);
router.get('/ids', favoriteController.getFavoriteIds);
router.get('/', favoriteController.getFavorites);
router.post('/:tourId', favoriteController.addFavorite);
router.delete('/:tourId', favoriteController.deleteFavorite);

export default router;
