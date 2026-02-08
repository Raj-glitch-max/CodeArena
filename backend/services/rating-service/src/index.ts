import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import ratingRoutes from './routes/ratingRoutes';
import { redis } from './utils/redis';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:8081'],
    credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'rating-service' });
});

// Routes
app.use('/api', ratingRoutes);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, closing connections...');
    await redis.quit();
    process.exit(0);
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Rating service running on port ${PORT}`);
});
