import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);
const TIMEOUT = parseInt(process.env.EXECUTION_TIMEOUT || '10000');

export interface ExecutionResult {
    success: boolean;
    output?: string;
    error?: string;
    executionTime: number;
}

export class CodeRunner {
    // Execute Python code
    static async runPython(code: string, input: string = ''): Promise<ExecutionResult> {
        const startTime = Date.now();

        try {
            // Create temporary file
            const tempDir = '/tmp/codebattle';
            await fs.mkdir(tempDir, { recursive: true });
            const fileName = `code_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.py`;
            const filePath = path.join(tempDir, fileName);

            await fs.writeFile(filePath, code);

            // Execute with timeout
            const { stdout, stderr } = await execAsync(
                `echo "${input.replace(/"/g, '\\"')}" | timeout ${TIMEOUT / 1000}s python3 ${filePath}`,
                { maxBuffer: 1024 * 1024 } // 1MB buffer
            );

            // Cleanup
            await fs.unlink(filePath);

            const executionTime = Date.now() - startTime;

            return {
                success: true,
                output: stdout.trim(),
                error: stderr || undefined,
                executionTime
            };
        } catch (error: any) {
            const executionTime = Date.now() - startTime;

            return {
                success: false,
                error: error.message || 'Execution failed',
                executionTime
            };
        }
    }

    // Execute JavaScript code
    static async runJavaScript(code: string, input: string = ''): Promise<ExecutionResult> {
        const startTime = Date.now();

        try {
            const tempDir = '/tmp/codebattle';
            await fs.mkdir(tempDir, { recursive: true });
            const fileName = `code_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.js`;
            const filePath = path.join(tempDir, fileName);

            await fs.writeFile(filePath, code);

            const { stdout, stderr } = await execAsync(
                `echo "${input.replace(/"/g, '\\"')}" | timeout ${TIMEOUT / 1000}s node ${filePath}`,
                { maxBuffer: 1024 * 1024 }
            );

            await fs.unlink(filePath);

            const executionTime = Date.now() - startTime;

            return {
                success: true,
                output: stdout.trim(),
                error: stderr || undefined,
                executionTime
            };
        } catch (error: any) {
            const executionTime = Date.now() - startTime;

            return {
                success: false,
                error: error.message || 'Execution failed',
                executionTime
            };
        }
    }

    // Wrap Python solution with test harness for LeetCode-style problems
    static wrapPythonSolution(userCode: string, testInput: string): string {
        return `import json
import sys

${userCode}

if __name__ == "__main__":
    try:
        # Read test input from stdin
        test_data = json.loads(sys.stdin.read().strip())
        
        # Create solution instance
        solution = Solution()
        
        # Call the method (assuming twoSum for now, will be dynamic later)
        # Get first method that's not __init__
        method_name = [m for m in dir(solution) if not m.startswith('_')][0]
        method = getattr(solution, method_name)
        
        # Call with unpacked arguments if dict, otherwise pass as-is
        if isinstance(test_data, dict):
            result = method(**test_data)
        elif isinstance(test_data, list):
            result = method(*test_data)
        else:
            result = method(test_data)
        
        # Output result as JSON
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
`;
    }

    // Wrap JavaScript solution with test harness
    static wrapJavaScriptSolution(userCode: string, testInput: string): string {
        return `${userCode}

// Test harness
const testData = JSON.parse(require('fs').readFileSync(0, 'utf-8'));

try {
    let result;
    
    // Check if it's a function (arrow function or regular)
    if (typeof twoSum !== 'undefined') {
        // For function-style solutions
        if (Array.isArray(testData)) {
            result = twoSum(...testData);
        } else if (typeof testData === 'object') {
            result = twoSum(testData.nums, testData.target);
        } else {
            result = twoSum(testData);
        }
    } else {
        // For other patterns, try to auto-detect
        const funcNames = Object.keys(global).filter(k => typeof global[k] === 'function' && !k.startsWith('_'));
        if (funcNames.length > 0) {
            const func = global[funcNames[0]];
            result = Array.isArray(testData) ? func(...testData) : func(testData);
        }
    }
    
    console.log(JSON.stringify(result));
} catch (e) {
    console.log(JSON.stringify({error: e.message}));
    process.exit(1);
}
`;
    }

    // Run code against test cases
    static async runTestCases(
        code: string,
        language: string,
        testCases: Array<{ input: string; output: string }>
    ): Promise<{
        totalTests: number;
        passedTests: number;
        results: Array<{ passed: boolean; expected: string; actual: string; error?: string }>;
    }> {
        const results = [];
        let passedTests = 0;

        // Detect if this is LeetCode-style code (has class Solution or function definition)
        const isLeetCodeStyle = code.includes('class Solution') ||
            code.includes('var twoSum') ||
            code.includes('function twoSum') ||
            code.includes('def twoSum');

        for (const testCase of testCases) {
            let result: ExecutionResult;
            let wrappedCode = code;

            // Wrap LeetCode-style code with test harness
            if (isLeetCodeStyle) {
                if (language === 'python') {
                    wrappedCode = this.wrapPythonSolution(code, testCase.input);
                } else if (language === 'javascript') {
                    wrappedCode = this.wrapJavaScriptSolution(code, testCase.input);
                }
            }

            if (language === 'python') {
                result = await this.runPython(wrappedCode, testCase.input);
            } else if (language === 'javascript') {
                result = await this.runJavaScript(wrappedCode, testCase.input);
            } else {
                throw new Error(`Unsupported language: ${language}`);
            }

            const actual = (result.output || '').trim();
            const expected = testCase.output.trim();

            // Normalize JSON output for comparison
            let passed = result.success && actual === expected;
            if (!passed && result.success) {
                // Try JSON comparison for flexibility
                try {
                    const actualJson = JSON.parse(actual);
                    const expectedJson = JSON.parse(expected);
                    passed = JSON.stringify(actualJson) === JSON.stringify(expectedJson);
                } catch {
                    // Not JSON, stick with string comparison
                }
            }

            if (passed) passedTests++;

            results.push({
                passed,
                expected,
                actual,
                error: result.error
            });
        }

        return {
            totalTests: testCases.length,
            passedTests,
            results
        };
    }
}
