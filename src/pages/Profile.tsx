import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import GlassCard from "@/components/shared/GlassCard";
import CountUp from "@/components/shared/CountUp";
import { 
  User, Trophy, Target, Flame, TrendingUp, Calendar,
  Award, Swords, Clock, ChevronRight, Medal, Zap
} from "lucide-react";

const userProfile = {
  username: "ShadowBlade",
  avatar: "🥷",
  rating: 1847,
  rank: "PLATINUM II",
  joinDate: "March 2024",
  wins: 142,
  losses: 58,
  streak: 7,
  peakRating: 1923,
  totalBattles: 200,
  avgSolveTime: "4:32",
};

const badges = [
  { name: "STREAK MASTER", icon: <Flame className="w-4 h-4" />, color: "warning" },
  { name: "PROBLEM CRUSHER", icon: <Target className="w-4 h-4" />, color: "success" },
  { name: "SPEED DEMON", icon: <Zap className="w-4 h-4" />, color: "primary" },
  { name: "CENTURION", icon: <Medal className="w-4 h-4" />, color: "purple" },
  { name: "EARLY ADOPTER", icon: <Calendar className="w-4 h-4" />, color: "accent" },
];

const battleHistory = [
  { opponent: "CodeSamurai", result: "WIN", ratingChange: +15, time: "2 min ago", problem: "Two Sum", duration: "3:45" },
  { opponent: "ByteHunter", result: "WIN", ratingChange: +12, time: "15 min ago", problem: "Valid Parentheses", duration: "4:12" },
  { opponent: "AlgoMaster", result: "LOSS", ratingChange: -8, time: "1 hour ago", problem: "Merge Intervals", duration: "8:20" },
  { opponent: "NexusAlpha", result: "WIN", ratingChange: +18, time: "3 hours ago", problem: "Binary Search", duration: "2:15" },
  { opponent: "SyntaxNinja", result: "WIN", ratingChange: +14, time: "5 hours ago", problem: "Reverse LinkedList", duration: "5:03" },
  { opponent: "RecursionKing", result: "LOSS", ratingChange: -10, time: "1 day ago", problem: "Tree Traversal", duration: "9:45" },
];

const ratingHistory = [
  { month: "Sep", rating: 1450 },
  { month: "Oct", rating: 1520 },
  { month: "Nov", rating: 1610 },
  { month: "Dec", rating: 1580 },
  { month: "Jan", rating: 1720 },
  { month: "Feb", rating: 1847 },
];

