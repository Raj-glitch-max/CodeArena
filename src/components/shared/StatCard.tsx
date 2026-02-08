import { cn } from "@/lib/utils";
import CountUp from "./CountUp";
import { motion } from "framer-motion";

interface StatCardProps {
  icon: string;
  value: number;
  label: string;
  animated?: boolean;
  pulse?: boolean;
  className?: string;
  delay?: number;
  suffix?: string;
}

const StatCard = ({
  icon,
  value,
  label,
  animated = false,
  pulse = false,
  className,
  delay = 0,
  suffix = "",
}: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: delay / 1000 }}
      className={cn(
        "glass-card px-6 py-5 flex items-center gap-4 relative overflow-hidden group",
        pulse && "animate-pulse-glow-red",
        className
      )}
    >
      {/* Accent line */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-accent via-accent/50 to-transparent" />
      
      {/* Icon */}
      <span className="text-3xl relative z-10">{icon}</span>
      
      <div className="relative z-10">
        <div className="text-3xl font-bold font-display text-accent tracking-wider">
          {animated ? (
            <CountUp end={value} duration={2000} suffix={suffix} />
          ) : (
            `${value.toLocaleString()}${suffix}`
          )}
        </div>
        <div className="text-xs text-muted-foreground uppercase tracking-[0.2em] font-display">
          {label}
        </div>
      </div>

      {/* Hover glow effect */}
      <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
  );
};

export default StatCard;
