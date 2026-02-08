import { Server } from 'socket.io';
import { AuthenticatedSocket } from '../middleware/auth';
import { publisher, redisClient } from '../utils/redis';

export const setupMatchmakingHandlers = (io: Server, socket: AuthenticatedSocket) => {
    // Join matchmaking queue
    socket.on('matchmaking:join-queue', async (data: { mode: string; difficulty?: string }) => {
        const { mode, difficulty } = data;
        const queueKey = `queue:${mode}:${difficulty || 'any'}`;

        try {
            // Add user to queue
            await redisClient.zadd(queueKey, Date.now(), socket.userId!);

            // Store user info
            await redisClient.hset(`user:${socket.userId}`, {
                username: socket.username!,
                socketId: socket.id,
                mode,
                difficulty: difficulty || 'any',
                joinedAt: Date.now()
            });

            console.log(`👥 ${socket.username} joined ${mode} queue`);

            socket.emit('matchmaking:queue-joined', {
                position: await redisClient.zcard(queueKey),
                mode,
                difficulty
            });

            // Try to find a match
            const queueSize = await redisClient.zcard(queueKey);
            if (queueSize >= 2) {
                // Get two oldest players
                const players = await redisClient.zrange(queueKey, 0, 1);

                if (players.length === 2) {
                    const [player1Id, player2Id] = players;

                    // Remove from queue
                    await redisClient.zrem(queueKey, player1Id, player2Id);

                    // Get player info
                    const player1Info = await redisClient.hgetall(`user:${player1Id}`);
                    const player2Info = await redisClient.hgetall(`user:${player2Id}`);

                    // Create battle ID
                    const battleId = `battle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

                    // Store battle info
                    await redisClient.hset(`battle:${battleId}`, {
                        player1Id,
                        player2Id,
                        mode,
                        difficulty: difficulty || 'any',
                        status: 'countdown',
                        createdAt: Date.now()
                    });

                    // Notify both players
                    const matchData = {
                        battleId,
                        opponent: {
                            username: player2Info.username,
                            rating: 1200 // TODO: Get from database
                        },
                        mode,
                        difficulty
                    };

                    io.to(player1Info.socketId).emit('matchmaking:match-found', {
                        ...matchData,
                        opponent: { username: player2Info.username, rating: 1200 }
                    });

                    io.to(player2Info.socketId).emit('matchmaking:match-found', {
                        ...matchData,
                        opponent: { username: player1Info.username, rating: 1200 }
                    });

                    console.log(`⚔️  Match found: ${player1Info.username} vs ${player2Info.username}`);
                }
            }
        } catch (error) {
            console.error('Matchmaking error:', error);
            socket.emit('matchmaking:error', { error: 'Failed to join queue' });
        }
    });

    // Leave matchmaking queue
    socket.on('matchmaking:leave-queue', async () => {
        try {
            const userInfo = await redisClient.hgetall(`user:${socket.userId}`);
            const queueKey = `queue:${userInfo.mode}:${userInfo.difficulty || 'any'}`;

            await redisClient.zrem(queueKey, socket.userId!);
            await redisClient.del(`user:${socket.userId}`);

            socket.emit('matchmaking:queue-left');
            console.log(`👋 ${socket.username} left queue`);
        } catch (error) {
            console.error('Leave queue error:', error);
        }
    });
};
