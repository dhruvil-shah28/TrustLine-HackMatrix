import React from 'react';
import Link from 'next/link';

export default function Closing() {
  return (
    <section
      id="cta"
      className="w-full min-h-[100vh] flex flex-col justify-center"
      style={{ background: '#FBFAF6' }}
    >
      <div className="w-full max-w-[1280px] mx-auto px-4 lg:px-8 py-[120px] border-t" style={{ borderColor: '#E4E1D8' }}>

        <div className="flex flex-col min-[900px]:flex-row min-[900px]:items-center justify-between gap-16 min-[900px]:gap-8">

          {/* LEFT COLUMN */}
          <div className="w-full min-[900px]:w-[45%] flex flex-col justify-center">
            <p className="lp-font-mono text-[11px] uppercase tracking-[0.14em] font-bold mb-4" style={{ color: '#104D35' }}>
              FOR BANKS AND NBFCs
            </p>
            <h2
              className="font-bold tracking-tight mb-5 lp-font-display text-[#171916]"
              style={{ fontSize: 'clamp(34px, 3.6vw, 56px)', lineHeight: 1.05, textWrap: 'balance' }}
            >
              See the transaction and the employee behind it.
            </h2>
            <p className="lp-font-sans font-[400] text-[18px] max-w-[480px] mb-[32px] text-[#62645F]" style={{ lineHeight: 1.6 }}>
              TRUSTLINE gives AML and insider-risk teams one place to trace suspicious money flows and check them against who accessed what, and when.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center">
              <Link
                href="/login"
                className="lp-font-display flex items-center justify-center font-[800] uppercase tracking-[0.04em] text-[15px] px-[30px] py-[18px] rounded-[4px] shrink-0"
                style={{ background: '#104D35', color: '#FBFAF6' }}
              >
                ENTER WORKSPACE &rarr;
              </Link>
              <Link
                href="/login"
                className="lp-font-display flex items-center justify-center font-[800] uppercase tracking-[0.04em] text-[15px] shrink-0 sm:ml-[28px]"
                style={{ color: '#171916' }}
              >
                EXPLORE THE PLATFORM
              </Link>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="w-full min-[900px]:w-[52%] flex flex-col justify-start">
            <div id="problem" className="flex flex-col" style={{ borderTop: '1px solid #E4E1D8' }}>

              <div className="flex flex-col items-start py-[18px]" style={{ borderBottom: '1px solid #E4E1D8' }}>
                <span className="lp-font-display font-[600] uppercase tracking-[0.08em] block mb-[6px] text-[13px] min-[900px]:text-[14px]" style={{ color: '#104D35' }}>MONEY FLOW</span>
                <span className="lp-font-display font-[600] max-w-[100%] text-[18px] min-[900px]:text-[21px]" style={{ color: '#171916', lineHeight: 1.4 }}>Follow funds across linked accounts and surface circular routing, such as ALT-8891: ₹15L moved in 25 min.</span>
              </div>

              <div className="flex flex-col items-start py-[18px]" style={{ borderBottom: '1px solid #E4E1D8' }}>
                <span className="lp-font-display font-[600] uppercase tracking-[0.08em] block mb-[6px] text-[13px] min-[900px]:text-[14px]" style={{ color: '#104D35' }}>INSIDER CORRELATION</span>
                <span className="lp-font-display font-[600] max-w-[100%] text-[18px] min-[900px]:text-[21px]" style={{ color: '#171916', lineHeight: 1.4 }}>Line up profile access, beneficiary updates and privilege changes against the transaction timeline.</span>
              </div>

              <div className="flex flex-col items-start py-[18px]" style={{ borderBottom: '1px solid #E4E1D8' }}>
                <span className="lp-font-display font-[600] uppercase tracking-[0.08em] block mb-[6px] text-[13px] min-[900px]:text-[14px]" style={{ color: '#104D35' }}>EXPLAINABLE SCORES</span>
                <span className="lp-font-display font-[600] max-w-[100%] text-[18px] min-[900px]:text-[21px]" style={{ color: '#171916', lineHeight: 1.4 }}>See which evidence signals feed each risk assessment, instead of an unexplained number.</span>
              </div>

              <div className="flex flex-col items-start py-[18px]" style={{ borderBottom: '1px solid #E4E1D8' }}>
                <span className="lp-font-display font-[600] uppercase tracking-[0.08em] block mb-[6px] text-[13px] min-[900px]:text-[14px]" style={{ color: '#104D35' }}>CASE AND AUDIT TRAIL</span>
                <span className="lp-font-display font-[600] max-w-[100%] text-[18px] min-[900px]:text-[21px]" style={{ color: '#171916', lineHeight: 1.4 }}>Move from a flagged alert to linked evidence, an investigation and a documented case, with an audit log.</span>
              </div>

            </div>

            <div className="mt-[20px]">
              <p className="lp-font-mono text-[11px] uppercase m-0" style={{               letterSpacing: '0.12em', color: '#62645F' }}>
                ROLES: INVESTIGATOR / COMPLIANCE / RISK ANALYST / ADMIN
              </p>
              <p className="lp-font-mono text-[11px] m-0 mt-[8px]"               style={{ color: '#858780' }}>
                The workspace runs on seeded sample data.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
