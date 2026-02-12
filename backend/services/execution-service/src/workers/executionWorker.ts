import { consumeJobs, connectRabbitMQ } from '../utils/rabbitmq';
import { CodeRunner } from '../utils/codeRunner';
import { ExecutionController } from '../controllers/executionController';

export async function startWorker() {
    try {
        await connectRabbitMQ();

        await consumeJobs(async (job) => {
            const { jobId, code, language, testCases, battleId, userId } = job;

            console.log(`⚙️  Processing job ${jobId} (${language})`);

            try {
                // Run code against test cases
                const result = await CodeRunner.runTestCases(code, language, testCases);

                // Update job result via HTTP
                const axios = require('axios');
                const API_URL = process.env.EXECUTION_API_URL || 'http://localhost:3003';
                await axios.put(`${API_URL}/api/jobs/${jobId}/result`, {
                    ...result,
                    battleId,
                    userId
                });

                console.log(`✅ Job ${jobId}: ${result.passedTests}/${result.totalTests} tests passed`);
            } catch (error) {
                console.error(`❌ Job ${jobId} failed:`, error);
            }
        });
    } catch (error) {
        console.error('Worker error:', error);
        process.exit(1);
    }
}

// Start worker if run directly
if (require.main === module) {
    console.log('🚀 Starting execution worker...');
    startWorker();
}
