import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import GlassCard from "@/components/shared/GlassCard";
import {
  Trophy, TrendingUp, Crown, Medal, Flame, Search,
  ChevronLeft, ChevronRight, Filter
} from "lucide-react";
import { getLeaderboard, LeaderboardEntry } from "../services/ratingApi";

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="w-6 h-6 text-warning" />;
    case 2:
      return <Medal className="w-5 h-5 text-muted-foreground" />;
    case 3:
      return <Medal className="w-5 h-5 text-warning-dark" />;
    default:
      return <span className="text-muted-foreground font-mono text-lg">#{rank}</span>;
  }
};

const getBadgeColor = (badge: string) => {
  const badgeUpper = badge.toUpperCase();
  switch (badgeUpper) {
    case "GRANDMASTER":
      return "bg-accent/20 text-accent border-accent/30";
    case "MASTER":
      return "bg-purple/20 text-purple border-purple/30";
    case "DIAMOND":
      return "bg-primary/20 text-primary border-primary/30";
    case "PLATINUM":
      return "bg-muted text-white border-muted-foreground/30";
    case "GOLD":
      return "bg-warning/20 text-warning border-warning/30";
    case "SILVER":
      return "bg-muted text-muted-foreground border-muted-foreground/30";
    case "BRONZE":
      return "bg-warning-dark/20 text-warning-dark border-warning-dark/30";
    default:
      return "bg-muted text-muted-foreground border-muted-foreground/30";
  }
};

const Leaderboard = () => {
  const [allPlayers, setAllPlayers] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const playersPerPage = 10;

  useEffect(() => {
    loadLeaderboard();
    // Refresh every minute
    const interval = setInterval(loadLeaderboard, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getLeaderboard(100, 0);
      setAllPlayers(data);
    } catch (err) {
      setError('Failed to load leaderboard');
      console.error('Leaderboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlayers = allPlayers.filter((player) =>
    player.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPlayers.length / playersPerPage);
  const startIndex = (currentPage - 1) * playersPerPage;
  const displayedPlayers = filteredPlayers.slice(startIndex, startIndex + playersPerPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Trophy className="w-16 h-16 text-accent mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground font-mono">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-danger mb-4">{error}</p>
          <button
            onClick={loadLeaderboard}
            className="px-4 py-2 bg-accent text-white rounded-sm hover:bg-accent/80"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(var(--accent)/0.08)_0%,_transparent_50%)]" />
      <div className="fixed inset-0 grid-background opacity-20" />

      <main className="relative z-10 pt-24 pb-16 px-6">
        <div className="container mx-auto max-w-5xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-accent" />
              <Trophy className="w-8 h-8 text-accent" />
              <div className="w-16 h-[1px] bg-gradient-to-l from-transparent to-accent" />
            </div>
            <h1 className="font-display font-bold text-4xl md:text-5xl text-white mb-2 tracking-wider">
              GLOBAL RANKINGS
            </h1>
            <p className="text-muted-foreground font-mono text-sm tracking-wider">
              // TOP WARRIORS • REAL-TIME STANDINGS
            </p>
          </motion.div>

          {/* Search & Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <GlassCard className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search warriors..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 bg-bg-tertiary border border-accent/10 rounded-sm text-white font-mono text-sm focus:outline-none focus:border-accent/30 transition-colors"
                />
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-sm font-mono">
                <Filter className="w-4 h-4" />
                <span>{filteredPlayers.length} warriors</span>
              </div>
            </GlassCard>
          </motion.div>

          {/* Header Row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="glass-card px-6 py-3 mb-4 flex items-center justify-between text-xs font-mono text-muted-foreground tracking-wider uppercase"
          >
            <div className="flex items-center gap-4">
              <span className="w-12">Rank</span>
              <span>Warrior</span>
            </div>
            <div className="flex items-center gap-8">
              <span className="hidden sm:block w-20 text-right">Rating</span>
              <span className="hidden sm:block w-16 text-right">W/L</span>
              <span className="w-16 text-right">Win%</span>
            </div>
          </motion.div>

          {/* Player Rows */}
          <div className="space-y-3 mb-8">
            {displayedPlayers.map((player, index) => (
              <motion.div
                key={player.username}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
              >
                <GlassCard
                  hover
                  className={`flex items-center justify-between py-4 ${player.position <= 3 ? "border-accent/30" : ""
                    }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="w-12 h-12 flex items-center justify-center">
                      {getRankIcon(player.position)}
                    </div>

                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-sm bg-bg-tertiary flex items-center justify-center text-2xl border border-accent/10">
                      {player.username.charAt(0).toUpperCase()}
                    </div>

                    {/* Player Info */}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-bold text-lg text-white tracking-wider">
                          {player.username}
                        </h3>
                        {player.position === 1 && <Flame className="w-4 h-4 text-accent animate-pulse" />}
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-sm border font-mono ${getBadgeColor(player.rank)}`}>
                        {player.rank.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-8">
                    {/* Rating */}
                    <div className="hidden sm:block text-right w-20">
                      <div className="font-display font-bold text-xl text-accent">
                        {player.rating}
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">ELO</p>
                    </div>

                    {/* W/L */}
                    <div className="hidden sm:block text-right w-16">
                      <div className="font-display font-bold text-lg text-white">
                        {player.wins}/{player.losses}
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">W/L</p>
                    </div>

                    {/* Change - Show win rate instead */}
                    <div className="flex items-center gap-1 w-16 justify-end text-success">
                      <span className="font-mono font-bold">
                        {player.winRate}%
                      </span>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center gap-4"
            >
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 glass-card hover:border-accent/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5 text-muted-foreground" />
              </button>
              <span className="font-mono text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 glass-card hover:border-accent/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Leaderboard;
