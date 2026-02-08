import { Router } from 'express';
import { RatingController } from '../controllers/ratingController';

const router = Router();

// Update ratings after battle
router.post('/update', RatingController.updateRatings);

// Get global leaderboard
router.get('/leaderboard', RatingController.getGlobalLeaderboard);

// Get user rank
router.get('/users/:userId/rank', RatingController.getUserRank);

// Get user stats
router.get('/users/:userId/stats', RatingController.getUserStats);

export default router;
