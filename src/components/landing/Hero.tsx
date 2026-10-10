'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import SignalSculpture from './SignalSculpture';

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const giantWordmarkRef = useRef<HTMLDivElement>(null);
  const giantWordmarkInnerRef = useRef<HTMLSpanElement>(null);
  const sphereWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      const navWordmark = document.getElementById('nav-wordmark');
      if (!navWordmark || !giantWordmarkRef.current || !containerRef.current) return;

      const mm = gsap.matchMedia();

      const getStretch = () => {
        if (!giantWordmarkRef.current) return 1;
        const vh = window.innerHeight;
        const style = window.getComputedStyle(giantWordmarkRef.current);
        const fontSize = parseFloat(style.fontSize) || 60;
        const capHeight = fontSize * 0.72;
        let s = (0.70 * vh) / capHeight;
        if (window.innerWidth < 900) s = 1.6;
        const maxS1 = (vh - 192) / capHeight;
        const maxS2 = (vh - 48) / capHeight;
        return Math.max(1, Math.min(4, s, maxS1, maxS2));
      };

      mm.add("(prefers-reduced-motion: reduce)", () => {
        const applyStretch = () => {
          if (giantWordmarkInnerRef.current) {
            gsap.set(giantWordmarkInnerRef.current, { scaleY: getStretch() });
          }
        };
        applyStretch();
        window.addEventListener('resize', applyStretch);
        return () => window.removeEventListener('resize', applyStretch);
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (sphereWrapperRef.current) {
          gsap.to(sphereWrapperRef.current, {
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top top",
              end: "+=70%",
              scrub: true,
            },
            scale: 0.82,
            opacity: 0,
            x: "6vw",
            y: "-4vh",
            ease: "none"
          });
        }

        gsap.fromTo(".case-row",
          { y: 8, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, stagger: 0.08, ease: "power2.out", delay: 0.2 }
        );

        const dockTl = gsap.timeline();

        dockTl.to(giantWordmarkRef.current, {
          scale: () => {
            const rect = navWordmark.getBoundingClientRect();
            const giantRect = giantWordmarkRef.current!.getBoundingClientRect();
            const baseScale = gsap.getProperty(giantWordmarkRef.current, 'scaleX') as number;
            return Math.max(0.1, (rect.width / (giantRect.width / baseScale)));
          },
          x: () => {
            const navRect = navWordmark.getBoundingClientRect();
            const giantRect = giantWordmarkRef.current!.getBoundingClientRect();
            const baseScale = gsap.getProperty(giantWordmarkRef.current, 'scaleX') as number;

            const navCenter = navRect.left + (navRect.width / 2);
            const giantCenter = (giantRect.left - (gsap.getProperty(giantWordmarkRef.current, 'x') as number)) + (giantRect.width / 2);
            return navCenter - giantCenter;
          },
          y: () => {
            const navRect = navWordmark.getBoundingClientRect();
            const giantRect = giantWordmarkRef.current!.getBoundingClientRect();
            const navCenter = navRect.top + (navRect.height / 2);
            const giantCenter = (giantRect.top - (gsap.getProperty(giantWordmarkRef.current, 'y') as number)) + (giantRect.height / 2);
            return navCenter - giantCenter;
          },
          opacity: 0,
          ease: "none",
        }, 0);

        dockTl.fromTo(giantWordmarkInnerRef.current,
          { scaleY: getStretch },
          { scaleY: 1, ease: "none" },
          0);

        ScrollTrigger.create({
          id: "wordmark-dock",
          trigger: containerRef.current,
          start: "top top",
          end: "+=120%",
          scrub: 1,
          animation: dockTl,
          invalidateOnRefresh: true,
          pin: true,
          pinSpacing: true,
        });

      });

    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-[100vh] h-auto flex flex-col overflow-hidden bg-[#FBFAF6]"
      style={{ paddingTop: 'clamp(120px, 14vh, 160px)' }}
    >
      {/* Transparent animated green-and-gold sculpture */}
      <div
        ref={sphereWrapperRef}
        className="signal-wrapper absolute pointer-events-none select-none z-[2] right-[0%] md:right-[5%] top-[57%] -translate-y-1/2 -rotate-12 w-[100vw] h-[55vh] md:w-[42vw] md:h-[65vh] max-w-[620px]"
        style={{
          transformOrigin: '50% 50%',
        }}
      >
        <SignalSculpture />
      </div>

      {/* Giant translucent wordmark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-[3]">
        <div
          ref={giantWordmarkRef}
          className="text-center font-bold relative w-[95vw]"
          style={{
            fontFamily: 'var(--font-plex-sans), "IBM Plex Sans", sans-serif',
            fontSize: 'max(15vw, 60px)',
            fontWeight: 800,
            whiteSpace: 'nowrap',
            letterSpacing: '0.01em',
            transformOrigin: '50% 50%',
            lineHeight: 1,
            color: 'rgba(128, 143, 132, 0.12)',
          }}
          aria-hidden="true"
        >
          <span
            ref={giantWordmarkInnerRef}
            style={{ display: 'inline-block', transformOrigin: '50% 50%' }}
          >
            TRUSTLINE
          </span>
        </div>
      </div>

      {/* Foreground Hero Content (2 columns) */}
      <div className="relative z-[4] max-w-[1280px] mx-auto px-4 lg:px-8 w-full flex flex-col md:flex-row items-start pb-24 lg:pb-32">

        {/* Left Side (60% width) - Text Content */}
        <div className="w-full md:w-[60%] max-w-[780px] flex flex-col justify-start md:justify-between md:min-h-[48vh] shrink-0 pr-8">
          <h1
            className="font-bold tracking-tight mb-5 md:mb-0 lp-font-display text-[#171916]"
            style={{ fontSize: 'clamp(44px, 5vw, 82px)', lineHeight: 1.02, textWrap: 'balance' }}
          >
            Every transaction<br />leaves a trail.
          </h1>
          <p className="text-xl lg:text-2xl max-w-md mb-7 md:mb-0 text-[#62645F] font-normal lp-font-sans" style={{ lineHeight: 1.6 }}>
            Connect financial transactions, employee activity, and suspicious money flows in one intelligence workspace.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <Link
              href="/login"
              className="flex items-center justify-center h-[58px] px-9 text-base font-semibold rounded-sm transition-all hover:opacity-90 shrink-0 text-[#172321]"
              style={{ background: '#104D35', color: '#FBFAF6' }}
            >
              ENTER DEMO WORKSPACE &rarr;
            </Link>
          </div>
        </div>

      </div>

      {/* BOTTOM SCROLL INDICATOR */}
      <div className="max-[899px]:hidden absolute left-1/2 -translate-x-1/2 bottom-[12px] w-full max-w-[560px] flex flex-col items-center pointer-events-none z-[3]">
        <p className="lp-font-sans text-[17px] text-[#62645F] opacity-90 m-0 leading-normal text-center">
          Transaction anomalies and employee access logs, in one investigation.
        </p>
        <p className="lp-font-mono text-[11px] uppercase tracking-[0.14em] text-[#62645F] opacity-75 mt-[14px] mb-0 text-center">
          SCROLL TO FOLLOW THE TRAIL
        </p>
        <div className="w-[1px] h-[28px] bg-[#62645F] opacity-40 mt-2" />
      </div>
    </div>
  );
}
