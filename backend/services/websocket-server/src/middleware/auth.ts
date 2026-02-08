import jwt from 'jsonwebtoken';
import { Socket } from 'socket.io';

const JWT_SECRET = process.env.JWT_SECRET!;

export interface AuthenticatedSocket extends Socket {
    userId?: string;
    username?: string;
}

export const authenticateSocket = (socket: AuthenticatedSocket, next: (err?: Error) => void) => {
    const token = socket.handshake.auth.token;

    if (!token) {
        return next(new Error('Authentication error: No token provided'));
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; username: string };
        socket.userId = decoded.userId;
        socket.username = decoded.username;
        next();
    } catch (error) {
        next(new Error('Authentication error: Invalid token'));
    }
};
