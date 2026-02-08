import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import GlassCard from "../shared/GlassCard";
import { Terminal, Code, Play, CheckCircle, XCircle, Clock } from "lucide-react";
import { useState, useEffect } from "react";

const codeLines = [
  { text: "def battle_solve(nums, target):", type: "function" },
  { text: "    seen = {}", type: "normal" },
  { text: "    for i, num in enumerate(nums):", type: "normal" },
  { text: "        complement = target - num", type: "normal" },
  { text: "        if complement in seen:", type: "normal" },
  { text: "            return [seen[complement], i]", type: "return" },
  { text: "        seen[num] = i", type: "normal" },
  { text: "    return []", type: "return" },
];

const testCases = [
  { input: "[2, 7, 11, 15], 9", output: "[0, 1]", status: "pass", time: "0.02ms" },
  { input: "[3, 2, 4], 6", output: "[1, 2]", status: "pass", time: "0.01ms" },
  { input: "[3, 3], 6", output: "[0, 1]", status: "pass", time: "0.01ms" },
];

const CodeEditorPreview = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });
  const [visibleLines, setVisibleLines] = useState(0);
  const [showTests, setShowTests] = useState(false);

  useEffect(() => {
    if (inView) {
      const timer = setInterval(() => {
        setVisibleLines((prev) => {
          if (prev >= codeLines.length) {
            clearInterval(timer);
            setTimeout(() => setShowTests(true), 500);
            return prev;
          }
          return prev + 1;
        });
      }, 200);
      return () => clearInterval(timer);
    }
  }, [inView]);

  return (
    <section className="py-24 relative overflow-hidden" ref={ref}>
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_hsl(var(--accent)/0.05)_0%,_transparent_50%)]" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <Terminal className="w-6 h-6 text-accent" />
            <span className="font-mono text-accent text-sm tracking-[0.3em]">
              // LIVE BATTLE PREVIEW
            </span>
          </div>
          <h2 className="font-display font-bold text-4xl md:text-5xl mb-4 tracking-wider">
            <span className="text-white">CODE IN </span>
            <span className="text-gradient">REAL-TIME</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Experience the thrill of competitive coding with our advanced Monaco editor,
            instant execution, and real-time opponent tracking.
          </p>
        </motion.div>

        {/* Editor Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3 }}
          className="max-w-5xl mx-auto"
        >
          <GlassCard className="p-0 overflow-hidden" corners>
            {/* Editor Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-accent/10 bg-background/50">
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-danger" />
                  <div className="w-3 h-3 rounded-full bg-warning" />
                  <div className="w-3 h-3 rounded-full bg-success" />
                </div>
                <span className="font-mono text-sm text-muted-foreground">solution.py</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-success/20 text-success text-xs font-mono rounded-sm">
                  Python 3.11
                </span>
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="font-mono text-sm text-accent">14:32</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 divide-x divide-accent/10">
              {/* Code Panel */}
              <div className="p-6 bg-[#0d1117] min-h-[300px]">
                <div className="font-mono text-sm space-y-1">
                  {codeLines.map((line, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={i < visibleLines ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.3 }}
                      className="flex"
                    >
                      <span className="w-8 text-muted-foreground/50 select-none">
                        {i + 1}
                      </span>
                      <span
                        className={
                          line.type === "function"
                            ? "text-purple"
                            : line.type === "return"
                            ? "text-accent"
                            : "text-foreground"
                        }
                      >
                        {line.text}
                      </span>
                      {i === visibleLines - 1 && (
                        <span className="ml-0.5 w-2 h-5 bg-accent animate-pulse" />
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Test Results Panel */}
              <div className="p-6 bg-background/50">
                <div className="flex items-center gap-2 mb-4">
                  <Play className="w-4 h-4 text-success" />
                  <span className="font-display text-sm tracking-wider text-muted-foreground">
                    TEST RESULTS
                  </span>
                </div>

                <div className="space-y-3">
                  {testCases.map((test, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={showTests ? { opacity: 1, scale: 1 } : {}}
                      transition={{ delay: i * 0.15 }}
                      className="glass-card p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {test.status === "pass" ? (
                            <CheckCircle className="w-4 h-4 text-success" />
                          ) : (
                            <XCircle className="w-4 h-4 text-danger" />
                          )}
                          <span className="font-mono text-xs text-muted-foreground">
                            Test Case {i + 1}
                          </span>
                        </div>
                        <span className="font-mono text-xs text-success">{test.time}</span>
                      </div>
                      <div className="font-mono text-xs">
                        <div className="text-muted-foreground">
                          Input: <span className="text-primary">{test.input}</span>
                        </div>
                        <div className="text-muted-foreground">
                          Output: <span className="text-success">{test.output}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {showTests && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 p-3 bg-success/10 border border-success/30 rounded-sm"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-success" />
                      <span className="font-display text-success tracking-wider">
                        ALL TESTS PASSED
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
};

export default CodeEditorPreview;
