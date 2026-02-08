import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import GlassCard from "@/components/shared/GlassCard";
import NeonButton from "@/components/shared/NeonButton";
import { 
  Search, Filter, CheckCircle, Circle, Lock, 
  Flame, TrendingUp, Code, ChevronRight, Trophy
} from "lucide-react";

type Difficulty = "Easy" | "Medium" | "Hard";

interface Problem {
  id: number;
  title: string;
  difficulty: Difficulty;
  acceptance: number;
  tags: string[];
  solved: boolean;
  locked: boolean;
}

const problems: Problem[] = [
  { id: 1, title: "Two Sum", difficulty: "Easy", acceptance: 49.2, tags: ["Array", "Hash Table"], solved: true, locked: false },
  { id: 2, title: "Add Two Numbers", difficulty: "Medium", acceptance: 39.4, tags: ["Linked List", "Math"], solved: true, locked: false },
  { id: 3, title: "Longest Substring Without Repeating", difficulty: "Medium", acceptance: 33.8, tags: ["String", "Sliding Window"], solved: false, locked: false },
  { id: 4, title: "Median of Two Sorted Arrays", difficulty: "Hard", acceptance: 35.6, tags: ["Binary Search", "Divide and Conquer"], solved: false, locked: false },
  { id: 5, title: "Longest Palindromic Substring", difficulty: "Medium", acceptance: 32.4, tags: ["String", "DP"], solved: false, locked: false },
  { id: 6, title: "Regular Expression Matching", difficulty: "Hard", acceptance: 28.2, tags: ["String", "DP", "Recursion"], solved: false, locked: true },
  { id: 7, title: "Container With Most Water", difficulty: "Medium", acceptance: 54.3, tags: ["Array", "Two Pointers"], solved: true, locked: false },
  { id: 8, title: "3Sum", difficulty: "Medium", acceptance: 32.1, tags: ["Array", "Two Pointers"], solved: false, locked: false },
  { id: 9, title: "Valid Parentheses", difficulty: "Easy", acceptance: 40.1, tags: ["String", "Stack"], solved: true, locked: false },
  { id: 10, title: "Merge K Sorted Lists", difficulty: "Hard", acceptance: 48.7, tags: ["Linked List", "Heap"], solved: false, locked: true },
];

const difficultyColors: Record<Difficulty, string> = {
  Easy: "text-success bg-success/20 border-success/30",
  Medium: "text-warning bg-warning/20 border-warning/30",
  Hard: "text-danger bg-danger/20 border-danger/30",
};

