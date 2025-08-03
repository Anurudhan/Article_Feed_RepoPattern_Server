import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateUser } from '../utils/middleware/authMiddleware';

const router = Router();
const authController = new AuthController(); 

router.post('/login', authController.login.bind(authController)); 
router.delete('/logout', authenticateUser, authController.logout.bind(authController));
router.post('/signup', authController.signup.bind(authController));
router.route('/')
  .get(authenticateUser, authController.getUser.bind(authController))
router.patch('/profile', authenticateUser, authController.updateProfile.bind(authController));
router.patch('/password', authenticateUser, authController.updatePassword.bind(authController));
router.patch('/preferences', authenticateUser, authController.updatePreferences.bind(authController));

export default router;
