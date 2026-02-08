import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { calculateRatingChangesWithBonus, getRank } from '../utils/eloRating';
import { redis, CACHE_KEYS, CACHE_TTL } from '../utils/redis';

const prisma = new PrismaClient();

export class RatingController {
    // Update ratings after a battle
    static async updateRatings(req: Request, res: Response) {
        try {
            const { battleId, winnerId, loserId } = req.body;

            if (!battleId || !winnerId || !loserId) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            // Get both players
            const [winner, loser] = await Promise.all([
                prisma.user.findUnique({ where: { id: winnerId } }),
                prisma.user.findUnique({ where: { id: loserId } })
            ]);

            if (!winner || !loser) {
                return res.status(404).json({ error: 'Player not found' });
            }

            // Calculate new ratings
            const {
                winnerNewRating,
                loserNewRating,
                winnerChange,
                loserChange,
                isUpset
            } = calculateRatingChangesWithBonus(winner.rating, loser.rating);

            // Determine new ranks
            const winnerNewRank = getRank(winnerNewRating);
            const loserNewRank = getRank(loserNewRating);

            // Update both players in database
            await Promise.all([
                prisma.user.update({
                    where: { id: winnerId },
                    data: {
                        rating: winnerNewRating,
                        rank: winnerNewRank,
                        wins: { increment: 1 },
                        totalBattles: { increment: 1 }
                    }
                }),
                prisma.user.update({
                    where: { id: loserId },
                    data: {
                        rating: loserNewRating,
                        rank: loserNewRank,
                        losses: { increment: 1 },
                        totalBattles: { increment: 1 }
                    }
                })
            ]);

            // Invalidate cache
            await Promise.all([
                redis.del(CACHE_KEYS.LEADERBOARD_GLOBAL),
                redis.del(CACHE_KEYS.USER_RANK(winnerId)),
                redis.del(CACHE_KEYS.USER_RANK(loserId)),
                redis.del(CACHE_KEYS.USER_STATS(winnerId)),
                redis.del(CACHE_KEYS.USER_STATS(loserId))
            ]);

            res.json({
                winner: {
                    id: winnerId,
                    oldRating: winner.rating,
                    newRating: winnerNewRating,
                    ratingChange: winnerChange,
                    oldRank: winner.rank,
                    newRank: winnerNewRank,
                    rankUp: winnerNewRank !== winner.rank
                },
                loser: {
                    id: loserId,
                    oldRating: loser.rating,
                    newRating: loserNewRating,
                    ratingChange: loserChange,
                    oldRank: loser.rank,
                    newRank: loserNewRank,
                    rankDown: loserNewRank !== loser.rank
                },
                isUpset
            });
        } catch (error) {
            console.error('Update ratings error:', error);
            res.status(500).json({ error: 'Failed to update ratings' });
        }
    }

    // Get global leaderboard
    static async getGlobalLeaderboard(req: Request, res: Response) {
        try {
            const limit = parseInt(req.query.limit as string) || 100;
            const offset = parseInt(req.query.offset as string) || 0;

            // Try cache first
            const cacheKey = `${CACHE_KEYS.LEADERBOARD_GLOBAL}:${limit}:${offset}`;
            const cached = await redis.get(cacheKey);

            if (cached) {
                return res.json(JSON.parse(cached));
            }

            // Get from database
            const users = await prisma.user.findMany({
                orderBy: [
                    { rating: 'desc' },
                    { wins: 'desc' }
                ],
                take: limit,
                skip: offset,
                select: {
                    id: true,
                    username: true,
                    rating: true,
                    rank: true,
                    wins: true,
                    losses: true,
                    totalBattles: true,
                    avatarUrl: true
                }
            });

            // Add rank position
            const leaderboard = users.map((user, index) => ({
                ...user,
                position: offset + index + 1,
                winRate: user.totalBattles > 0
                    ? ((user.wins / user.totalBattles) * 100).toFixed(1)
                    : '0.0'
            }));

            // Cache result
            await redis.setex(cacheKey, CACHE_TTL.LEADERBOARD, JSON.stringify(leaderboard));

            res.json(leaderboard);
        } catch (error) {
            console.error('Get leaderboard error:', error);
            res.status(500).json({ error: 'Failed to get leaderboard' });
        }
    }

    // Get user rank position
    static async getUserRank(req: Request, res: Response) {
        try {
            const userId = req.params.userId as string;

            // Try cache first
            const cacheKey = CACHE_KEYS.USER_RANK(userId);
            const cached = await redis.get(cacheKey);

            if (cached) {
                return res.json(JSON.parse(cached));
            }

            // Get user
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    username: true,
                    rating: true,
                    rank: true,
                    wins: true,
                    losses: true,
                    totalBattles: true
                }
            });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Count users with higher rating
            const position = await prisma.user.count({
                where: {
                    OR: [
                        { rating: { gt: user.rating } },
                        {
                            AND: [
                                { rating: user.rating },
                                { wins: { gt: user.wins } }
                            ]
                        }
                    ]
                }
            }) + 1;

            const result = {
                ...user,
                position,
                winRate: user.totalBattles > 0
                    ? ((user.wins / user.totalBattles) * 100).toFixed(1)
                    : '0.0'
            };

            // Cache result
            await redis.setex(cacheKey, CACHE_TTL.USER_RANK, JSON.stringify(result));

            res.json(result);
        } catch (error) {
            console.error('Get user rank error:', error);
            res.status(500).json({ error: 'Failed to get user rank' });
        }
    }

    // Get user stats
    static async getUserStats(req: Request, res: Response) {
        try {
            const userId = req.params.userId as string;

            // Try cache first
            const cacheKey = CACHE_KEYS.USER_STATS(userId);
            const cached = await redis.get(cacheKey);

            if (cached) {
                return res.json(JSON.parse(cached));
            }

            // Get user with battle history
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    battlesAsPlayer1: {
                        where: { status: 'completed' },
                        orderBy: { completedAt: 'desc' },
                        take: 10,
                        include: {
                            player2: {
                                select: { username: true, rating: true }
                            }
                        }
                    },
                    battlesAsPlayer2: {
                        where: { status: 'completed' },
                        orderBy: { completedAt: 'desc' },
                        take: 10,
                        include: {
                            player1: {
                                select: { username: true, rating: true }
                            }
                        }
                    }
                }
            });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Calculate stats
            const recentBattles = [
                ...user.battlesAsPlayer1,
                ...user.battlesAsPlayer2
            ]
                .sort((a, b) =>
                    new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime()
                )
                .slice(0, 10);

            const stats = {
                id: user.id,
                username: user.username,
                rating: user.rating,
                rank: user.rank,
                wins: user.wins,
                losses: user.losses,
                totalBattles: user.totalBattles,
                winRate: user.totalBattles > 0
                    ? ((user.wins / user.totalBattles) * 100).toFixed(1)
                    : '0.0',
                recentBattles: recentBattles.map(battle => {
                    const isPlayer1 = battle.player1Id === userId;
                    const opponent = isPlayer1
                        ? (battle as any).player2?.username
                        : (battle as any).player1?.username;

                    return {
                        id: battle.id,
                        won: battle.winnerId === userId,
                        opponent,
                        completedAt: battle.completedAt
                    };
                })
            };

            // Cache result
            await redis.setex(cacheKey, CACHE_TTL.USER_STATS, JSON.stringify(stats));

            res.json(stats);
        } catch (error) {
            console.error('Get user stats error:', error);
            res.status(500).json({ error: 'Failed to get user stats' });
        }
    }
}
