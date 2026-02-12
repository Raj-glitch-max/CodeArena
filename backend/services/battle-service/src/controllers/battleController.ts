import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class BattleController {
    // Get random problem by difficulty
    static async getRandomProblem(req: Request, res: Response) {
        try {
            const difficultyParam = req.query.difficulty;
            const difficulty = Array.isArray(difficultyParam) ? difficultyParam[0] : difficultyParam;

            const where: any = { isActive: true };
            if (difficulty && typeof difficulty === 'string' && ['easy', 'medium', 'hard'].includes(difficulty)) {
                where.difficulty = difficulty;
            }

            const count = await prisma.problem.count({ where });
            if (count === 0) {
                return res.status(404).json({ error: 'No problems found' });
            }

            const skip = Math.floor(Math.random() * count);
            const problem = await prisma.problem.findFirst({
                where,
                skip,
                include: {
                    testCases: {
                        where: { isHidden: false },
                        orderBy: { orderIndex: 'asc' }
                    }
                }
            });

            res.json({ problem });
        } catch (error) {
            console.error('Get random problem error:', error);
            res.status(500).json({ error: 'Failed to get problem' });
        }
    }

    // Create battle
    static async createBattle(req: Request, res: Response) {
        try {
            const { player1Id, player2Id, problemId, mode, difficulty } = req.body;
            let finalProblemId = problemId;

            // If no problemId provided, get a random one based on difficulty
            if (!finalProblemId) {
                const where: any = { isActive: true };
                if (difficulty && typeof difficulty === 'string' && ['easy', 'medium', 'hard'].includes(difficulty)) {
                    where.difficulty = difficulty;
                }

                const count = await prisma.problem.count({ where });
                if (count === 0) {
                    return res.status(404).json({ error: 'No problems found for difficulty' });
                }

                const skip = Math.floor(Math.random() * count);
                const problem = await prisma.problem.findFirst({
                    where,
                    skip,
                    select: { id: true }
                });

                if (problem) {
                    finalProblemId = problem.id;
                }
            }

            if (!finalProblemId) {
                return res.status(400).json({ error: 'Could not select a problem' });
            }

            const battle = await prisma.battle.create({
                data: {
                    player1Id,
                    player2Id,
                    problemId: finalProblemId,
                    mode,
                    difficulty: difficulty || null,
                    status: 'countdown'
                }
            });

            res.status(201).json({ battle });
        } catch (error) {
            console.error('Create battle error:', error);
            res.status(500).json({ error: 'Failed to create battle' });
        }
    }

    // Get battle by ID
    static async getBattleById(req: Request, res: Response) {
        try {
            const battleId = req.params.id as string;

            const battle = await prisma.battle.findUnique({
                where: { id: battleId },
                include: {
                    problem: {
                        include: {
                            testCases: {
                                where: { isHidden: false },
                                orderBy: { orderIndex: 'asc' }
                            }
                        }
                    },
                    player1: {
                        select: {
                            id: true,
                            username: true,
                            rating: true,
                            rank: true,
                            avatarUrl: true
                        }
                    },
                    player2: {
                        select: {
                            id: true,
                            username: true,
                            rating: true,
                            rank: true,
                            avatarUrl: true
                        }
                    }
                }
            });

            if (!battle) {
                return res.status(404).json({ error: 'Battle not found' });
            }

            res.json({ battle });
        } catch (error) {
            console.error('Get battle error:', error);
            res.status(500).json({ error: 'Failed to get battle' });
        }
    }

    // Update battle status
    static async updateBattleStatus(req: Request, res: Response) {
        try {
            const battleId = req.params.id as string;
            const { status, winnerId } = req.body;

            const updateData: any = { status };

            if (status === 'active') {
                updateData.startedAt = new Date();
            } else if (status === 'completed') {
                updateData.completedAt = new Date();
                if (winnerId) updateData.winnerId = winnerId;
            }

            const battle = await prisma.battle.update({
                where: { id: battleId },
                data: updateData
            });

            // Update user stats
            if (status === 'completed' && winnerId) {
                const loserId = winnerId === battle.player1Id ? battle.player2Id : battle.player1Id;

                await Promise.all([
                    prisma.user.update({
                        where: { id: winnerId },
                        data: { wins: { increment: 1 }, totalBattles: { increment: 1 } }
                    }),
                    prisma.user.update({
                        where: { id: loserId },
                        data: { losses: { increment: 1 }, totalBattles: { increment: 1 } }
                    })
                ]);
            }

            res.json({ battle });
        } catch (error) {
            console.error('Update battle error:', error);
            res.status(500).json({ error: 'Failed to update battle' });
        }
    }
}
