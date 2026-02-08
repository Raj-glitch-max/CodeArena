import { cn } from "@/lib/utils";
import { ReactNode, useRef, useState } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  tilt?: boolean;
  maxTilt?: number;
  corners?: boolean;
}

const GlassCard = ({
  children,
  className,
  hover = false,
  glow = false,
  tilt = false,
  maxTilt = 10,
  corners = false,
}: GlassCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tiltStyle, setTiltStyle] = useState({ transform: "", transition: "" });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tilt || !cardRef.current) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const tiltX = ((y - centerY) / centerY) * -maxTilt;
    const tiltY = ((x - centerX) / centerX) * maxTilt;

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`,
      transition: "transform 0.1s ease-out",
    });
  };

  const handleMouseLeave = () => {
    if (!tilt) return;
    setTiltStyle({
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
      transition: "transform 0.5s ease-out",
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={tilt ? tiltStyle : undefined}
      className={cn(
        "glass-card p-6 relative",
        hover && "glass-card-hover",
        glow && "animate-pulse-glow-red",
        corners && "cyber-corners",
        className
      )}
    >
      {children}
    </div>
  );
};

export default GlassCard;
