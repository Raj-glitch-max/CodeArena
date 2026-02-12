import { Server } from 'socket.io';
import { AuthenticatedSocket } from '../middleware/auth';
import { redisClient, publisher } from '../utils/redis';
import axios from 'axios';

const BATTLE_SERVICE_URL = process.env.BATTLE_SERVICE_URL || 'http://localhost:3002';

const battleServiceClient = axios.create({
    baseURL: BATTLE_SERVICE_URL,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const setupBattleHandlers = (io: Server, socket: AuthenticatedSocket) => {
    // Join battle room
    socket.on('battle:join', async (battleId: string) => {
        try {
            // Join Socket.IO room
            socket.join(battleId);

            // Get battle info
            const battleInfo = await redisClient.hgetall(`battle:${battleId}`);

            if (!battleInfo) {
                socket.emit('battle:error', { error: 'Battle not found' });
                return;
            }

            // Notify other player
            socket.to(battleId).emit('battle:player-joined', {
                username: socket.username,
                userId: socket.userId
            });

            console.log(`⚔️  ${socket.username} joined battle ${battleId}`);

            socket.emit('battle:joined', { battleId, battleInfo });
        } catch (error) {
            console.error('Join battle error:', error);
            socket.emit('battle:error', { error: 'Failed to join battle' });
        }
    });

    // Leave battle
    socket.on('battle:leave', async (battleId: string) => {
        try {
            socket.leave(battleId);
            socket.to(battleId).emit('battle:player-left', {
                username: socket.username,
                userId: socket.userId
            });

            console.log(`👋 ${socket.username} left battle ${battleId}`);
        } catch (error) {
            console.error('Leave battle error:', error);
        }
    });

    // Player ready
    socket.on('battle:ready', async (battleId: string) => {
        try {
            const readyKey = `battle:${battleId}:ready`;
            await redisClient.sadd(readyKey, socket.userId!);

            const readyCount = await redisClient.scard(readyKey);

            // Notify room
            io.to(battleId).emit('battle:player-ready', {
                username: socket.username,
                userId: socket.userId,
                readyCount
            });

            // If both players ready, start battle
            if (readyCount === 2) {
                await redisClient.hset(`battle:${battleId}`, 'status', 'active');

                io.to(battleId).emit('battle:start', {
                    battleId,
                    startTime: Date.now()
                });

                console.log(`🔥 Battle ${battleId} started`);
            }
        } catch (error) {
            console.error('Ready error:', error);
        }
    });

    // Code running (notify opponent)
    socket.on('battle:code-running', (data: { battleId: string }) => {
        socket.to(data.battleId).emit('battle:opponent-running', {
            username: socket.username
        });
    });

    // Code submission
    socket.on('battle:code-submit', async (data: {
        battleId: string;
        testsPassed: number;
        testsTotal: number;
        completionTime: number;
    }) => {
        try {
            const { battleId, testsPassed, testsTotal, completionTime } = data;

            // Store submission
            await redisClient.hset(`battle:${battleId}:submission:${socket.userId}`, {
                testsPassed,
                testsTotal,
                completionTime,
                submittedAt: Date.now()
            });

            // Notify opponent
            socket.to(battleId).emit('battle:opponent-submitted', {
                username: socket.username,
                testsPassed,
                testsTotal
            });

            // Check if battle is complete
            const player1Submission = await redisClient.hgetall(`battle:${battleId}:submission:player1`);
            const player2Submission = await redisClient.hgetall(`battle:${battleId}:submission:player2`);

            if (player1Submission && player2Submission) {
                // Both submitted, determine winner
                const p1Score = parseInt(player1Submission.testsPassed);
                const p2Score = parseInt(player2Submission.testsPassed);

                let winner;
                if (p1Score > p2Score) {
                    winner = 'player1';
                } else if (p2Score > p1Score) {
                    winner = 'player2';
                } else {
                    // Tie-breaker: completion time
                    const p1Time = parseInt(player1Submission.completionTime);
                    const p2Time = parseInt(player2Submission.completionTime);
                    winner = p1Time < p2Time ? 'player1' : 'player2';
                }

                // Update battle status in Redis
                await redisClient.hset(`battle:${battleId}`, {
                    status: 'completed',
                    winner,
                    completedAt: Date.now()
                });

                // Get battle info to identify players
                const battleInfo = await redisClient.hgetall(`battle:${battleId}`);

                // Persist to Database via Battle Service
                if (battleInfo && battleInfo.player1Id && battleInfo.player2Id) {
                    try {
                        const winnerId = winner === 'player1' ? battleInfo.player1Id : battleInfo.player2Id;

                        await battleServiceClient.patch(`/api/battles/${battleId}/status`, {
                            status: 'completed',
                            winnerId
                        });
                        console.log(`✅ Persisted battle ${battleId} results to database`);
                    } catch (err) {
                        console.error('Failed to persist battle results:', err);
                    }
                }

                // Notify both players
                io.to(battleId).emit('battle:completed', {
                    winner,
                    results: {
                        player1: player1Submission,
                        player2: player2Submission
                    }
                });

                console.log(`🏆 Battle ${battleId} completed - Winner: ${winner}`);
            }
        } catch (error) {
            console.error('Submit error:', error);
            socket.emit('battle:error', { error: 'Failed to submit code' });
        }
    });

    // Chat message
    socket.on('battle:chat', (data: { battleId: string; message: string }) => {
        const { battleId, message } = data;

        io.to(battleId).emit('battle:chat-message', {
            username: socket.username,
            message,
            timestamp: Date.now()
        });
    });
};
