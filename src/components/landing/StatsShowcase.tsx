import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import GlassCard from "../shared/GlassCard";
import CountUp from "../shared/CountUp";
import { BarChart3, TrendingUp, Zap, Target, Flame, Award } from "lucide-react";

const stats = [
  { 
    label: "Total Battles", 
    value: 2847, 
    icon: <Zap className="w-5 h-5" />, 
    change: "+127 this week",
    color: "accent" 
  },
  { 
    label: "Win Rate", 
    value: 68, 
    suffix: "%", 
    icon: <Target className="w-5 h-5" />, 
    change: "+5% from last month",
    color: "success" 
  },
  { 
    label: "Current Streak", 
    value: 12, 
    icon: <Flame className="w-5 h-5" />, 
    change: "Personal best!",
    color: "warning" 
  },
  { 
    label: "Global Rank", 
    value: 847, 
    prefix: "#", 
    icon: <Award className="w-5 h-5" />, 
    change: "Top 5%",
    color: "purple" 
  },
];

const ratingHistory = [
  { month: "Jan", rating: 1200 },
  { month: "Feb", rating: 1350 },
  { month: "Mar", rating: 1420 },
  { month: "Apr", rating: 1380 },
  { month: "May", rating: 1520 },
  { month: "Jun", rating: 1650 },
  { month: "Jul", rating: 1780 },
  { month: "Aug", rating: 1920 },
];

const maxRating = Math.max(...ratingHistory.map((r) => r.rating));
const minRating = Math.min(...ratingHistory.map((r) => r.rating));

const StatsShowcase = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <section className="py-24 relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(var(--purple)/0.08)_0%,_transparent_50%)]" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <BarChart3 className="w-6 h-6 text-purple" />
            <span className="font-mono text-purple text-sm tracking-[0.3em]">
              // PERFORMANCE ANALYTICS
            </span>
          </div>
          <h2 className="font-display font-bold text-4xl md:text-5xl mb-4 tracking-wider">
            <span className="text-white">TRACK YOUR </span>
            <span className="text-gradient-cyan">PROGRESS</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Comprehensive analytics to monitor your growth, identify weaknesses,
            and dominate the competition.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Stats Cards */}
          <div className="lg:col-span-1 space-y-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, x: -30 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: i * 0.1 }}
              >
                <GlassCard hover className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-sm bg-${stat.color}/10 border border-${stat.color}/30 flex items-center justify-center text-${stat.color}`}
                  >
                    {stat.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                      {stat.label}
                    </div>
                    <div className="text-2xl font-display font-bold text-white">
                      {stat.prefix}
                      <CountUp end={stat.value} duration={2000} />
                      {stat.suffix}
                    </div>
                  </div>
                  <div className="text-xs text-success font-mono">
                    {stat.change}
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          {/* Rating Chart */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <GlassCard corners className="h-full">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-display font-bold text-lg text-white tracking-wider">
                    RATING HISTORY
                  </h3>
                  <p className="text-xs text-muted-foreground font-mono">
                    // Last 8 months performance
                  </p>
                </div>
                <div className="flex items-center gap-2 text-success">
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-display font-bold">+720</span>
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
                        animate={inView ? { height: `${height}%` } : {}}
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

              {/* Current Rating */}
              <div className="mt-6 flex items-center justify-between">
                <div>
                  <span className="text-muted-foreground text-sm">Current Rating</span>
                  <div className="text-3xl font-display font-bold text-accent">
                    <CountUp end={1920} duration={2000} />
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-muted-foreground text-sm">Rank Badge</span>
                  <div className="text-xl font-display font-bold text-purple">
                    DIAMOND III
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default StatsShowcase;
