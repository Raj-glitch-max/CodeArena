import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import NeonButton from "../shared/NeonButton";
import { ArrowRight, Zap, Facebook, Youtube, Chrome } from "lucide-react";
import heroSamurai from "@/assets/hero-samurai.png";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Dark Background with Gradient */}
      <div className="absolute inset-0 bg-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(var(--accent)/0.08)_0%,_transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_hsl(var(--accent)/0.15)_0%,_transparent_50%)]" />
      
      {/* Brush Stroke Text Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <motion.h1 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 0.06, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.3 }}
          className="font-display font-black text-[20vw] leading-none text-white whitespace-nowrap select-none"
          style={{ 
            fontStyle: 'italic',
            letterSpacing: '-0.05em'
          }}
        >
          CODE ARENA
        </motion.h1>
      </div>

      {/* Hero Samurai Image - Centered */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.5 }}
        className="absolute inset-0 flex items-end justify-center pointer-events-none"
      >
        <img
          src={heroSamurai}
          alt="Cyber Samurai"
          className="h-[85vh] object-contain object-bottom"
        />
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </motion.div>

      {/* Stats - Bottom Left */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="absolute bottom-12 left-8 md:left-16 z-20 flex gap-8"
      >
        <div>
          <div className="font-display font-bold text-4xl md:text-5xl text-white">
            50K<span className="text-accent">+</span>
          </div>
          <div className="text-sm text-muted-foreground tracking-wider uppercase">
            Warriors
          </div>
        </div>
        <div>
          <div className="font-display font-bold text-4xl md:text-5xl text-white">
            1M<span className="text-accent">+</span>
          </div>
          <div className="text-sm text-muted-foreground tracking-wider uppercase">
            Battles Fought
          </div>
        </div>
      </motion.div>

      {/* Social Icons - Bottom Right */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="absolute bottom-12 right-8 md:right-16 z-20 flex gap-3"
      >
        {[Facebook, Youtube, Chrome].map((Icon, i) => (
          <motion.a
            key={i}
            href="#"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <Icon className="w-5 h-5" />
          </motion.a>
        ))}
      </motion.div>

      {/* CTA Button - Top Right Area */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="absolute top-28 right-8 md:right-16 z-20"
      >
        <Link to="/dashboard">
          <NeonButton
            variant="primary"
            size="lg"
            glow
            icon={<Zap className="w-5 h-5" />}
            iconRight={<ArrowRight className="w-5 h-5" />}
          >
            Enter Arena
          </NeonButton>
        </Link>
      </motion.div>

      {/* Floating Japanese Characters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute top-1/3 left-8 md:left-16 text-6xl md:text-8xl font-bold text-accent/20 select-none"
      >
        武士
      </motion.div>

      {/* Red accent particles */}
      <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-accent rounded-full animate-pulse" />
      <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-accent rounded-full animate-pulse delay-300" />
      <div className="absolute bottom-1/3 left-1/4 w-1.5 h-1.5 bg-accent rounded-full animate-pulse delay-500" />
    </section>
  );
};

export default HeroSection;
