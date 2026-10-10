'use client';

import React, { useEffect, useRef } from 'react';

export default function SignalGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId = 0;
    let mouse = { x: -1000, y: -1000 };
    let width = 0;
    let height = 0;
    const gridSpacing = 40;
    const falloffRadius = 150;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    window.addEventListener('resize', resize);
    resize();

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    // Keep mouse tracking attached to window to catch everything
    window.addEventListener('mousemove', handleMouseMove);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const r_base = 190, g_base = 198, b_base = 188;
      const r_act = 76, g_act = 175, b_act = 130;

      for (let x = 0; x < width; x += gridSpacing) {
        for (let y = 0; y < height; y += gridSpacing) {
          const dx = mouse.x - x;
          const dy = mouse.y - y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          let intensity = 0;
          if (dist < falloffRadius) {
            intensity = 1 - Math.pow(dist / falloffRadius, 2); // Smooth quadratic falloff
          }

          // Interpolated color
          const r = r_base + (r_act - r_base) * intensity;
          const g = g_base + (g_act - g_base) * intensity;
          const b = b_base + (b_act - b_base) * intensity;
          const a = 0.018 + (0.045 * intensity);

          ctx.beginPath();
          ctx.arc(x, y, 1.1 + (0.2 * intensity), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    // Respect reduced motion: static fallback if preferred
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      // Just draw once with no mouse interaction
      mouse.x = -1000;
      mouse.y = -1000;
      draw();
      cancelAnimationFrame(animationFrameId);
    } else {
      draw();
    }

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ width: '100vw', height: '100vh', background: 'transparent' }}
    />
  );
}
