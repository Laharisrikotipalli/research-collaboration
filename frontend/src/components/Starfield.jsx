import { useEffect, useRef } from "react";

/**
 * Ambient, low-opacity starfield rendered behind the whole app.
 * Purely decorative — respects prefers-reduced-motion by freezing twinkle.
 */
export default function Starfield() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let stars = [];
    let frameId;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const count = Math.min(90, Math.floor((window.innerWidth * window.innerHeight) / 14000));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.1 + 0.3,
        phase: Math.random() * Math.PI * 2,
        speed: 0.008 + Math.random() * 0.012,
      }));
    }

    function draw(t) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((s) => {
        const twinkle = reduceMotion ? 0.6 : 0.4 + 0.4 * Math.sin(t * s.speed + s.phase);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201, 162, 39, ${twinkle * 0.55})`;
        ctx.fill();
      });
      frameId = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    frameId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none opacity-60 z-0"
      aria-hidden="true"
    />
  );
}
