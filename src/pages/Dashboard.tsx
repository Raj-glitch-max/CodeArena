import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/landing/Navbar";
import GlassCard from "@/components/shared/GlassCard";
import NeonButton from "@/components/shared/NeonButton";
import CountUp from "@/components/shared/CountUp";
import MatchFinderModal from "@/components/battle/MatchFinderModal";
import { 
  Swords, Trophy, Target, Flame, Clock, TrendingUp, 
  Play, Settings, User, History, Medal, Zap, ChevronRight, LogOut
} from "lucide-react";

const defaultStats = {
  username: "ShadowBlade",
  avatar: "🥷",
  rating: 1847,
  rank: "PLATINUM II",
  wins: 142,
  losses: 58,
  streak: 7,
  badges: ["STREAK MASTER", "PROBLEM CRUSHER", "SPEED DEMON"]
};

const recentBattles = [
  { opponent: "CodeSamurai", result: "WIN", ratingChange: +15, time: "2 min ago", problemName: "Two Sum" },
  { opponent: "ByteHunter", result: "WIN", ratingChange: +12, time: "15 min ago", problemName: "Valid Parentheses" },
  { opponent: "AlgoMaster", result: "LOSS", ratingChange: -8, time: "1 hour ago", problemName: "Merge Intervals" },
  { opponent: "NexusAlpha", result: "WIN", ratingChange: +18, time: "3 hours ago", problemName: "Binary Search" },
];

const quickActions = [
  { icon: <Swords className="w-6 h-6" />, label: "Quick Match", desc: "Find opponent", color: "accent", action: "findMatch" },
  { icon: <Target className="w-6 h-6" />, label: "Practice", desc: "Solve problems", color: "primary", href: "/problems" },
  { icon: <Trophy className="w-6 h-6" />, label: "Rankings", desc: "View leaderboard", color: "warning", href: "/leaderboard" },
  { icon: <History className="w-6 h-6" />, label: "History", desc: "Past battles", color: "purple", href: "/profile" },
];

