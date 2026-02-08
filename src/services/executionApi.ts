import axios from 'axios';

const executionApi = axios.create({
    baseURL: 'http://localhost:3003/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

export interface ExecutionResult {
    success: boolean;
    output?: string;
    error?: string;
    executionTime: number;
}

export interface TestCase {
    input: string;
    output: string;
}

export interface JobSubmission {
    code: string;
    language: string;
    testCases: TestCase[];
    battleId?: string;
    userId?: string;
}

export interface JobStatus {
    jobId: string;
    status: 'pending' | 'queued' | 'completed';
    result?: {
        totalTests: number;
        passedTests: number;
        results: Array<{
            passed: boolean;
            expected: string;
            actual: string;
            error?: string;
        }>;
    };
    createdAt: number;
    completedAt?: number;
}

// Run code immediately (for testing)
export const runCode = async (
    code: string,
    language: string,
    input: string = ''
): Promise<ExecutionResult> => {
    const response = await executionApi.post('/run', {
        code,
        language,
        input
    });
    return response.data;
};

// Submit code for async execution with test cases
export const submitCode = async (
    submission: JobSubmission
): Promise<{ jobId: string; status: string; message: string }> => {
    const response = await executionApi.post('/execute', submission);
    return response.data;
};

// Get job status
export const getJobStatus = async (jobId: string): Promise<JobStatus> => {
    const response = await executionApi.get(`/jobs/${jobId}`);
    return response.data;
};

export default executionApi;
