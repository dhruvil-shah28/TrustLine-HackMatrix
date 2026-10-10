import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <div className="relative z-10 w-full flex flex-col">

      {/* A) CTA BAND */}
      <section className="w-full flex justify-center py-[110px] px-6" style={{ background: '#FBFAF6' }}>
        <div className="flex flex-col items-center text-center w-full max-w-[900px]">
          <h2
            className="lp-font-display font-[800] tracking-tight"
            style={{ color: '#171916', fontSize: 'clamp(36px, 4.4vw, 64px)', lineHeight: 1.05 }}
          >
            See the trail for yourself.
          </h2>
          <p
            className="lp-font-display font-[600] text-[19px] mt-[16px]"
            style={{ color: '#62645F' }}
          >
            Connect the transactions, activity, and evidence that isolated systems miss.
          </p>

          <div className="flex flex-row items-center justify-center gap-[28px] mt-[36px]">
            <Link
              href="/login"
              className="lp-font-display flex items-center justify-center font-[800] uppercase tracking-[0.04em] text-[15px] px-[30px] py-[18px] rounded-[4px] shrink-0 transition-opacity hover:opacity-90"
              style={{ background: '#104D35', color: '#FBFAF6' }}
            >
              ENTER DEMO WORKSPACE &rarr;
            </Link>
            <Link
              href="/login"
              className="lp-font-display flex items-center justify-center font-[800] uppercase tracking-[0.04em] text-[15px] shrink-0 transition-opacity hover:opacity-90"
              style={{ color: '#171916', textDecoration: 'underline', textDecorationThickness: '2px', textUnderlineOffset: '6px', textDecorationColor: '#62645F' }}
            >
              SIGN IN
            </Link>
          </div>
        </div>
      </section>

      {/* B) FOOTER BAR */}
      <footer className="w-full flex justify-center py-[26px] px-6 border-t border-[#E4E1D8]" style={{ background: '#FBFAF6' }}>
        <div className="w-full max-w-[1280px] flex flex-col min-[900px]:flex-row justify-between items-center gap-[20px]">

          {/* Left */}
          <div className="flex items-center shrink-0">
            <span className="lp-font-display font-[800] text-[20px] tracking-[0.08em]" style={{ color: '#104D35' }}>
              TRUSTLINE
            </span>
          </div>

          {/* Centre */}
          <div className="flex flex-row items-center gap-[24px]">
            <Link
              href="#cta"
              className="lp-font-display font-[700] text-[13px] uppercase tracking-[0.08em] transition-opacity hover:opacity-100"
              style={{ color: '#62645F' }}
            >
              METHODOLOGY
            </Link>
            <Link
              href="/help"
              className="lp-font-display font-[700] text-[13px] uppercase tracking-[0.08em] transition-opacity hover:opacity-100"
              style={{ color: '#62645F' }}
            >
              DOCUMENTATION
            </Link>
            <Link
              href="/login"
              className="lp-font-display font-[700] text-[13px] uppercase tracking-[0.08em] transition-opacity hover:opacity-100"
              style={{ color: '#62645F' }}
            >
              SIGN IN
            </Link>
          </div>

          {/* Right */}
          <div className="flex flex-col items-center min-[900px]:items-end min-[900px]:text-right text-center lp-font-mono text-[12px] shrink-0" style={{ color: '#858780' }}>
            <p className="m-0 mb-1">Demo data only. Built for HackMatrix 5.0.</p>
            <p className="m-0">&copy; 2026 TRUSTLINE</p>
          </div>

        </div>
      </footer>
    </div>
  );
}
