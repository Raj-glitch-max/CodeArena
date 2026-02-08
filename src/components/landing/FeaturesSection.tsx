import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import GlassCard from "../shared/GlassCard";
import { Swords, Trophy, Zap, Code, Users, Clock, Terminal, Cpu } from "lucide-react";

const features = [
  {
    icon: <Swords className="w-7 h-7" />,
    title: "Real-Time Battles",
    description:
      "Face opponents in live 1v1 or group coding battles with instant matchmaking",
    color: "accent",
    jp: "戦闘",
  },
  {
    icon: <Trophy className="w-7 h-7" />,
    title: "ELO Rankings",
    description:
      "Climb the global leaderboard with Chess.com-style competitive ratings",
    color: "warning",
    jp: "順位",
  },
  {
    icon: <Terminal className="w-7 h-7" />,
    title: "Live Execution",
    description:
      "Lightning-fast code execution with Docker-powered secure sandboxes",
    color: "success",
    jp: "実行",
  },
  {
    icon: <Code className="w-7 h-7" />,
    title: "Multi-Language",
    description:
      "Battle in Python, JavaScript, C++, Java and more with full IDE support",
    color: "primary",
    jp: "言語",
  },
  {
    icon: <Users className="w-7 h-7" />,
    title: "Team Battles",
    description:
      "Compete in 2v2 or 4-player FFA tournaments with friends or randoms",
    color: "purple",
    jp: "仲間",
  },
  {
    icon: <Cpu className="w-7 h-7" />,
    title: "AI Challenges",
    description:
      "Test your skills against our advanced AI opponents at various difficulty levels",
    color: "accent",
    jp: "挑戦",
  },
];

const getColorClass = (color: string) => {
  const colors: Record<string, string> = {
    accent: "text-accent",
    warning: "text-warning",
    primary: "text-primary",
    success: "text-success",
    purple: "text-purple",
    danger: "text-danger",
  };
  return colors[color] || "text-accent";
};

const getGlowClass = (color: string) => {
  const glows: Record<string, string> = {
    accent: "group-hover:shadow-neon-red",
    warning: "group-hover:shadow-[0_0_30px_rgba(255,214,0,0.3)]",
    primary: "group-hover:shadow-neon-cyan",
    success: "group-hover:shadow-neon-green",
    purple: "group-hover:shadow-neon-purple",
    danger: "group-hover:shadow-neon-red",
  };
  return glows[color] || "group-hover:shadow-neon-red";
};

const FeaturesSection = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className="py-24 relative overflow-hidden" ref={ref}>
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(var(--accent)/0.05)_0%,_transparent_50%)]" />
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="font-mono text-accent text-sm tracking-[0.3em]">
              // FEATURES
            </span>
          </div>
          <h2 className="font-display font-bold text-4xl md:text-5xl mb-4 tracking-wider">
            <span className="text-white">WHY </span>
            <span className="text-gradient">CODE ARENA</span>
            <span className="text-white">?</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to become an elite competitive coder, 
            all in one platform.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <GlassCard
                hover
                tilt
                corners
                className={`h-full transition-all duration-500 ${getGlowClass(feature.color)}`}
              >
                {/* Japanese text */}
                <div className="absolute top-4 right-4 text-3xl font-bold text-accent/10">
                  {feature.jp}
                </div>

                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-sm bg-bg-tertiary flex items-center justify-center mb-5 ${getColorClass(
                    feature.color
                  )} border border-current/20 group-hover:scale-110 transition-transform duration-300`}
                >
                  {feature.icon}
                </div>

                {/* Title */}
                <h3 className="font-display font-bold text-xl text-white mb-3 tracking-wider">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>

                {/* Bottom accent line */}
                <div className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-30 transition-opacity ${getColorClass(feature.color)}`} />
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
