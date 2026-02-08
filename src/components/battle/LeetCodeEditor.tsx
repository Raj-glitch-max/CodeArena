import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Send, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { submitSolution, runTestCases, getTestCases, type TestCase, type SubmissionResult } from "./CodeRunner";

interface Problem {
    id: number;
    title: string;
    difficulty: string;
    description: string;
    examples: Array<{ input: string; output: string; explanation?: string }>;
    constraints: string[];
    topics: string[];
}

interface LeetCodeEditorProps {
    problem: Problem;
    timeLeft: number;
    onSubmit: (result: { passedTests: number; totalTests: number; allPassed: boolean }) => void;
    onRunTests: () => void;
}

const languages = [
    { id: "python3", name: "Python 3", template: "class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        # Write your solution here\n        pass" },
    { id: "javascript", name: "JavaScript", template: "/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar twoSum = function(nums, target) {\n    // Write your solution here\n};" },
];

const LeetCodeEditor = ({ problem, timeLeft, onSubmit, onRunTests }: LeetCodeEditorProps) => {
    const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
    const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
    const [code, setCode] = useState(selectedLanguage.template);
    const [activeTab, setActiveTab] = useState<"description" | "submissions">("description");
    const [bottomTab, setBottomTab] = useState<"testcase" | "result">("testcase");
    const [testResults, setTestResults] = useState<SubmissionResult | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleLanguageChange = (lang: typeof languages[0]) => {
        setSelectedLanguage(lang);
        setCode(lang.template);
        setShowLanguageDropdown(false);
    };

    const handleRunCode = async () => {
        if (!code.trim()) {
            toast.error("Please write some code first!");
            return;
        }

        setIsRunning(true);
        setBottomTab("result");
        onRunTests();

        try {
            const result = await runTestCases(code, selectedLanguage.id, problem.title);
            setTestResults(result);

            if (result.allPassed) {
                toast.success(`All ${result.passedCount} test cases passed! ✓`);
            } else {
                toast.error(`${result.passedCount}/${result.totalCount} test cases passed`);
            }
        } catch (error) {
            console.error("Run error:", error);
            toast.error("Failed to run code");
        } finally {
            setIsRunning(false);
        }
    };

    const handleSubmitCode = async () => {
        if (!code.trim()) {
            toast.error("Please write some code first!");
            return;
        }

        setIsSubmitting(true);
        setBottomTab("result");
        toast.info("Submitting your code...");

        try {
            const result = await submitSolution(code, selectedLanguage.id, problem.title);
            setTestResults(result);

            if (result.allPassed) {
                toast.success(`All ${result.totalCount} test cases passed! 🎉`);
            } else {
                toast.error(`${result.passedCount}/${result.totalCount} test cases passed`);
            }

            // Notify parent component with submission results
            onSubmit({
                passedTests: result.passedCount,
                totalTests: result.totalCount,
                allPassed: result.allPassed
            });
        } catch (error) {
            console.error("Submit error:", error);
            toast.error("Failed to submit code");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-dark-800">
            {/* Top Bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-dark-900 border-b border-dark-700">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <button
                            onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-dark-700 rounded-lg hover:bg-dark-600 transition-colors"
                        >
                            <span className="text-sm text-white">{selectedLanguage.name}</span>
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </button>

                        {showLanguageDropdown && (
                            <div className="absolute top-full left-0 mt-1 bg-dark-800 border border-dark-700 rounded-lg shadow-lg z-10 min-w-[150px]">
                                {languages.map((lang) => (
                                    <button
                                        key={lang.id}
                                        onClick={() => handleLanguageChange(lang)}
                                        className="w-full px-4 py-2 text-left text-sm hover:bg-dark-700 transition-colors first:rounded-t-lg last:rounded-b-lg"
                                    >
                                        {lang.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel - Problem Description */}
                <div className="w-1/2 border-r border-dark-700 flex flex-col">
                    <div className="flex border-b border-dark-700">
                        <button
                            onClick={() => setActiveTab("description")}
                            className={`px-4 py-2 text-sm ${activeTab === "description" ? "text-accent border-b-2 border-accent" : "text-muted-foreground"}`}
                        >
                            Description
                        </button>
                        <button
                            onClick={() => setActiveTab("submissions")}
                            className={`px-4 py-2 text-sm ${activeTab === "submissions" ? "text-accent border-b-2 border-accent" : "text-muted-foreground"}`}
                        >
                            Submissions
                        </button>
                    </div>

                    <div className="flex-1 overflow-auto p-4">
                        {activeTab === "description" && (
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-white">{problem.title}</h2>
                                <div className="text-sm text-muted-foreground whitespace-pre-wrap">{problem.description}</div>

                                {problem.examples.map((example, i) => (
                                    <div key={i} className="bg-dark-900 p-3 rounded-lg">
                                        <div className="font-mono text-sm">
                                            <div className="text-muted-foreground">Input: {example.input}</div>
                                            <div className="text-muted-foreground">Output: {example.output}</div>
                                            {example.explanation && <div className="text-muted-foreground mt-1">{example.explanation}</div>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel - Code Editor */}
                <div className="w-1/2 flex flex-col">
                    <div className="flex-1 overflow-hidden">
                        <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="w-full h-full p-4 bg-dark-900 text-white font-mono text-sm resize-none focus:outline-none"
                            spellCheck={false}
                        />
                    </div>

                    {/* Bottom Panel - Test Results */}
                    <div className="h-64 border-t border-dark-700 flex flex-col">
                        <div className="flex border-b border-dark-700">
                            <button
                                onClick={() => setBottomTab("testcase")}
                                className={`px-4 py-2 text-sm ${bottomTab === "testcase" ? "text-accent border-b-2 border-accent" : "text-muted-foreground"}`}
                            >
                                Testcase
                            </button>
                            <button
                                onClick={() => setBottomTab("result")}
                                className={`px-4 py-2 text-sm ${bottomTab === "result" ? "text-accent border-b-2 border-accent" : "text-muted-foreground"}`}
                            >
                                Test Result
                            </button>
                        </div>

                        <div className="flex-1 overflow-auto p-4">
                            {bottomTab === "result" && testResults && (
                                <div className="space-y-2">
                                    <div className="text-sm font-medium">
                                        {testResults.allPassed ? (
                                            <span className="text-green-500">✓ All tests passed ({testResults.passedCount}/{testResults.totalCount})</span>
                                        ) : (
                                            <span className="text-red-500">✗ Some tests failed ({testResults.passedCount}/{testResults.totalCount})</span>
                                        )}
                                    </div>
                                    {testResults.results.map((result, i) => (
                                        <div key={i} className="bg-dark-900 p-2 rounded text-xs font-mono">
                                            <div className={result.passed ? "text-green-500" : "text-red-500"}>
                                                Test {i + 1}: {result.passed ? "✓ PASS" : "✗ FAIL"}
                                            </div>
                                            <div className="text-muted-foreground">Expected: {result.expectedOutput}</div>
                                            <div className="text-muted-foreground">Got: {result.output}</div>
                                            {result.error && <div className="text-red-400">Error: {result.error}</div>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-2 p-4 border-t border-dark-700">
                        <button
                            onClick={handleRunCode}
                            disabled={isRunning}
                            className="flex items-center gap-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors disabled:opacity-50"
                        >
                            <Play className="w-4 h-4" />
                            <span className="text-sm">{isRunning ? "Running..." : "Run"}</span>
                        </button>
                        <button
                            onClick={handleSubmitCode}
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/90 rounded-lg transition-colors disabled:opacity-50"
                        >
                            <Send className="w-4 h-4" />
                            <span className="text-sm">{isSubmitting ? "Submitting..." : "Submit"}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeetCodeEditor;
