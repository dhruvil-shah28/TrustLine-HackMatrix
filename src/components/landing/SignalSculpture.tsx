'use client';

import React, { useEffect, useRef } from 'react';

export default function SignalSculpture() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let animationFrameId: number = 0;

    const resize = () => {
      // Calculate responsive dimensions based on container
      const parent = canvas.parentElement;
      if (parent) {
        width = parent.clientWidth;
        height = parent.clientHeight;
        canvas.width = width * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
    };

    window.addEventListener('resize', resize);
    resize();

    const mouse = { x: width / 2, y: height / 2, tx: width / 2, ty: height / 2 };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      // Only track if mouse is over or near the canvas
      mouse.tx = e.clientX - rect.left;
      mouse.ty = e.clientY - rect.top;
    };

    // Check if mouse left the window to reset
    const handleMouseLeave = () => {
      mouse.tx = width / 2;
      mouse.ty = height / 2;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    let time = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.005;

      // Smooth mouse interpolation
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;

      const mouseParallaxX = (mouse.x - width / 2) * 0.1;
      const mouseParallaxY = (mouse.y - height / 2) * 0.1;

      // Draw folded ribbon / Lissajous curves
      const numBands = 8;
      const pointsPerBand = 120;

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (let b = 0; b < numBands; b++) {
        const bandPhase = b * (Math.PI * 2) / numBands;

        ctx.beginPath();
        for (let p = 0; p <= pointsPerBand; p++) {
          const t = (p / pointsPerBand) * Math.PI * 2;

          const A = 0.5 * height;
          const knotX = Math.sin(t + time) + 2 * Math.sin(2 * t + time + bandPhase);
          const knotY = Math.cos(t + time) - 2 * Math.cos(2 * t + time + bandPhase);
          const knotZ = -Math.sin(3 * t + time * 1.5 + bandPhase);

          const scale = 300 / (300 - knotZ * 40);

          const projectedX = width / 2 + knotX * A * 0.3 * scale + mouseParallaxX * knotZ;
          const projectedY = height / 2 + knotY * A * 0.3 * scale + mouseParallaxY * knotZ;

          if (p === 0) {
            ctx.moveTo(projectedX, projectedY);
          } else {
            ctx.lineTo(projectedX, projectedY);
          }
        }

        const depthTone = Math.sin(time * 2 + bandPhase);
        let strokeColor = '';

        if (b % 4 === 0) {
          const alpha = 0.4 + 0.6 * depthTone;
          strokeColor = `rgba(232, 198, 106, ${Math.max(0.1, alpha)})`;
          ctx.lineWidth = 1.5;
        } else if (b % 2 === 0) {
          strokeColor = `rgba(76, 175, 130, ${Math.max(0.2, 0.4 + 0.2 * depthTone)})`;
          ctx.lineWidth = 2.5;
        } else {
          strokeColor = `rgba(14, 74, 45, ${Math.max(0.3, 0.6 + 0.3 * depthTone)})`;
          ctx.lineWidth = 4;
        }

        ctx.strokeStyle = strokeColor;
        ctx.stroke();
      }

      ctx.beginPath();
      const pt = (time * 5) % (Math.PI * 2);
      const hX = Math.sin(pt + time) + 2 * Math.sin(2 * pt + time);
      const hY = Math.cos(pt + time) - 2 * Math.cos(2 * pt + time);
      const hZ = -Math.sin(3 * pt + time * 1.5);
      const hScale = 300 / (300 - hZ * 40);

      const px = width / 2 + hX * (0.3 * height) * 0.3 * hScale + mouseParallaxX * hZ;
      const py = height / 2 + hY * (0.3 * height) * 0.3 * hScale + mouseParallaxY * hZ;

      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(232, 198, 106, 0.9)';
      ctx.shadowColor = 'rgba(232, 198, 106, 0.8)';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(draw);
    };

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Playback state evaluation for pausing loop
    const wrapperElement = canvas.closest('.signal-wrapper') || canvas.parentElement;
    let isIntersecting = true;
    let lastRenderState = !prefersReducedMotion;
    let explicitStop = prefersReducedMotion;

    const evaluatePlayState = () => {
      if (explicitStop) return;
      const opStr = wrapperElement ? window.getComputedStyle(wrapperElement).opacity : '1';
      const shouldPlay = isIntersecting && parseFloat(opStr) > 0;

      if (shouldPlay && !lastRenderState) {
        lastRenderState = true;
        animationFrameId = requestAnimationFrame(draw);
      } else if (!shouldPlay && lastRenderState) {
        lastRenderState = false;
        cancelAnimationFrame(animationFrameId);
      }
    };

    const observer = new IntersectionObserver((entries) => {
      isIntersecting = entries[0].isIntersecting;
      evaluatePlayState();
    }, { threshold: 0 });

    const mutObserver = new MutationObserver(evaluatePlayState);

    if (wrapperElement) {
      observer.observe(wrapperElement);
      mutObserver.observe(wrapperElement, { attributes: true, attributeFilter: ['style'] });
    }

    if (prefersReducedMotion) {
      draw();
      cancelAnimationFrame(animationFrameId);
    } else {
      draw();
    }

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      observer.disconnect();
      mutObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="w-full h-full relative" aria-hidden="true">
      <canvas
        ref={canvasRef}
        className="block w-full h-full absolute inset-0 pointer-events-none"
      />
    </div>
  );
}
