import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { validationResult } from 'express-validator';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = '7d';

export class AuthController {
    // Register new user
    static async register(req: Request, res: Response) {
        try {
            // Validate input
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { username, email, password } = req.body;

            // Check if user exists
            const existingUser = await prisma.user.findFirst({
                where: {
                    OR: [{ username }, { email }]
                }
            });

            if (existingUser) {
                return res.status(409).json({
                    error: 'Username or email already exists'
                });
            }

            // Hash password
            const passwordHash = await bcrypt.hash(password, 12);

            // Create user
            const user = await prisma.user.create({
                data: {
                    username,
                    email,
                    passwordHash,
                    rating: 1200,
                    rank: 'bronze'
                },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    rating: true,
                    rank: true,
                    avatarUrl: true,
                    wins: true,
                    losses: true,
                    createdAt: true
                }
            });

            // Generate JWT
            const token = jwt.sign(
                {
                    userId: user.id,
                    username: user.username
                },
                JWT_SECRET,
                { expiresIn: JWT_EXPIRES_IN }
            );

            res.status(201).json({
                user,
                token
            });
        } catch (error) {
            console.error('Register error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // Login user
    static async login(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { username, password } = req.body;

            // Find user (allow login with email or username)
            const user = await prisma.user.findFirst({
                where: {
                    OR: [
                        { username },
                        { email: username }
                    ]
                }
            });

            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Verify password
            const isValidPassword = await bcrypt.compare(password, user.passwordHash);
            if (!isValidPassword) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Update last login
            await prisma.user.update({
                where: { id: user.id },
                data: { lastLoginAt: new Date() }
            });

            // Generate JWT
            const token = jwt.sign(
                {
                    userId: user.id,
                    username: user.username
                },
                JWT_SECRET,
                { expiresIn: JWT_EXPIRES_IN }
            );

            res.json({
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    rating: user.rating,
                    rank: user.rank,
                    avatarUrl: user.avatarUrl,
                    wins: user.wins,
                    losses: user.losses
                },
                token
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // Verify token
    static async verify(req: Request, res: Response) {
        try {
            const token = req.headers.authorization?.split(' ')[1];

            if (!token) {
                return res.status(401).json({ error: 'No token provided' });
            }

            const decoded = jwt.verify(token, JWT_SECRET) as any;

            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    rating: true,
                    rank: true,
                    avatarUrl: true,
                    wins: true,
                    losses: true
                }
            });

            if (!user) {
                return res.status(401).json({ error: 'User not found' });
            }

            res.json({ user });
        } catch (error) {
            res.status(401).json({ error: 'Invalid token' });
        }
    }
}
