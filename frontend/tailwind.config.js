/****/ // no comments
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        neon: {
          cyan: "#00F5FF",
          magenta: "#FF00FF",
          purple: "#7A00FF",
          lime: "#C7F54A"
        }
      },
      boxShadow: {
        glow: "0 0 20px rgba(0, 245, 255, 0.3)",
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.37)"
      },
      backdropBlur: {
        xs: "2px"
      }
    }
  },
  plugins: []
}
