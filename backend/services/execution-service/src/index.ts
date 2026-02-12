import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import executionRoutes from './routes/executionRoutes';
import { connectRabbitMQ } from './utils/rabbitmq';
import { startWorker } from './workers/executionWorker';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:8081'],
    credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'execution-service' });
});

// Routes
app.use('/api', executionRoutes);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
async function start() {
    try {
        // Connect to RabbitMQ
        await connectRabbitMQ();

        // Start the execution worker in the background
        startWorker();

        app.listen(PORT, () => {
            console.log(`✅ Execution service running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

start();
