import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ReactNode, ButtonHTMLAttributes, forwardRef } from "react";

interface NeonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "success" | "ghost";
  glow?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  size?: "sm" | "md" | "lg";
}

const NeonButton = forwardRef<HTMLButtonElement, NeonButtonProps>(({
  children,
  variant = "primary",
  glow = false,
  icon,
  iconRight,
  disabled = false,
  className,
  size = "md",
  onClick,
  type = "button",
  ...props
}, ref) => {
  const variantStyles = {
    primary:
      "bg-gradient-to-r from-accent to-accent-dark text-white font-bold border border-accent/50 hover:shadow-neon-red",
    secondary:
      "bg-bg-elevated/50 border border-accent/30 text-accent font-bold hover:bg-bg-tertiary hover:border-accent/60",
    danger:
      "bg-gradient-to-r from-danger to-danger-dark text-white font-bold hover:shadow-neon-red",
    success:
      "bg-gradient-to-r from-success to-success-dark text-background font-bold hover:shadow-neon-green",
    ghost:
      "bg-transparent border border-accent/20 text-foreground hover:border-accent/50 hover:text-accent",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: disabled ? 1 : 1.02, y: disabled ? 0 : -2 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={cn(
        "relative rounded-sm transition-all duration-300 flex items-center gap-3 justify-center font-display tracking-wider uppercase overflow-hidden group",
        variantStyles[variant],
        sizes[size],
        glow && "animate-pulse-glow-red",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      disabled={disabled}
      onClick={onClick}
      type={type}
      {...(props as any)}
    >
      {/* Animated background shine */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      
      {icon && <span className="text-lg relative z-10">{icon}</span>}
      <span className="relative z-10">{children}</span>
      {iconRight && <span className="text-lg relative z-10">{iconRight}</span>}
    </motion.button>
  );
});

NeonButton.displayName = "NeonButton";

export default NeonButton;