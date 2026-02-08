// Sandboxed code execution service for battle arena using real backend API

import { runCode, submitCode as submitToExecutionService, getJobStatus } from '@/services/executionApi';

export interface TestCase {
  input: string;
  expectedOutput: string;
  description?: string;
}

export interface ExecutionResult {
  passed: boolean;
  output: string;
  expectedOutput: string;
  executionTime: number;
  error?: string;
}

export interface SubmissionResult {
  allPassed: boolean;
  results: ExecutionResult[];
  totalTime: number;
  passedCount: number;
  totalCount: number;
}

// Problem test cases database - JSON format for test harness
const problemTestCases: Record<string, TestCase[]> = {
  "Two Sum": [
    { input: '{"nums": [2,7,11,15], "target": 9}', expectedOutput: "[0,1]", description: "Basic case" },
    { input: '{"nums": [3,2,4], "target": 6}', expectedOutput: "[1,2]", description: "Non-adjacent elements" },
    { input: '{"nums": [3,3], "target": 6}', expectedOutput: "[0,1]", description: "Same element value" },
    { input: '{"nums": [1,2,3,4,5], "target": 9}', expectedOutput: "[3,4]", description: "Last two elements" },
    { input: '{"nums": [-1,-2,-3,-4,-5], "target": -8}', expectedOutput: "[2,4]", description: "Negative numbers" },
  ],
  "3Sum": [
    { input: '{"nums": [-1,0,1,2,-1,-4]}', expectedOutput: "[[-1,-1,2],[-1,0,1]]", description: "Multiple triplets" },
    { input: '{"nums": [0,1,1]}', expectedOutput: "[]", description: "No valid triplet" },
    { input: '{"nums": [0,0,0]}', expectedOutput: "[[0,0,0]]", description: "All zeros" },
  ],
  "Median of Two Sorted Arrays": [
    { input: '{"nums1": [1,3], "nums2": [2]}', expectedOutput: "2.00000", description: "Odd total length" },
    { input: '{"nums1": [1,2], "nums2": [3,4]}', expectedOutput: "2.50000", description: "Even total length" },
  ],
};

// Map editor language IDs to execution service language names
const languageMap: Record<string, string> = {
  'python3': 'python',
  'javascript': 'javascript',
  'cpp': 'cpp', // TODO: Add C++ support to backend
  'java': 'java' // TODO: Add Java support to backend
};

// Execute code using real backend API (for "Run Code" button - immediate execution)
export const executeCode = async (
  code: string,
  language: string,
  testCases: TestCase[]
): Promise<SubmissionResult> => {
  const startTime = Date.now();
  const results: ExecutionResult[] = [];

  const backendLanguage = languageMap[language] || 'python';

  // For immediate execution, run each test case one by one
  for (const testCase of testCases) {
    const testStart = Date.now();

    try {
      const result = await runCode(code, backendLanguage, testCase.input);

      const actualOutput = result.output?.trim() || '';
      const expectedOutput = testCase.expectedOutput.trim();
      const passed = result.success && actualOutput === expectedOutput;

      results.push({
        passed,
        output: actualOutput,
        expectedOutput: testCase.expectedOutput,
        executionTime: result.executionTime,
        error: result.error
      });
    } catch (error) {
      results.push({
        passed: false,
        output: '',
        expectedOutput: testCase.expectedOutput,
        executionTime: Date.now() - testStart,
        error: error instanceof Error ? error.message : 'Execution failed'
      });
    }
  }

  const passedCount = results.filter(r => r.passed).length;

  return {
    allPassed: passedCount === testCases.length,
    results,
    totalTime: Date.now() - startTime,
    passedCount,
    totalCount: testCases.length,
  };
};

// Run only visible test cases (for "Run Code" button)
export const runTestCases = async (
  code: string,
  language: string,
  problemTitle: string
): Promise<SubmissionResult> => {
  const testCases = problemTestCases[problemTitle] || problemTestCases["Two Sum"];
  // Only run first 3 test cases for "Run"
  return executeCode(code, language, testCases.slice(0, 3));
};

// Submit and run all test cases (for "Submit" button - async with job queue)
export const submitSolution = async (
  code: string,
  language: string,
  problemTitle: string
): Promise<SubmissionResult> => {
  const startTime = Date.now();
  const backendLanguage = languageMap[language] || 'python';
  const testCases = problemTestCases[problemTitle] || problemTestCases["Two Sum"];

  // Convert test cases to backend format
  const backendTestCases = testCases.map(tc => ({
    input: tc.input,
    output: tc.expectedOutput
  }));

  try {
    // Submit to execution queue
    const jobSubmission = await submitToExecutionService({
      code,
      language: backendLanguage,
      testCases: backendTestCases,
      battleId: 'battle-temp-id',
      userId: 'user-temp-id'
    });

    // Poll for results
    let attempts = 0;
    const maxAttempts = 30;

    while (attempts < maxAttempts) {
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 1000));

      try {
        const status = await getJobStatus(jobSubmission.jobId);
        console.log(`[CodeRunner] Poll attempt ${attempts}: status=${status.status}`, status);

        if (status.status === 'completed' && status.result) {
          console.log('[CodeRunner] Job completed successfully!', status.result);
          // Convert backend results to frontend format
          const results: ExecutionResult[] = status.result.results.map((r, i) => ({
            passed: r.passed,
            output: r.actual,
            expectedOutput: r.expected,
            executionTime: 0, // Not provided by backend yet
            error: r.error
          }));

          return {
            allPassed: status.result.passedTests === status.result.totalTests,
            results,
            totalTime: Date.now() - startTime,
            passedCount: status.result.passedTests,
            totalCount: status.result.totalTests
          };
        }
      } catch (pollError) {
        console.error(`[CodeRunner] Poll error on attempt ${attempts}:`, pollError);
        // Continue polling unless it's the last attempt
        if (attempts >= maxAttempts) {
          throw pollError;
        }
      }
    }

    console.error('[CodeRunner] Execution timeout after 30 attempts');
    throw new Error('Execution timeout');
  } catch (error) {
    console.error('Submission error:', error);
    throw error;
  }
};

// Get test cases for a problem
export const getTestCases = (problemTitle: string): TestCase[] => {
  return problemTestCases[problemTitle] || problemTestCases["Two Sum"];
};

export default { executeCode, runTestCases, submitSolution, getTestCases };