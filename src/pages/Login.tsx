import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import GlassCard from "@/components/shared/GlassCard";
import NeonButton from "@/components/shared/NeonButton";
import { Swords, Mail, Lock, Github, Chrome, ArrowRight, AlertCircle } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  if (isAuthenticated) {
    navigate("/dashboard");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.error || "Login failed");
    }
    
    setIsLoading(false);
  };

  const handleOAuthLogin = (provider: string) => {
    // For demo: Create a quick demo account
    setError(`${provider} login coming soon. Use email/password for now.`);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      {/* Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(var(--accent)/0.1)_0%,_transparent_60%)]" />
      <div className="fixed inset-0 grid-background opacity-20" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 flex items-center justify-center">
            <Swords className="w-8 h-8 text-accent" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-sm text-accent tracking-[0.2em] leading-none">
              CODE
            </span>
            <span className="font-display font-bold text-xs text-white/60 tracking-[0.15em] leading-none mt-0.5">
              ARENA
            </span>
          </div>
        </Link>

        <GlassCard corners className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-display font-bold text-3xl text-white tracking-wider mb-2">
              WELCOME BACK
            </h1>
            <p className="text-muted-foreground text-sm">
              Enter your credentials to access the arena
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-danger/10 border border-danger/30 rounded-sm flex items-center gap-2 text-danger text-sm"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-muted-foreground font-mono mb-2">
                EMAIL
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="warrior@codearena.com"
                  className="w-full pl-10 pr-4 py-3 bg-bg-tertiary border border-accent/10 rounded-sm text-white font-mono text-sm focus:outline-none focus:border-accent/30 transition-colors placeholder:text-muted-foreground/50"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-muted-foreground font-mono mb-2">
                PASSWORD
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-bg-tertiary border border-accent/10 rounded-sm text-white font-mono text-sm focus:outline-none focus:border-accent/30 transition-colors placeholder:text-muted-foreground/50"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-muted-foreground">
                <input type="checkbox" className="rounded-sm border-accent/30" />
                Remember me
              </label>
              <a href="#" className="text-accent hover:text-accent-light transition-colors">
                Forgot password?
              </a>
            </div>

            <NeonButton
              type="submit"
              variant="primary"
              className="w-full"
              glow
              disabled={isLoading}
              iconRight={<ArrowRight className="w-5 h-5" />}
            >
              {isLoading ? "Entering..." : "Enter Arena"}
            </NeonButton>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-accent/10" />
            <span className="text-muted-foreground text-xs font-mono">OR CONTINUE WITH</span>
            <div className="flex-1 h-px bg-accent/10" />
          </div>

          {/* OAuth Buttons */}
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => handleOAuthLogin("GitHub")}
              className="flex-1 py-3 glass-card flex items-center justify-center gap-2 text-muted-foreground hover:text-white hover:border-accent/30 transition-all"
            >
              <Github className="w-5 h-5" />
              <span className="font-display text-sm tracking-wider">GitHub</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => handleOAuthLogin("Google")}
              className="flex-1 py-3 glass-card flex items-center justify-center gap-2 text-muted-foreground hover:text-white hover:border-accent/30 transition-all"
            >
              <Chrome className="w-5 h-5" />
              <span className="font-display text-sm tracking-wider">Google</span>
            </motion.button>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-muted-foreground text-sm mt-6">
            New to the arena?{" "}
            <Link to="/signup" className="text-accent hover:text-accent-light transition-colors font-display tracking-wider">
              CREATE ACCOUNT
            </Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default Login;
