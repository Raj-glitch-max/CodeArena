import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { authenticateSocket, AuthenticatedSocket } from './middleware/auth';
import { setupMatchmakingHandlers } from './handlers/matchmaking';
import { setupBattleHandlers } from './handlers/battle';
import { subscriber } from './utils/redis';

dotenv.config();

const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Prometheus Metrics
import client from 'prom-client';
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Create HTTP server with health check listener
const httpServer = createServer(async (req, res) => {
    if (req.url === '/health' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }));
    } else if (req.url === '/metrics' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': register.contentType });
        res.end(await register.metrics());
    } else {
        res.writeHead(404);
        res.end();
    }
});

// Create Socket.IO server
const io = new Server(httpServer, {
    cors: {
        origin: CLIENT_URL,
        credentials: true,
        methods: ['GET', 'POST']
    },
    transports: ['websocket', 'polling']
});

// Authentication middleware
io.use(authenticateSocket);

// Connection handler
io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`✅ User connected: ${socket.username} (${socket.id})`);

    // Setup event handlers
    setupMatchmakingHandlers(io, socket);
    setupBattleHandlers(io, socket);

    // Disconnect handler
    socket.on('disconnect', (reason) => {
        console.log(`❌ User disconnected: ${socket.username} - ${reason}`);
    });

    // Error handler
    socket.on('error', (error) => {
        console.error(`❌ Socket error for ${socket.username}:`, error);
    });
});

// Redis pub/sub for horizontal scaling
subscriber.subscribe('battle:events');

subscriber.on('message', (channel, message) => {
    try {
        const event = JSON.parse(message);

        // Broadcast event to appropriate room
        if (event.battleId) {
            io.to(event.battleId).emit(event.type, event.data);
        } else {
            io.emit(event.type, event.data);
        }
    } catch (error) {
        console.error('Redis message error:', error);
    }
});

// Start server
httpServer.listen(PORT, () => {
    console.log(`🚀 WebSocket server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, closing server...');
    httpServer.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
