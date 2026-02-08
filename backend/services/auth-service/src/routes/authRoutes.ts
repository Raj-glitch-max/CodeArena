import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '../controllers/authController';

const router = Router();

// Register
router.post('/register',
    [
        body('username').isLength({ min: 3, max: 50 }).trim(),
        body('email').isEmail().normalizeEmail(),
        body('password').isLength({ min: 8 })
    ],
    AuthController.register
);

// Login
router.post('/login',
    [
        body('username').notEmpty(),
        body('password').notEmpty()
    ],
    AuthController.login
);

// Verify token
router.get('/verify', AuthController.verify);

export default router;
