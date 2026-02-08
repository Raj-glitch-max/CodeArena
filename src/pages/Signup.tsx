import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import GlassCard from "@/components/shared/GlassCard";
import NeonButton from "@/components/shared/NeonButton";
import { Swords, Mail, Lock, User, Github, Chrome, ArrowRight, Zap, AlertCircle, CheckCircle } from "lucide-react";

const Signup = () => {
  const navigate = useNavigate();
  const { signup, isAuthenticated } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Redirect if already logged in
  if (isAuthenticated) {
    navigate("/dashboard");
    return null;
  }

  const validatePassword = (pass: string) => {
    const checks = {
      length: pass.length >= 6,
      hasLetter: /[a-zA-Z]/.test(pass),
      hasNumber: /[0-9]/.test(pass),
    };
    return checks;
  };

  const passwordChecks = validatePassword(password);
  const isPasswordValid = Object.values(passwordChecks).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!agreedToTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!isPasswordValid) {
      setError("Password must be at least 6 characters with letters and numbers");
      return;
    }

    setIsLoading(true);

    const result = await signup(username, email, password);
    
    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.error || "Signup failed");
    }
    
    setIsLoading(false);
  };

  const handleOAuthSignup = (provider: string) => {
    setError(`${provider} signup coming soon. Use email/password for now.`);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
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
              JOIN THE ARENA
            </h1>
            <p className="text-muted-foreground text-sm">
              Create your warrior profile and start battling
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
                WARRIOR NAME
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ShadowBlade"
                  className="w-full pl-10 pr-4 py-3 bg-bg-tertiary border border-accent/10 rounded-sm text-white font-mono text-sm focus:outline-none focus:border-accent/30 transition-colors placeholder:text-muted-foreground/50"
                  required
                  disabled={isLoading}
                  minLength={3}
                  maxLength={20}
                />
              </div>
            </div>

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
              {/* Password Requirements */}
              {password && (
                <div className="mt-2 space-y-1">
                  {[
                    { check: passwordChecks.length, label: "At least 6 characters" },
                    { check: passwordChecks.hasLetter, label: "Contains a letter" },
                    { check: passwordChecks.hasNumber, label: "Contains a number" },
                  ].map((req, i) => (
                    <div key={i} className={`flex items-center gap-2 text-xs ${req.check ? "text-success" : "text-muted-foreground"}`}>
                      {req.check ? <CheckCircle className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-current" />}
                      {req.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm text-muted-foreground font-mono mb-2">
                CONFIRM PASSWORD
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-4 py-3 bg-bg-tertiary border rounded-sm text-white font-mono text-sm focus:outline-none transition-colors placeholder:text-muted-foreground/50 ${
                    confirmPassword && confirmPassword !== password
                      ? "border-danger/50 focus:border-danger"
                      : "border-accent/10 focus:border-accent/30"
                  }`}
                  required
                  disabled={isLoading}
                />
              </div>
              {confirmPassword && confirmPassword !== password && (
                <p className="text-danger text-xs mt-1">Passwords do not match</p>
              )}
            </div>

            <div className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 rounded-sm border-accent/30"
              />
              <label className="text-muted-foreground">
                I agree to the{" "}
                <a href="#" className="text-accent hover:text-accent-light transition-colors">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-accent hover:text-accent-light transition-colors">
                  Privacy Policy
                </a>
              </label>
            </div>

            <NeonButton
              type="submit"
              variant="primary"
              className="w-full"
              glow
              disabled={isLoading || !agreedToTerms || password !== confirmPassword || !isPasswordValid}
              icon={<Zap className="w-5 h-5" />}
              iconRight={<ArrowRight className="w-5 h-5" />}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
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
              onClick={() => handleOAuthSignup("GitHub")}
              className="flex-1 py-3 glass-card flex items-center justify-center gap-2 text-muted-foreground hover:text-white hover:border-accent/30 transition-all"
            >
              <Github className="w-5 h-5" />
              <span className="font-display text-sm tracking-wider">GitHub</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => handleOAuthSignup("Google")}
              className="flex-1 py-3 glass-card flex items-center justify-center gap-2 text-muted-foreground hover:text-white hover:border-accent/30 transition-all"
            >
              <Chrome className="w-5 h-5" />
              <span className="font-display text-sm tracking-wider">Google</span>
            </motion.button>
          </div>

          {/* Login Link */}
          <p className="text-center text-muted-foreground text-sm mt-6">
            Already a warrior?{" "}
            <Link to="/login" className="text-accent hover:text-accent-light transition-colors font-display tracking-wider">
              ENTER ARENA
            </Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default Signup;