const Profile = () => {
  const maxRating = Math.max(...ratingHistory.map((r) => r.rating));
  const minRating = Math.min(...ratingHistory.map((r) => r.rating));
  const winRate = Math.round((userProfile.wins / userProfile.totalBattles) * 100);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(var(--accent)/0.08)_0%,_transparent_50%)]" />
      <div className="fixed inset-0 grid-background opacity-20" />

      <main className="relative z-10 pt-24 pb-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Profile Card */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <GlassCard corners className="text-center">
                  {/* Avatar */}
                  <div className="w-28 h-28 mx-auto mb-4 rounded-sm bg-bg-tertiary border-2 border-accent/30 flex items-center justify-center text-6xl">
                    {userProfile.avatar}
                  </div>
                  
                  <h1 className="font-display font-bold text-3xl text-white tracking-wider mb-1">
                    {userProfile.username}
                  </h1>
                  
                  <div className="inline-block px-4 py-1 bg-accent/20 border border-accent/30 rounded-sm mb-4">
                    <span className="font-display text-sm text-accent tracking-wider">
                      {userProfile.rank}
                    </span>
                  </div>

                  {/* Rating */}
                  <div className="mb-6">
                    <div className="text-5xl font-display font-bold text-white">
                      <CountUp end={userProfile.rating} duration={1500} />
                    </div>
                    <div className="text-xs text-muted-foreground font-mono tracking-wider">ELO RATING</div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div>
                      <div className="text-2xl font-display font-bold text-success">
                        <CountUp end={userProfile.wins} duration={1500} />
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">WINS</div>
                    </div>
                    <div>
                      <div className="text-2xl font-display font-bold text-danger">
                        <CountUp end={userProfile.losses} duration={1500} />
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">LOSSES</div>
                    </div>
                    <div>
                      <div className="text-2xl font-display font-bold text-warning flex items-center justify-center gap-1">
                        <Flame className="w-5 h-5" />
                        <CountUp end={userProfile.streak} duration={1500} />
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">STREAK</div>
                    </div>
                  </div>

                  {/* Additional Stats */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-2 border-t border-accent/10">
                      <span className="text-muted-foreground">Win Rate</span>
                      <span className="text-success font-mono">{winRate}%</span>
                    </div>
                    <div className="flex justify-between py-2 border-t border-accent/10">
                      <span className="text-muted-foreground">Peak Rating</span>
                      <span className="text-accent font-mono">{userProfile.peakRating}</span>
                    </div>
                    <div className="flex justify-between py-2 border-t border-accent/10">
                      <span className="text-muted-foreground">Avg Solve Time</span>
                      <span className="text-white font-mono">{userProfile.avgSolveTime}</span>
                    </div>
                    <div className="flex justify-between py-2 border-t border-accent/10">
                      <span className="text-muted-foreground">Member Since</span>
                      <span className="text-white font-mono">{userProfile.joinDate}</span>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>

              {/* Badges */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <GlassCard>
                  <h3 className="font-display font-bold text-lg text-white mb-4 tracking-wider flex items-center gap-2">
                    <Award className="w-5 h-5 text-accent" />
                    ACHIEVEMENTS
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {badges.map((badge) => (
                      <div
                        key={badge.name}
                        className={`flex items-center gap-2 px-3 py-2 bg-${badge.color}/10 border border-${badge.color}/30 rounded-sm text-${badge.color}`}
                      >
                        {badge.icon}
                        <span className="text-xs font-mono">{badge.name}</span>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            </div>

            {/* Right Column - Rating & History */}
            <div className="lg:col-span-2 space-y-6">
              {/* Rating Chart */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <GlassCard corners>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-display font-bold text-lg text-white tracking-wider">
                        RATING HISTORY
                      </h3>
                      <p className="text-xs text-muted-foreground font-mono">
                        // Last 6 months performance
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-success">
                      <TrendingUp className="w-5 h-5" />
                      <span className="font-display font-bold">+397</span>
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="relative h-48">
                    {/* Grid lines */}
                    <div className="absolute inset-0 flex flex-col justify-between">
                      {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="border-t border-accent/10 w-full" />
                      ))}
                    </div>

                    {/* Bars */}
                    <div className="absolute inset-0 flex items-end justify-between gap-2 pt-4">
                      {ratingHistory.map((data, i) => {
                        const height =
                          ((data.rating - minRating) / (maxRating - minRating)) * 100;
                        return (
                          <motion.div
                            key={data.month}
                            initial={{ height: 0 }}
                            animate={{ height: `${height}%` }}
                            transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                            className="flex-1 flex flex-col items-center group"
                          >
                            <div
                              className="w-full rounded-t-sm bg-gradient-to-t from-accent to-purple relative cursor-pointer transition-all group-hover:from-accent-light group-hover:to-purple-light"
                              style={{ height: "100%" }}
                            >
                              {/* Tooltip */}
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="bg-background border border-accent/30 px-2 py-1 rounded-sm text-xs font-mono whitespace-nowrap">
                                  {data.rating} ELO
                                </div>
                              </div>
                            </div>
                            <span className="text-xs text-muted-foreground font-mono mt-2">
                              {data.month}
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>

              {/* Battle History */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <GlassCard>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display font-bold text-lg text-white tracking-wider flex items-center gap-2">
                      <Swords className="w-5 h-5 text-accent" />
                      BATTLE HISTORY
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {battleHistory.map((battle, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + i * 0.05 }}
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
                            <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
                              <span>{battle.problem}</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {battle.duration}
                              </span>
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
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