const Dashboard = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [showMatchFinder, setShowMatchFinder] = useState(false);

  // Use user data if logged in, otherwise show demo data
  const userStats = user ? {
    username: user.username,
    avatar: user.avatar,
    rating: user.rating,
    rank: user.rank,
    wins: user.wins,
    losses: user.losses,
    streak: user.streak,
    badges: ["NEWCOMER"]
  } : defaultStats;

  const handleQuickAction = (action: typeof quickActions[0]) => {
    if (action.action === "findMatch") {
      setShowMatchFinder(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(var(--accent)/0.08)_0%,_transparent_50%)]" />
      <div className="fixed inset-0 grid-background opacity-20" />

      <main className="relative z-10 pt-24 pb-16 px-6">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <span className="font-mono text-sm">// WARRIOR DASHBOARD</span>
              </div>
              <h1 className="font-display font-bold text-4xl text-white tracking-wider">
                Welcome back, <span className="text-accent">{userStats.username}</span>
              </h1>
            </div>
            
            {isAuthenticated && (
              <button
                onClick={logout}
                className="flex items-center gap-2 text-muted-foreground hover:text-danger transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-mono text-sm">Logout</span>
              </button>
            )}
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Profile & Stats */}
            <div className="space-y-6">
              {/* Profile Card */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <GlassCard corners className="text-center">
                  {/* Avatar */}
                  <div className="w-24 h-24 mx-auto mb-4 rounded-sm bg-bg-tertiary border-2 border-accent/30 flex items-center justify-center text-5xl">
                    {userStats.avatar}
                  </div>
                  
                  <h2 className="font-display font-bold text-2xl text-white tracking-wider mb-1">
                    {userStats.username}
                  </h2>
                  
                  <div className="inline-block px-3 py-1 bg-accent/20 border border-accent/30 rounded-sm mb-4">
                    <span className="font-display text-sm text-accent tracking-wider">
                      {userStats.rank}
                    </span>
                  </div>

                  {/* Rating */}
                  <div className="mb-6">
                    <div className="text-4xl font-display font-bold text-white">
                      <CountUp end={userStats.rating} duration={1500} />
                    </div>
                    <div className="text-xs text-muted-foreground font-mono tracking-wider">ELO RATING</div>
                  </div>

                  {/* Win/Loss */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div>
                      <div className="text-2xl font-display font-bold text-success">
                        <CountUp end={userStats.wins} duration={1500} />
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">WINS</div>
                    </div>
                    <div>
                      <div className="text-2xl font-display font-bold text-danger">
                        <CountUp end={userStats.losses} duration={1500} />
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">LOSSES</div>
                    </div>
                    <div>
                      <div className="text-2xl font-display font-bold text-warning flex items-center justify-center gap-1">
                        <Flame className="w-5 h-5" />
                        <CountUp end={userStats.streak} duration={1500} />
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">STREAK</div>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    {userStats.badges.map((badge) => (
                      <span
                        key={badge}
                        className="px-2 py-1 bg-purple/10 border border-purple/30 rounded-sm text-xs font-mono text-purple"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <GlassCard>
                  <h3 className="font-display font-bold text-lg text-white mb-4 tracking-wider">
                    QUICK ACTIONS
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {quickActions.map((action) => (
                      action.href ? (
                        <Link key={action.label} to={action.href}>
                          <motion.div
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className="p-4 rounded-sm bg-bg-tertiary border border-accent/20 hover:border-accent/50 transition-all cursor-pointer group"
                          >
                            <div className="text-accent mb-2 group-hover:scale-110 transition-transform">
                              {action.icon}
                            </div>
                            <div className="font-display text-sm text-white tracking-wider">
                              {action.label}
                            </div>
                            <div className="text-xs text-muted-foreground font-mono">
                              {action.desc}
                            </div>
                          </motion.div>
                        </Link>
                      ) : (
                        <motion.div
                          key={action.label}
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleQuickAction(action)}
                          className="p-4 rounded-sm bg-bg-tertiary border border-accent/20 hover:border-accent/50 transition-all cursor-pointer group"
                        >
                          <div className="text-accent mb-2 group-hover:scale-110 transition-transform">
                            {action.icon}
                          </div>
                          <div className="font-display text-sm text-white tracking-wider">
                            {action.label}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {action.desc}
                          </div>
                        </motion.div>
                      )
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            </div>

            {/* Middle Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Battle CTA */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <GlassCard corners className="relative overflow-hidden">
                  {/* Japanese accent */}
                  <div className="absolute top-4 right-4 text-6xl font-bold text-accent/10">
                    戦闘
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-display font-bold text-2xl text-white tracking-wider mb-2">
                        READY FOR BATTLE?
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Find an opponent and prove your skills in real-time combat.
                      </p>
                      <NeonButton
                        variant="primary"
                        glow
                        icon={<Zap className="w-5 h-5" />}
                        iconRight={<ChevronRight className="w-5 h-5" />}
                        onClick={() => setShowMatchFinder(true)}
                      >
                        Find Match
                      </NeonButton>
                    </div>
                    <div className="hidden md:flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-display font-bold text-success">
                          1,247
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">ONLINE NOW</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-display font-bold text-accent">
                          ~30s
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">AVG QUEUE</div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>

              {/* Recent Battles */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <GlassCard>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display font-bold text-lg text-white tracking-wider">
                      RECENT BATTLES
                    </h3>
                    <Link to="/profile" className="text-accent text-sm font-display tracking-wider hover:text-accent-light transition-colors flex items-center gap-1">
                      View All <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>

                  <div className="space-y-3">
                    {recentBattles.map((battle, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                        className="flex items-center justify-between p-3 rounded-sm bg-bg-tertiary/50 hover:bg-bg-tertiary transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-2 h-10 rounded-full ${battle.result === "WIN" ? "bg-success" : "bg-danger"}`} />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-display text-white tracking-wider">
                                vs {battle.opponent}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-sm font-mono ${
                                battle.result === "WIN" 
                                  ? "bg-success/20 text-success" 
                                  : "bg-danger/20 text-danger"
                              }`}>
                                {battle.result}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground font-mono">
                              {battle.problemName}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-display font-bold ${
                            battle.ratingChange > 0 ? "text-success" : "text-danger"
                          }`}>
                            {battle.ratingChange > 0 ? "+" : ""}{battle.ratingChange}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {battle.time}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>

              {/* Daily Challenge */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <GlassCard className="border-warning/30">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-sm bg-warning/20 border border-warning/30 flex items-center justify-center text-warning">
                      <Medal className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-display font-bold text-white tracking-wider">
                          DAILY CHALLENGE
                        </h3>
                        <span className="px-2 py-0.5 bg-warning/20 text-warning text-xs font-mono rounded-sm">
                          +50 XP
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm mb-3">
                        Solve "Longest Substring Without Repeating Characters" to claim your reward.
                      </p>
                      <div className="flex items-center gap-4">
                        <Link to="/problems">
                          <NeonButton variant="secondary" size="sm">
                            Start Challenge
                          </NeonButton>
                        </Link>
                        <div className="flex items-center gap-1 text-warning text-sm font-mono">
                          <Clock className="w-4 h-4" />
                          <span>12:34:56 remaining</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      {/* Match Finder Modal */}
      <MatchFinderModal
        isOpen={showMatchFinder}
        onClose={() => setShowMatchFinder(false)}
      />
    </div>
  );
};

export default Dashboard;
