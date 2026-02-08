import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import NeonButton from "@/components/shared/NeonButton";
import GlitchText from "@/components/shared/GlitchText";
import ParticleBackground from "@/components/shared/ParticleBackground";
import { Home, Swords } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 grid-background opacity-30" />
      <div className="noise-overlay" />
      <ParticleBackground count={30} />
      
      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(var(--accent)/0.1)_0%,_transparent_50%)]" />
      
      <div className="relative z-10 text-center px-6">
        {/* Japanese */}
        <div className="text-6xl font-bold text-accent/20 mb-4">迷子</div>
        
        <h1 className="font-display font-black text-8xl md:text-9xl mb-4">
          <GlitchText text="404" className="text-gradient" />
        </h1>
        
        <p className="font-display text-xl md:text-2xl text-muted-foreground mb-2 tracking-wider">
          BATTLE NOT FOUND
        </p>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto font-mono text-sm">
          // This arena doesn't exist. Return to the battlefield.
        </p>
        
        <Link to="/">
          <NeonButton variant="primary" icon={<Swords className="w-5 h-5" />}>
            Return to Arena
          </NeonButton>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
