'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

export default function TraceDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const performAnimation = (prefersReduced: boolean = false) => {
    if (!svgRef.current) return;

    // elements
    const arrAB = svgRef.current.querySelector('.arr-ab');
    const arrBC = svgRef.current.querySelector('.arr-bc');
    const arrCA = svgRef.current.querySelector('.arr-ca');
    const timeFill = svgRef.current.querySelector('.time-fill');
    const dashLink = svgRef.current.querySelector('.dash-link');

    const ringNodes = svgRef.current.querySelectorAll('.ring-elem');
    const tag = svgRef.current.querySelector('.alert-tag');
    const linkLabel = svgRef.current.querySelector('.link-label');
    const ringArrows = svgRef.current.querySelectorAll('.ring-arrow');

    if (tlRef.current) tlRef.current.kill();

    if (prefersReduced) {
      gsap.set([arrAB, arrBC, arrCA, dashLink], { strokeDashoffset: 0 });
      gsap.set(timeFill, { scaleX: 1 });
      gsap.set(ringNodes, { stroke: '#B8432F', color: '#B8432F' });
      gsap.set(ringArrows, { fill: '#B8432F' });
      gsap.set([tag, linkLabel], { opacity: 1 });
      gsap.set(dashLink, { stroke: '#B8432F' });
      return;
    }

    // Initialize state
    gsap.set([arrAB, arrBC, arrCA, dashLink], { strokeDasharray: 200, strokeDashoffset: 200 });
    gsap.set(timeFill, { scaleX: 0, transformOrigin: 'left center' });
    gsap.set(ringNodes, { stroke: '#83E0C9', color: '#83E0C9' });
    gsap.set(ringArrows, { fill: '#83E0C9' });
    gsap.set([tag, linkLabel], { opacity: 0 });
    gsap.set(dashLink, { stroke: '#C4CECD' });

    const tl = gsap.timeline({
      onStart: () => setIsPlaying(true),
      onComplete: () => setIsPlaying(false)
    });

    // 0.5s each for A -> B -> C -> A
    tl.to(arrAB, { strokeDashoffset: 0, duration: 0.5, ease: 'power1.inOut' })
      .to(arrBC, { strokeDashoffset: 0, duration: 0.5, ease: 'power1.inOut' })
      .to(arrCA, { strokeDashoffset: 0, duration: 0.5, ease: 'power1.inOut' }, '+=0');

    // Timeline syncs with the flow (1.5s total)
    tl.to(timeFill, { scaleX: 1, duration: 1.5, ease: 'none' }, 0);

    // Turn vermilion and show tag
    tl.to(ringNodes, { stroke: '#B8432F', color: '#B8432F', duration: 0.3 }, '+=0.2')
      .to(ringArrows, { fill: '#B8432F', duration: 0.3 }, '<')
      .to(tag, { opacity: 1, duration: 0.3 }, '<');

    // Draw dashed access log link
    tl.to(dashLink, { strokeDashoffset: 0, duration: 0.4, ease: 'power2.out', stroke: '#B8432F' }, '+=0.2')
      .to(linkLabel, { opacity: 1, duration: 0.3 }, '<0.2');

    tlRef.current = tl;
  };

  useEffect(() => {
    let ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        performAnimation(true);
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Reset initial
        performAnimation(true); // default to full just in case then override

        const tl = ScrollTrigger.create({
          trigger: containerRef.current,
          start: "top 60%",
          once: true,
          onEnter: () => {
            performAnimation(false);
          }
        });

        return () => tl.kill();
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="w-full py-24 pb-32" style={{ backgroundColor: '#203234' }}>
      <div className="max-w-[1280px] mx-auto px-4 lg:px-8">

        <div className="mb-16 max-w-[700px]">
          <div
            className="lp-font-mono uppercase mb-4"
            style={{ fontSize: '11px', letterSpacing: '0.12em', color: '#83E0C9' }}
          >
            HOW A TRAIL IS TRACED / DEMO SCENARIO
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4 lp-font-display" style={{ color: '#83E0C9' }}>
            One ring of accounts. One employee session.
          </h2>
          <p className="text-lg lp-font-sans" style={{ color: '#C4CECD' }}>
            TRUSTLINE links the anomaly in the transactions to the access log behind it.
          </p>
        </div>

        {/* Diagram Area */}
        <div className="w-full max-w-[1100px] relative">
          <svg
            ref={svgRef}
            viewBox="0 0 1100 450"
            className="w-full h-auto overflow-visible select-none"
            aria-label="A diagram showing funds routing circularly from Account A to B to C and back to A for 15 lakhs over 25 minutes, eventually flagged as ALT-8891 Circular Routing because an employee session access log matched the same time window at Account B."
          >
            <defs>
              <marker id="arrow-green" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L0,6 L6,3 z" className="ring-arrow" fill="#83E0C9" />
              </marker>
              <marker id="arrow-ink" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L0,6 L6,3 z" fill="#C4CECD" />
              </marker>
            </defs>

            {/* Alert Tag above the ring */}
            <g className="alert-tag" opacity="0">
              <text x="250" y="50" fontFamily="monospace" fontSize="12" fill="#B8432F" textAnchor="middle" fontWeight="bold">
                ALT-8891 / CIRCULAR ROUTING
              </text>
              <line x1="250" y1="55" x2="250" y2="75" stroke="#B8432F" strokeWidth="1" strokeDasharray="2 2" />
            </g>

            {/* Account Nodes */}
            <g className="ring-elem" stroke="#83E0C9" fill="#E8F2ED" strokeWidth="1">
              <circle cx="250" cy="90" r="14" />
              <circle cx="130" cy="280" r="14" />
              <circle cx="370" cy="280" r="14" />
            </g>

            <text x="250" y="125" fontFamily="monospace" fontSize="12" className="ring-elem" fill="#83E0C9" textAnchor="middle">Account A</text>
            <text x="90" y="284" fontFamily="monospace" fontSize="12" className="ring-elem" fill="#83E0C9" textAnchor="end">Account B</text>
            <text x="410" y="284" fontFamily="monospace" fontSize="12" className="ring-elem" fill="#83E0C9" textAnchor="start">Account C</text>

            {/* Directed Arrows A -> B, B -> C, C -> A */}
            {/* A to B */}
            <path className="arr-ab ring-elem" d="M 235 102 L 140 266" stroke="#83E0C9" strokeWidth="1" fill="none" markerEnd="url(#arrow-green)" />
            <text x="140" y="180" fontFamily="monospace" fontSize="11" fill="#C4CECD">₹15L</text>

            {/* B to C */}
            <path className="arr-bc ring-elem" d="M 152 280 L 348 280" stroke="#83E0C9" strokeWidth="1" fill="none" markerEnd="url(#arrow-green)" />
            <text x="250" y="272" fontFamily="monospace" fontSize="11" fill="#C4CECD" textAnchor="middle">₹15L</text>

            {/* C to A */}
            <path className="arr-ca ring-elem" d="M 360 266 L 265 102" stroke="#83E0C9" strokeWidth="1" fill="none" markerEnd="url(#arrow-green)" />
            <text x="360" y="180" fontFamily="monospace" fontSize="11" fill="#C4CECD">₹15L</text>

            {/* Employee Node */}
            <circle cx="800" cy="280" r="14" stroke="#C4CECD" fill="#E8F2ED" strokeWidth="1" />
            <text x="800" y="315" fontFamily="monospace" fontSize="12" fill="#C4CECD" textAnchor="middle">Employee session</text>

            {/* Dashed Link */}
            <path className="dash-link" d="M 780 280 L 392 280" stroke="#C4CECD" strokeWidth="1" fill="none" strokeDasharray="4 4" markerEnd="url(#arrow-ink)" />
            <text x="600" y="272" fontFamily="monospace" fontSize="11" fill="#B8432F" className="link-label" opacity="0" textAnchor="middle">access log match</text>

            {/* Horizontal Timeline */}
            <line x1="130" y1="400" x2="800" y2="400" stroke="rgba(196,206,205,0.22)" strokeWidth="1" />
            <line className="time-fill" x1="130" y1="400" x2="800" y2="400" stroke="#83E0C9" strokeWidth="1.5" />

            {/* Timeline Ticks */}
            <line x1="130" y1="396" x2="130" y2="404" stroke="#C4CECD" strokeWidth="1" />
            <line x1="250" y1="396" x2="250" y2="404" stroke="#C4CECD" strokeWidth="1" />
            <line x1="800" y1="396" x2="800" y2="404" stroke="#C4CECD" strokeWidth="1" />

            {/* Timeline Labels */}
            <text x="130" y="420" fontFamily="monospace" fontSize="11" fill="#C4CECD" textAnchor="start">00:00 (start)</text>
            <text x="800" y="420" fontFamily="monospace" fontSize="11" fill="#C4CECD" textAnchor="end">25:00 (25 min)</text>
          </svg>

          <div className="flex items-center gap-4 mt-8">
            <button
              onClick={() => {
                if (!isPlaying && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                  performAnimation(false);
                }
              }}
              disabled={isPlaying}
              className="lp-font-mono text-[11px] uppercase tracking-wider text-[#C4CECD] hover:opacity-70 transition-opacity border-none bg-transparent cursor-pointer disabled:opacity-30 disabled:cursor-wait flex items-center gap-2"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              Replay
            </button>
            <div className="lp-font-mono text-[10px] text-[#C4CECD] opacity-80">
              * Illustrative demo scenario.
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
