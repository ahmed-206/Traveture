import express from 'express';
import * as authController from '../controllers/authController.js';
import * as userController from '../controllers/userController.js';
const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.get('/logout', authController.logout);

router.get(
  '/me',
  authController.protect,
  userController.getMe,
  userController.getUser,
);

router.route('/:id').get(userController.getUser);
export default router;
