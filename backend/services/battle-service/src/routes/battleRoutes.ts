import { Router } from 'express';
import { BattleController } from '../controllers/battleController';

const router = Router();

// Problem routes
router.get('/problems/random', BattleController.getRandomProblem);

// Battle routes
router.post('/battles', BattleController.createBattle);
router.get('/battles/:id', BattleController.getBattleById);
router.patch('/battles/:id/status', BattleController.updateBattleStatus);

export default router;
