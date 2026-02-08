import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Link } from "react-router-dom";
import NeonButton from "../shared/NeonButton";
import { ArrowRight, Github, Chrome, Zap, Shield, Users } from "lucide-react";

const CTASection = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className="py-32 relative overflow-hidden" ref={ref}>
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute inset-0 grid-background opacity-30" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Japanese accent */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-6xl font-bold text-accent/20 mb-6"
          >
            参加
          </motion.div>

          {/* Heading */}
          <h2 className="font-display font-black text-4xl md:text-5xl lg:text-6xl mb-6 tracking-wider">
            <span className="text-white">Ready to </span>
            <span className="text-gradient">Fight?</span>
          </h2>

          {/* Description */}
          <p className="text-muted-foreground text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of elite developers competing daily. Sign up in seconds 
            and start your journey to the top of the arena.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/signup">
              <NeonButton
                variant="primary"
                size="lg"
                glow
                icon={<Zap className="w-5 h-5" />}
                iconRight={<ArrowRight className="w-5 h-5" />}
              >
                Create Free Account
              </NeonButton>
            </Link>
          </div>

          {/* OAuth Options */}
          <div className="flex flex-col items-center gap-4 mb-16">
            <p className="text-muted-foreground text-sm font-mono tracking-wider">
              // OR CONTINUE WITH
            </p>
            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="glass-card px-6 py-3 flex items-center gap-3 text-muted-foreground hover:text-white hover:border-accent/30 transition-all duration-300 group"
              >
                <Github className="w-5 h-5 group-hover:text-accent transition-colors" />
                <span className="font-display text-sm tracking-wider">GitHub</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="glass-card px-6 py-3 flex items-center gap-3 text-muted-foreground hover:text-white hover:border-accent/30 transition-all duration-300 group"
              >
                <Chrome className="w-5 h-5 group-hover:text-accent transition-colors" />
                <span className="font-display text-sm tracking-wider">Google</span>
              </motion.button>
            </div>
          </div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-8"
          >
            <div className="flex items-center gap-3 glass-card px-4 py-2">
              <Shield className="w-5 h-5 text-success" />
              <span className="text-sm text-muted-foreground">Secure Sandboxing</span>
            </div>
            <div className="flex items-center gap-3 glass-card px-4 py-2">
              <Zap className="w-5 h-5 text-warning" />
              <span className="text-sm text-muted-foreground">99.9% Uptime</span>
            </div>
            <div className="flex items-center gap-3 glass-card px-4 py-2">
              <Users className="w-5 h-5 text-accent" />
              <span className="text-sm text-muted-foreground">50K+ Warriors</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
