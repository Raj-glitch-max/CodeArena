import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import LeetCodeEditor from "@/components/battle/LeetCodeEditor";
import OpponentProgress from "@/components/battle/OpponentProgress";
import {
  Swords, Clock, Trophy, Zap, Flame, ArrowLeft, Eye, EyeOff
} from "lucide-react";
import NeonButton from "@/components/shared/NeonButton";
import { useSound } from "@/hooks/useSound";

type BattleState = "loading" | "matched" | "countdown" | "battle" | "finished";

const mockProblems = {
  easy: {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy" as const,
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]" },
      { input: "nums = [3,3], target = 6", output: "[0,1]" },
    ],
    constraints: [
      "2 <= nums.length <= 10⁴",
      "-10⁹ <= nums[i] <= 10⁹",
      "-10⁹ <= target <= 10⁹",
      "Only one valid answer exists."
    ],
    followUp: "Can you come up with an algorithm that is less than O(n²) time complexity?",
    topics: ["Array", "Hash Table"],
    companies: ["Amazon", "Google", "Apple"],
    likes: 67300,
    dislikes: 1800,
  },
  medium: {
    id: 15,
    title: "3Sum",
    difficulty: "Medium" as const,
    description: `Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.

Notice that the solution set must not contain duplicate triplets.`,
    examples: [
      { input: "nums = [-1,0,1,2,-1,-4]", output: "[[-1,-1,2],[-1,0,1]]", explanation: "The distinct triplets are [-1,0,1] and [-1,-1,2]." },
      { input: "nums = [0,1,1]", output: "[]" },
      { input: "nums = [0,0,0]", output: "[[0,0,0]]" },
    ],
    constraints: ["3 <= nums.length <= 3000", "-10⁵ <= nums[i] <= 10⁵"],
    topics: ["Array", "Two Pointers", "Sorting"],
    companies: ["Facebook", "Amazon", "Microsoft"],
    likes: 28900,
    dislikes: 2600,
  },
  hard: {
    id: 4,
    title: "Median of Two Sorted Arrays",
    difficulty: "Hard" as const,
    description: `Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.

The overall run time complexity should be O(log (m+n)).`,
    examples: [
      { input: "nums1 = [1,3], nums2 = [2]", output: "2.00000", explanation: "merged array = [1,2,3] and median is 2." },
      { input: "nums1 = [1,2], nums2 = [3,4]", output: "2.50000", explanation: "merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5." },
    ],
    constraints: [
      "nums1.length == m",
      "nums2.length == n",
      "0 <= m <= 1000",
      "0 <= n <= 1000",
      "1 <= m + n <= 2000",
      "-10⁶ <= nums1[i], nums2[i] <= 10⁶"
    ],
    topics: ["Array", "Binary Search", "Divide and Conquer"],
    companies: ["Google", "Amazon", "Apple"],
    likes: 24100,
    dislikes: 2700,
  },
};

const mockOpponents = [
  { username: "CodeSamurai", avatar: "⚔️", rating: 1923 },
  { username: "ByteHunter", avatar: "🎯", rating: 1756 },
  { username: "AlgoMaster", avatar: "🧠", rating: 2104 },
  { username: "NexusAlpha", avatar: "🔮", rating: 1892 },
];

