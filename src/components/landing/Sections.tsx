'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { gsap } from '@/lib/gsap';

export default function Sections() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      const sections = gsap.utils.toArray('.reveal-section');
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        sections.forEach((sec: any) => {
          gsap.fromTo(sec,
            { opacity: 0, y: 15 },
            {
              opacity: 1,
              y: 0,
              duration: 0.9,
              ease: "power2.out",
              scrollTrigger: {
                trigger: sec,
                start: "top 85%",
                once: true
              }
            }
          );
        });

        // specific animation for the circular SVG in Screen 2
        gsap.fromTo(".svg-flow-path",
          { strokeDasharray: "1000", strokeDashoffset: "1000" },
          {
            strokeDashoffset: "0",
            duration: 2.5,
            ease: "none",
            scrollTrigger: {
              trigger: "#problem",
              start: "top 75%",
              once: true
            }
          }
        );
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative z-10 w-full" style={{ color: '#C4CECD', fontFamily: 'var(--font-plex-sans), "IBM Plex Sans", sans-serif' }}>

      {/* SCREEN 2: THE CONNECTED INTELLIGENCE STORY */}
      <section id="problem" className="reveal-section max-w-[1280px] mx-auto px-4 lg:px-8 py-24 md:py-32">
        <h2 className="text-4xl md:text-5xl font-semibold mb-6 tracking-tight max-w-3xl">
          Two systems. One connected investigation.
        </h2>
        <p className="text-xl mb-24 max-w-3xl text-[#C4CECD] leading-relaxed">
          Transaction monitoring sees the money. Internal security sees the employee. TRUSTLINE connects the evidence.
        </p>

        {/* The 4 Capabilities Layout - Sophisticated Editorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-16 mb-24 border-t border-white/15 pt-16">

          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-[#83E0C9]/10 flex items-center justify-center mb-6 text-[#83E0C9]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
            </div>
            <h3 className="font-bold text-lg mb-3 tracking-wide">Transaction Graph Intelligence</h3>
            <p className="text-[#C4CECD] text-sm leading-relaxed">
              Follow suspicious money through connected accounts and identify circular routes.
            </p>
          </div>

          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-[#83E0C9]/10 flex items-center justify-center mb-6 text-[#83E0C9]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            </div>
            <h3 className="font-bold text-lg mb-3 tracking-wide">Insider Activity Correlation</h3>
            <p className="text-[#C4CECD] text-sm leading-relaxed">
              Connect employee profile access, beneficiary updates, and privilege changes to transaction timelines.
            </p>
          </div>

          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-[#83E0C9]/10 flex items-center justify-center mb-6 text-[#83E0C9]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            </div>
            <h3 className="font-bold text-lg mb-3 tracking-wide">Explainable Risk Scoring</h3>
            <p className="text-[#C4CECD] text-sm leading-relaxed">
              Show which evidence signals contribute to the risk assessment rather than presenting an unexplained number.
            </p>
          </div>

          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-[#83E0C9]/10 flex items-center justify-center mb-6 text-[#83E0C9]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
            </div>
            <h3 className="font-bold text-lg mb-3 tracking-wide">Investigation and Case Management</h3>
            <p className="text-[#C4CECD] text-sm leading-relaxed">
              Move from a flagged alert to linked evidence, an investigation, and a documented case.
            </p>
          </div>

        </div>

        {/* Compact Authentic Investigation Visual (Prisma Seed ALT-8891) */}
        <div className="pt-12 flex flex-col lg:flex-row gap-16 lg:gap-24 items-center border-t border-white/15">
          <div className="w-full lg:w-1/2 flex flex-col gap-10">
            <div className="flex gap-4 items-start">
              <div>
                <h3 className="font-semibold text-2xl mb-4">Connecting ALT-8891</h3>
                <p className="text-[#C4CECD] text-lg leading-relaxed mb-6">
                  Isolated records hide intent. Transactions look like standard B2B routing. Internal application logs look like routine account maintenance. Separated, they blend in.
                </p>
                <p className="text-[#C4CECD] text-lg leading-relaxed">
                  TRUSTLINE automatically fused a ₹15,00,000 circular flow transferring through <strong>Karan Enterprise (ACC-1001)</strong> with the exact employee footprint (<strong>Vikram Malhotra / EMP-1001</strong>) who bypassed beneficiary thresholds just seconds prior.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Flow Visual */}
          <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white border border-[#D7E2DA] rounded-sm shadow-sm relative">
            <svg width="480" height="320" viewBox="0 0 480 320" fill="none" className="w-full max-w-[480px]">
              {/* Financial transaction stream (top half) */}
              <text x="30" y="40" className="lp-font-mono text-[10px] uppercase font-bold" fill="#0e4a2d">Financial Monitoring</text>
              <line x1="30" y1="50" x2="450" y2="50" stroke="#0e4a2d" strokeWidth="0.5" strokeDasharray="3 3" />

              {/* Internal security stream (bottom half) */}
              <text x="30" y="280" className="lp-font-mono text-[10px] uppercase font-bold" fill="#111111">Access Logs</text>
              <line x1="30" y1="270" x2="450" y2="270" stroke="#111111" strokeWidth="0.5" strokeDasharray="3 3" />

              {/* ACC-1001 Start */}
              <circle cx="100" cy="160" r="12" fill="#F8F7F1" stroke="#111111" strokeWidth="1.5" />
              <text x="100" y="195" textAnchor="middle" className="lp-font-mono text-[11px] font-bold" fill="#111111">ACC-1001</text>
              <text x="100" y="210" textAnchor="middle" className="lp-font-mono text-[9px]" fill="#3a3a3a">Karan Ent.</text>

              {/* SEC access log ping -> triggers 1001 */}
              <path d="M 100 270 L 100 172" stroke="#111111" strokeWidth="1" strokeDasharray="2 2" />
              <circle cx="100" cy="270" r="4" fill="#111111" />
              <text x="110" y="260" className="lp-font-mono text-[9px]" fill="#3a3a3a">EMP-1001 Limit Bypass</text>

              {/* ACC-1002 Mid */}
              <circle cx="240" cy="80" r="8" fill="#4CAF82" />
              <text x="240" y="65" textAnchor="middle" className="lp-font-mono text-[10px]" fill="#0e4a2d">ACC-1002</text>

              {/* ACC-1006 End */}
              <circle cx="380" cy="160" r="8" fill="#4CAF82" />
              <text x="380" y="195" textAnchor="middle" className="lp-font-mono text-[10px]" fill="#0e4a2d">ACC-1006</text>

              {/* Paths */}
              <path className="svg-flow-path" d="M 105 150 Q 170 100 235 85" stroke="#4CAF82" strokeWidth="1.5" fill="none" />
              <text x="150" y="110" textAnchor="middle" className="lp-font-mono text-[10px]" fill="#111111">₹15L</text>
              <path className="svg-flow-path" d="M 245 85 Q 315 105 375 150" stroke="#4CAF82" strokeWidth="1.5" fill="none" />

              {/* 1006 -> 1001 return */}
              <path className="svg-flow-path" d="M 375 168 Q 240 250 105 168" stroke="#0e1a12" strokeWidth="2" fill="none" strokeDasharray="4 4" />

              {/* Alert convergence */}
              <rect x="200" y="125" width="80" height="24" rx="2" fill="#111111" />
              <text x="240" y="141" textAnchor="middle" className="lp-font-mono text-[10px] font-bold" fill="#E8C66A">ALT-8891</text>
            </svg>
          </div>

        </div>
      </section>

      {/* SCREEN 3: CLOSING CTA & FOOTER */}
      <section className="reveal-section w-full border-t border-white/15" style={{ background: '#203234', color: '#F2F4EF' }}>

        {/* CLOSING BAND */}
        <div className="flex-col items-center justify-center pt-32 pb-28 px-4 text-center max-w-[1280px] mx-auto">
          <h2 className="text-5xl md:text-6xl font-semibold mb-6 tracking-tight">
            See the trail for yourself.
          </h2>
          <p className="text-xl mb-12 max-w-2xl mx-auto opacity-90 leading-relaxed text-[#C4CECD]">
            Connect the transactions, activity, and evidence that isolated systems miss.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 items-center">
            <Link
              href="/login"
              className="flex items-center justify-center h-[56px] px-10 font-bold rounded-sm tracking-wide transition-all hover:scale-[1.02] text-[#172321]"
              style={{ background: '#83E0C9', fontFamily: 'var(--font-plex-sans), "IBM Plex Sans", sans-serif' }}
            >
              ENTER DEMO WORKSPACE &rarr;
            </Link>
            <a
              href="#detection"
              className="flex items-center justify-center h-[56px] px-10 font-bold rounded-sm tracking-wide transition-all hover:bg-white/10"
              style={{ fontFamily: 'var(--font-plex-sans), "IBM Plex Sans", sans-serif', color: '#C4CECD' }}
            >
              EXPLORE THE METHODOLOGY
            </a>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="w-full px-4 lg:px-8 py-8" style={{ background: '#203234' }}>
          <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <Image src="/trustline-logo.png" alt="Trustline Logo" width={32} height={32} className="opacity-90 mix-blend-screen" />
              <div className="font-semibold tracking-widest text-[#83E0C9]">
                TRUSTLINE
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-8 text-xs font-bold tracking-wider uppercase opacity-80">
              <a href="#problem" className="hover:text-white transition-colors">Methodology</a>
              <Link href="/help" className="hover:text-white transition-colors">Documentation</Link>
              <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
            </div>

            <div className="text-right text-[10px] lp-font-mono opacity-50">
              <p className="mb-1">Demo data only. Built for HackMatrix 5.0.</p>
              <p>&copy; 2026 TRUSTLINE</p>
            </div>
          </div>
        </footer>

      </section>

    </div>
  );
}
