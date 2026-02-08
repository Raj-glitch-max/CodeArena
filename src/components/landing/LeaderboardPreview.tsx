import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import GlassCard from "../shared/GlassCard";
import { Trophy, TrendingUp, Crown, Medal, Flame } from "lucide-react";

const mockPlayers = [
  { rank: 1, username: "NexusAlpha", rating: 2847, wins: 234, change: 12, avatar: "🦊", badge: "MASTER" },
  { rank: 2, username: "CodeSamurai", rating: 2756, wins: 198, change: 8, avatar: "⚔️", badge: "DIAMOND" },
  { rank: 3, username: "ByteHunter", rating: 2698, wins: 187, change: -3, avatar: "🐉", badge: "DIAMOND" },
  { rank: 4, username: "AlgoMaster", rating: 2645, wins: 176, change: 15, avatar: "🎯", badge: "PLATINUM" },
  { rank: 5, username: "SyntaxNinja", rating: 2589, wins: 165, change: 5, avatar: "🥷", badge: "PLATINUM" },
];

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
  switch (badge) {
    case "MASTER":
      return "bg-accent/20 text-accent border-accent/30";
    case "DIAMOND":
      return "bg-primary/20 text-primary border-primary/30";
    case "PLATINUM":
      return "bg-purple/20 text-purple border-purple/30";
    default:
      return "bg-muted text-muted-foreground border-muted-foreground/30";
  }
};

const LeaderboardPreview = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className="py-24 relative overflow-hidden" ref={ref} id="leaderboard">
      {/* Background accents */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-accent" />
            <Trophy className="w-8 h-8 text-accent" />
            <div className="w-16 h-[1px] bg-gradient-to-l from-transparent to-accent" />
          </div>
          <h2 className="font-display font-bold text-4xl md:text-5xl text-white mb-2 tracking-wider">
            TOP WARRIORS
          </h2>
          <p className="text-muted-foreground font-mono text-sm tracking-wider">
            // GLOBAL RANKINGS • UPDATED IN REAL-TIME
          </p>
        </motion.div>

        {/* Leaderboard Table */}
        <div className="max-w-4xl mx-auto">
          {/* Header Row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            className="glass-card px-6 py-3 mb-4 flex items-center justify-between text-xs font-mono text-muted-foreground tracking-wider uppercase"
          >
            <div className="flex items-center gap-4">
              <span className="w-12">Rank</span>
              <span>Warrior</span>
            </div>
            <div className="flex items-center gap-8">
              <span className="hidden sm:block w-20 text-right">Rating</span>
              <span className="hidden sm:block w-16 text-right">Wins</span>
              <span className="w-16 text-right">24h</span>
            </div>
          </motion.div>

          {/* Player Rows */}
          <div className="space-y-3">
            {mockPlayers.map((player, index) => (
              <motion.div
                key={player.username}
                initial={{ opacity: 0, x: -50 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <GlassCard
                  hover
                  tilt
                  className={`flex items-center justify-between py-4 ${
                    player.rank === 1 ? "border-accent/30" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="w-12 h-12 flex items-center justify-center">
                      {getRankIcon(player.rank)}
                    </div>

                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-sm bg-bg-tertiary flex items-center justify-center text-2xl border border-accent/10">
                      {player.avatar}
                    </div>

                    {/* Player Info */}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-bold text-lg text-white tracking-wider">
                          {player.username}
                        </h3>
                        {player.rank === 1 && <Flame className="w-4 h-4 text-accent animate-pulse" />}
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-sm border font-mono ${getBadgeColor(player.badge)}`}>
                        {player.badge}
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

                    {/* Wins */}
                    <div className="hidden sm:block text-right w-16">
                      <div className="font-display font-bold text-lg text-white">
                        {player.wins}
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">WINS</p>
                    </div>

                    {/* Change */}
                    <div
                      className={`flex items-center gap-1 w-16 justify-end ${
                        player.change > 0 ? "text-success" : "text-danger"
                      }`}
                    >
                      <TrendingUp
                        className={`w-4 h-4 ${
                          player.change < 0 ? "rotate-180" : ""
                        }`}
                      />
                      <span className="font-mono font-bold">
                        {player.change > 0 ? "+" : ""}
                        {player.change}
                      </span>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          {/* View All Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-center mt-8"
          >
            <button className="text-accent font-display font-medium hover:text-accent-light transition-colors flex items-center gap-2 mx-auto tracking-wider text-sm uppercase">
              View Full Leaderboard
              <TrendingUp className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LeaderboardPreview;
