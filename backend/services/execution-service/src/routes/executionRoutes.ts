import { Router } from 'express';
import { ExecutionController } from '../controllers/executionController';

const router = Router();

// Submit code for execution (queued)
router.post('/execute', ExecutionController.submitCode);

// Get job status
router.get('/jobs/:jobId', ExecutionController.getJobStatus);

// Update job result (called by worker)
router.put('/jobs/:jobId/result', ExecutionController.updateJobResult);

// Run code immediately (for testing)
router.post('/run', ExecutionController.runCode);

export default router;
