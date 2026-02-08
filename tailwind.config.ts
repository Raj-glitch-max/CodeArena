import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        display: ["Orbitron", "monospace"],
        sans: ["Rajdhani", "system-ui", "sans-serif"],
        mono: ["Share Tech Mono", "monospace"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          dark: "hsl(var(--primary-dark))",
          light: "hsl(var(--primary-light))",
          foreground: "hsl(var(--primary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          dark: "hsl(var(--accent-dark))",
          light: "hsl(var(--accent-light))",
          foreground: "hsl(var(--accent-foreground))",
        },
        purple: {
          DEFAULT: "hsl(var(--purple))",
          dark: "hsl(var(--purple-dark))",
          light: "hsl(var(--purple-light))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        danger: {
          DEFAULT: "hsl(var(--danger))",
          dark: "hsl(var(--danger-dark))",
          light: "hsl(var(--danger-light))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          dark: "hsl(var(--success-dark))",
          light: "hsl(var(--success-light))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          dark: "hsl(var(--warning-dark))",
        },
        "bg-secondary": "hsl(var(--background-secondary))",
        "bg-tertiary": "hsl(var(--background-tertiary))",
        "bg-elevated": "hsl(var(--background-elevated))",
        "text-primary": "hsl(var(--foreground))",
        "text-secondary": "hsl(var(--foreground-secondary))",
        "text-muted": "hsl(var(--foreground-muted))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-glow-red": {
          "0%, 100%": {
            boxShadow: "0 0 10px hsl(var(--accent)), 0 0 20px hsl(var(--accent)), 0 0 30px hsl(var(--accent))",
          },
          "50%": {
            boxShadow: "0 0 20px hsl(var(--accent)), 0 0 40px hsl(var(--accent)), 0 0 60px hsl(var(--accent)), 0 0 80px hsl(var(--accent))",
          },
        },
        "grid-flow": {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "60px 60px" },
        },
        "slide-up": {
          from: { transform: "translateY(50px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "50%": { opacity: "0.3" },
          "100%": { transform: "translateY(100vh)", opacity: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "gradient-shift": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow-red": "pulse-glow-red 2s ease-in-out infinite",
        "grid-flow": "grid-flow 25s linear infinite",
        "slide-up": "slide-up 0.6s ease-out forwards",
        "fade-in": "fade-in 0.3s ease-out forwards",
        scan: "scan 4s linear infinite",
        float: "float 6s ease-in-out infinite",
        "gradient-shift": "gradient-shift 4s ease infinite",
        flicker: "flicker 3s ease-in-out infinite",
      },
      boxShadow: {
        "neon-cyan": "0 0 30px rgba(0, 229, 255, 0.6), 0 0 60px rgba(0, 229, 255, 0.3)",
        "neon-red": "0 0 30px rgba(255, 23, 68, 0.7), 0 0 60px rgba(255, 23, 68, 0.4)",
        "neon-purple": "0 0 30px rgba(176, 38, 255, 0.6)",
        "neon-green": "0 0 30px rgba(0, 255, 0, 0.6)",
        elevation: "0 20px 60px rgba(0, 0, 0, 0.7)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
