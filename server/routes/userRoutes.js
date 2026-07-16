import express from 'express';
import * as authController from '../controllers/authController.js';
import * as userController from '../controllers/userController.js';
const router = express.Router();

// Public routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// Protect routes
router.use(authController.protect);
router.get('/me', userController.getMe, userController.getUser);

// Only admin routes
router.use(authController.restrictTo('admin'));
router.route('/').get(userController.getAllUsers);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);


export default router;