const Problems = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | "All">("All");

  const filteredProblems = problems.filter((problem) => {
    const matchesSearch = problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      problem.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDifficulty = selectedDifficulty === "All" || problem.difficulty === selectedDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  const stats = {
    total: problems.length,
    solved: problems.filter(p => p.solved).length,
    easy: problems.filter(p => p.difficulty === "Easy").length,
    medium: problems.filter(p => p.difficulty === "Medium").length,
    hard: problems.filter(p => p.difficulty === "Hard").length,
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_hsl(var(--primary)/0.08)_0%,_transparent_50%)]" />
      <div className="fixed inset-0 grid-background opacity-20" />

      <main className="relative z-10 pt-24 pb-16 px-6">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Code className="w-4 h-4" />
              <span className="font-mono text-sm">// PROBLEM ARCHIVE</span>
            </div>
            <h1 className="font-display font-bold text-4xl text-white tracking-wider">
              CODING <span className="text-gradient">CHALLENGES</span>
            </h1>
          </motion.div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Sidebar - Stats & Filters */}
            <div className="space-y-6">
              {/* Progress Card */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <GlassCard corners>
                  <h3 className="font-display font-bold text-lg text-white mb-4 tracking-wider">
                    PROGRESS
                  </h3>
                  
                  {/* Circular Progress */}
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <svg className="w-full h-full -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="hsl(var(--bg-tertiary))"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="hsl(var(--accent))"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${(stats.solved / stats.total) * 352} 352`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl font-display font-bold text-white">
                          {stats.solved}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          / {stats.total}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Difficulty Breakdown */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-success text-sm font-mono">Easy</span>
                      <span className="text-muted-foreground text-sm">{stats.easy} problems</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-warning text-sm font-mono">Medium</span>
                      <span className="text-muted-foreground text-sm">{stats.medium} problems</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-danger text-sm font-mono">Hard</span>
                      <span className="text-muted-foreground text-sm">{stats.hard} problems</span>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>

              {/* Filters */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <GlassCard>
                  <h3 className="font-display font-bold text-lg text-white mb-4 tracking-wider flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    FILTERS
                  </h3>
                  
                  <div className="space-y-2">
                    {(["All", "Easy", "Medium", "Hard"] as const).map((diff) => (
                      <button
                        key={diff}
                        onClick={() => setSelectedDifficulty(diff)}
                        className={`w-full text-left px-3 py-2 rounded-sm font-mono text-sm transition-all ${
                          selectedDifficulty === diff
                            ? "bg-accent/20 text-accent border border-accent/30"
                            : "bg-bg-tertiary/50 text-muted-foreground hover:bg-bg-tertiary hover:text-white"
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>

              {/* Popular Tags */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <GlassCard>
                  <h3 className="font-display font-bold text-sm text-white mb-3 tracking-wider">
                    POPULAR TAGS
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {["Array", "String", "DP", "Tree", "Graph", "Hash Table"].map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-bg-tertiary text-xs font-mono text-muted-foreground hover:text-white hover:bg-bg-elevated cursor-pointer transition-colors rounded-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            </div>

            {/* Main Content - Problem List */}
            <div className="lg:col-span-3 space-y-4">
              {/* Search Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search problems or tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-bg-secondary border border-accent/20 rounded-sm text-white placeholder:text-muted-foreground font-mono focus:outline-none focus:border-accent/50 transition-colors"
                  />
                </div>
              </motion.div>

              {/* Problems Table Header */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="hidden md:flex items-center px-4 py-2 text-xs font-mono text-muted-foreground tracking-wider uppercase"
              >
                <div className="w-12">Status</div>
                <div className="flex-1">Title</div>
                <div className="w-24 text-center">Difficulty</div>
                <div className="w-24 text-right">Acceptance</div>
              </motion.div>

              {/* Problem Rows */}
              <div className="space-y-2">
                {filteredProblems.map((problem, index) => (
                  <motion.div
                    key={problem.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + index * 0.05 }}
                  >
                    <GlassCard
                      hover
                      className={`flex items-center gap-4 py-4 ${problem.locked ? "opacity-60" : ""}`}
                    >
                      {/* Status */}
                      <div className="w-8">
                        {problem.locked ? (
                          <Lock className="w-5 h-5 text-muted-foreground" />
                        ) : problem.solved ? (
                          <CheckCircle className="w-5 h-5 text-success" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>

                      {/* Title & Tags */}
                      <div className="flex-1 min-w-0">
                        <Link
                          to={problem.locked ? "#" : `/battle?problem=${problem.id}`}
                          className={`font-display text-white tracking-wider hover:text-accent transition-colors ${
                            problem.locked ? "pointer-events-none" : ""
                          }`}
                        >
                          {problem.id}. {problem.title}
                        </Link>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {problem.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-1.5 py-0.5 bg-bg-tertiary text-[10px] font-mono text-muted-foreground rounded-sm"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Difficulty */}
                      <div className="w-24 flex justify-center">
                        <span className={`px-2 py-1 text-xs font-mono rounded-sm border ${difficultyColors[problem.difficulty]}`}>
                          {problem.difficulty}
                        </span>
                      </div>

                      {/* Acceptance */}
                      <div className="w-24 text-right">
                        <span className="font-mono text-sm text-muted-foreground">
                          {problem.acceptance}%
                        </span>
                      </div>

                      {/* Action */}
                      <div className="w-8">
                        {!problem.locked && (
                          <Link to={`/battle?problem=${problem.id}`}>
                            <ChevronRight className="w-5 h-5 text-muted-foreground hover:text-accent transition-colors" />
                          </Link>
                        )}
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>

              {/* Load More */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center pt-4"
              >
                <NeonButton variant="ghost">
                  Load More Problems
                </NeonButton>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Problems;
