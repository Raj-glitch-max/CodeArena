import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  char?: string;
}

const ParticleBackground = ({ 
  count = 50, 
  showCode = false 
}: { 
  count?: number; 
  showCode?: boolean;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const particles: Particle[] = [];
    const colors = ["#FF1744", "#00E5FF", "#B026FF"];
    const codeChars = ["0", "1", "{", "}", "(", ")", ";", "=", "<", ">", "/"];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: showCode ? Math.random() * 1 + 0.5 : (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.4 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
        char: showCode ? codeChars[Math.floor(Math.random() * codeChars.length)] : undefined,
      });
    }

    const animate = () => {
      ctx.fillStyle = "rgba(5, 10, 20, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        if (showCode && particle.char) {
          ctx.font = `${12 + particle.size * 2}px "Share Tech Mono", monospace`;
          ctx.fillStyle = particle.color;
          ctx.globalAlpha = particle.opacity;
          ctx.fillText(particle.char, particle.x, particle.y);
        } else {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = particle.color;
          ctx.globalAlpha = particle.opacity;
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      });

      // Draw connections (only for regular particles)
      if (!showCode) {
        particles.forEach((p1, i) => {
          particles.slice(i + 1).forEach((p2) => {
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 120) {
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = "#FF1744";
              ctx.globalAlpha = (1 - distance / 120) * 0.15;
              ctx.lineWidth = 0.5;
              ctx.stroke();
              ctx.globalAlpha = 1;
            }
          });
        });
      }

      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [count, showCode]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};

export default ParticleBackground;