const BattleArena = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "1v1";
  const difficulty = (searchParams.get("difficulty") || "medium") as keyof typeof mockProblems;
  const isHost = searchParams.get("host") === "true";

  const [battleState, setBattleState] = useState<BattleState>("loading");
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(difficulty === "easy" ? 600 : difficulty === "medium" ? 900 : 1200);
  const [opponent] = useState(mockOpponents[Math.floor(Math.random() * mockOpponents.length)]);
  const [battleResult, setBattleResult] = useState<"win" | "lose" | null>(null);
  const [showOpponentProgress, setShowOpponentProgress] = useState(true);

  // Sound effects hook
  const { play: playSound } = useSound();

  const problem = mockProblems[difficulty] || mockProblems.medium;

  // Battle flow
  useEffect(() => {
    if (battleState === "loading") {
      const timer = setTimeout(() => setBattleState("matched"), 1500);
      return () => clearTimeout(timer);
    }
    if (battleState === "matched") {
      const timer = setTimeout(() => setBattleState("countdown"), 2000);
      return () => clearTimeout(timer);
    }
    if (battleState === "countdown") {
      if (countdown > 0) {
        // Play countdown tick sound
        playSound('countdown');
        const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        // Play battle start sound
        playSound('battle-start');
        setBattleState("battle");
      }
    }
  }, [battleState, countdown, playSound]);

  // Battle timer
  useEffect(() => {
    if (battleState === "battle" && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (battleState === "battle" && timeLeft === 0) {
      setBattleResult("lose");
      setBattleState("finished");
    }
  }, [battleState, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = () => {
    // Random win/lose for demo
    const won = Math.random() > 0.3;
    setBattleResult(won ? "win" : "lose");
    setBattleState("finished");
  };

  // Play victory/defeat sound when battle ends
  useEffect(() => {
    if (battleState === "finished" && battleResult) {
      playSound(battleResult === "win" ? 'victory' : 'defeat');
    }
  }, [battleState, battleResult, playSound]);

  const handleRunTests = () => {
    // Handled in LeetCodeEditor
  };

  return (
    <div className="h-screen bg-[#1a1a2e] flex flex-col overflow-hidden">
      {/* Loading/Matchmaking Overlay */}
      <AnimatePresence>
        {(battleState === "loading" || battleState === "matched" || battleState === "countdown") && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-md"
          >
            {battleState === "loading" && (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-center"
              >
                <div className="w-24 h-24 mx-auto mb-6 rounded-full border-4 border-accent border-t-transparent animate-spin" />
                <h2 className="font-display font-bold text-3xl text-white tracking-wider mb-2">
                  {mode === "group" ? "JOINING ROOM..." : "SEARCHING FOR OPPONENT"}
                </h2>
                <p className="text-muted-foreground font-mono">
                  {mode === "group" ? "Connecting to battle room" : `Finding a worthy challenger (${difficulty})`}
                </p>
              </motion.div>
            )}

            {battleState === "matched" && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center"
              >
                <div className="flex items-center gap-12 mb-8">
                  {/* You */}
                  <motion.div
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-center"
                  >
                    <div className="w-24 h-24 mx-auto mb-3 rounded-lg bg-gradient-to-br from-primary/30 to-accent/30 border-2 border-primary/50 flex items-center justify-center text-5xl shadow-lg shadow-primary/20">
                      🥷
                    </div>
                    <div className="font-display text-xl text-white font-bold">You</div>
                    <div className="text-accent font-mono text-sm">1847 ELO</div>
                  </motion.div>

                  {/* VS */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.4, type: "spring" }}
                    className="relative"
                  >
                    <div className="text-5xl font-display font-black text-accent">VS</div>
                    <Swords className="w-8 h-8 text-accent absolute -bottom-6 left-1/2 -translate-x-1/2 animate-pulse" />
                  </motion.div>

                  {/* Opponent */}
                  <motion.div
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-center"
                  >
                    <div className="w-24 h-24 mx-auto mb-3 rounded-lg bg-gradient-to-br from-danger/30 to-warning/30 border-2 border-danger/50 flex items-center justify-center text-5xl shadow-lg shadow-danger/20">
                      {opponent.avatar}
                    </div>
                    <div className="font-display text-xl text-white font-bold">{opponent.username}</div>
                    <div className="text-danger font-mono text-sm">{opponent.rating} ELO</div>
                  </motion.div>
                </div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="font-display font-bold text-2xl text-accent tracking-wider"
                >
                  OPPONENT FOUND!
                </motion.h2>
              </motion.div>
            )}

            {battleState === "countdown" && (
              <motion.div
                key={countdown}
                initial={{ scale: 3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <div className="text-[12rem] font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-accent to-danger leading-none">
                  {countdown || "GO!"}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Battle Header */}
      <header className="flex-shrink-0 px-4 py-2 bg-[#0f0f1a] border-b border-accent/10 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="font-mono text-sm">Exit</span>
        </Link>

        {/* Problem Navigation */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">≡</span>
          <span className="text-white text-sm">Problem List</span>
          <span className="text-muted-foreground mx-2">‹ ›</span>
          <span className="text-muted-foreground">🔀</span>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-3 bg-bg-tertiary px-4 py-1.5 rounded-sm">
          <Clock className={`w-4 h-4 ${timeLeft < 60 ? "text-danger animate-pulse" : "text-accent"}`} />
          <span className={`font-mono font-bold text-lg ${timeLeft < 60 ? "text-danger" : "text-white"}`}>
            {formatTime(timeLeft)}
          </span>
        </div>

        {/* Opponent */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowOpponentProgress(!showOpponentProgress)}
            className="p-1.5 text-muted-foreground hover:text-white transition-colors"
            title={showOpponentProgress ? "Hide opponent progress" : "Show opponent progress"}
          >
            {showOpponentProgress ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          <div className="text-right">
            <div className="text-sm text-white font-medium">{opponent.username}</div>
            <div className="text-xs text-muted-foreground font-mono">{opponent.rating} ELO</div>
          </div>
          <div className="w-8 h-8 rounded-sm bg-danger/20 border border-danger/30 flex items-center justify-center text-lg">
            {opponent.avatar}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button className="p-2 text-muted-foreground hover:text-white">🎯</button>
          <button className="p-2 text-muted-foreground hover:text-white">⚙️</button>
          <button className="p-2 text-muted-foreground hover:text-white">⏱️ 0</button>
          <button className="p-2 text-muted-foreground hover:text-white">👥</button>
        </div>
      </header>

      {/* Main Editor */}
      <main className="flex-1 overflow-hidden relative">
        <LeetCodeEditor
          problem={problem}
          timeLeft={timeLeft}
          onSubmit={handleSubmit}
          onRunTests={handleRunTests}
        />

        {/* Opponent Progress Overlay */}
        {showOpponentProgress && battleState === "battle" && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-4 right-4 w-64 z-10"
          >
            <OpponentProgress
              opponent={opponent}
              isActive={battleState === "battle"}
            />
          </motion.div>
        )}
      </main>

      {/* Victory/Defeat Modal */}
      <AnimatePresence>
        {battleState === "finished" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              className="text-center max-w-md"
            >
              {/* Result Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className={`w-28 h-28 mx-auto mb-6 rounded-full flex items-center justify-center ${battleResult === "win"
                  ? "bg-success/20 border-2 border-success"
                  : "bg-danger/20 border-2 border-danger"
                  }`}
              >
                {battleResult === "win" ? (
                  <Trophy className="w-14 h-14 text-success" />
                ) : (
                  <Swords className="w-14 h-14 text-danger" />
                )}
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`font-display font-black text-5xl tracking-wider mb-3 ${battleResult === "win" ? "text-success" : "text-danger"
                  }`}
              >
                {battleResult === "win" ? "VICTORY!" : "DEFEAT"}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-muted-foreground mb-8"
              >
                {battleResult === "win"
                  ? "You solved it faster than your opponent!"
                  : "Your opponent was faster this time. Keep practicing!"}
              </motion.p>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-center gap-8 mb-8"
              >
                <div className="text-center">
                  <div className={`text-3xl font-display font-bold ${battleResult === "win" ? "text-success" : "text-danger"}`}>
                    {battleResult === "win" ? "+18" : "-12"}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">RATING</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-display font-bold text-warning">
                    {battleResult === "win" ? "+50" : "+10"}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">XP</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-display font-bold text-white flex items-center gap-1">
                    <Flame className={`w-6 h-6 ${battleResult === "win" ? "text-accent" : "text-muted-foreground"}`} />
                    {battleResult === "win" ? "8" : "0"}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">STREAK</div>
                </div>
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex gap-4 justify-center"
              >
                <Link to="/dashboard">
                  <NeonButton variant="ghost">Return to Dashboard</NeonButton>
                </Link>
                <NeonButton
                  variant="primary"
                  glow
                  onClick={() => window.location.reload()}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Battle Again
                </NeonButton>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BattleArena;
