import { Request, Response } from 'express';
import { publishJob } from '../utils/rabbitmq';
import { v4 as uuidv4 } from 'uuid';

// Store pending jobs (in production, use Redis)
const pendingJobs = new Map<string, any>();

export class ExecutionController {
    // Submit code for execution
    static async submitCode(req: Request, res: Response) {
        try {
            const { code, language, testCases, battleId, userId } = req.body;

            if (!code || !language || !testCases) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            if (!['python', 'javascript'].includes(language.toLowerCase())) {
                return res.status(400).json({ error: 'Unsupported language' });
            }

            const jobId = uuidv4();

            const jobData = {
                jobId,
                code,
                language: language.toLowerCase(),
                testCases,
                battleId,
                userId,
                createdAt: Date.now()
            };

            // Store job status
            pendingJobs.set(jobId, {
                status: 'pending',
                createdAt: Date.now()
            });

            // Publish to queue
            await publishJob(jobData);

            res.status(202).json({
                jobId,
                status: 'queued',
                message: 'Code submitted for execution'
            });
        } catch (error) {
            console.error('Submit code error:', error);
            res.status(500).json({ error: 'Failed to submit code' });
        }
    }

    // Get job status
    static getJobStatus(req: Request, res: Response) {
        try {
            const jobId = req.params.jobId as string;

            const job = pendingJobs.get(jobId);
            if (!job) {
                return res.status(404).json({ error: 'Job not found' });
            }

            res.json({
                jobId,
                status: job.status,
                result: job.result,
                createdAt: job.createdAt,
                completedAt: job.completedAt
            });
        } catch (error) {
            console.error('Get job status error:', error);
            res.status(500).json({ error: 'Failed to get job status' });
        }
    }

    // Update job result (called by worker via HTTP)
    static updateJobResult(req: Request, res: Response) {
        try {
            const jobId = req.params.jobId as string;
            const result = req.body;

            const job = pendingJobs.get(jobId);
            if (!job) {
                return res.status(404).json({ error: 'Job not found' });
            }

            pendingJobs.set(jobId, {
                ...job,
                status: 'completed',
                result,
                completedAt: Date.now()
            });

            console.log(`✅ Job ${jobId} marked as completed`);
            res.json({ success: true, message: 'Job updated' });
        } catch (error) {
            console.error('Update job error:', error);
            res.status(500).json({ error: 'Failed to update job' });
        }
    }

    // Run code immediately (for testing)
    static async runCode(req: Request, res: Response) {
        try {
            const { code, language, input = '' } = req.body;

            if (!code || !language) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            const { CodeRunner } = await import('../utils/codeRunner');

            // Detect if this is LeetCode-style code
            const isLeetCodeStyle = code.includes('class Solution') ||
                code.includes('var twoSum') ||
                code.includes('function twoSum') ||
                code.includes('def twoSum');

            let codeToRun = code;

            // Wrap LeetCode-style code with test harness
            if (isLeetCodeStyle && input) {
                if (language === 'python') {
                    codeToRun = CodeRunner.wrapPythonSolution(code, input);
                } else if (language === 'javascript') {
                    codeToRun = CodeRunner.wrapJavaScriptSolution(code, input);
                }
            }

            let result;
            if (language === 'python') {
                result = await CodeRunner.runPython(codeToRun, input);
            } else if (language === 'javascript') {
                result = await CodeRunner.runJavaScript(codeToRun, input);
            } else {
                return res.status(400).json({ error: 'Unsupported language' });
            }

            res.json(result);
        } catch (error) {
            console.error('Run code error:', error);
            res.status(500).json({ error: 'Failed to run code' });
        }
    }
}
