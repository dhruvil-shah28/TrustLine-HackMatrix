'use client';

import React from 'react';

export default function LoginTrace() {
  return (
    <>
      <style>{`
        .lt-ledger-lines {
           animation: lt-drift 40s linear infinite;
        }
        @keyframes lt-drift {
           from { transform: translateY(100px); }
           to { transform: translateY(-400px); }
        }
        
        .lt-thread {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: lt-draw-thread 6s ease-in-out infinite forwards;
        }
        @keyframes lt-draw-thread {
          0%, 10% { stroke-dashoffset: 1000; }
          40%, 80% { stroke-dashoffset: 0; }
          90%, 100% { stroke-dashoffset: 1000; opacity: 0; }
        }
        
        .lt-stamp {
          opacity: 0;
          transform: scale(1.6) rotate(-8deg);
          animation: lt-stamp-in 6s cubic-bezier(0.175, 0.885, 0.32, 1.275) infinite forwards;
        }
        @keyframes lt-stamp-in {
          0%, 40% { opacity: 0; transform: scale(1.6) rotate(-8deg); }
          45%, 85% { opacity: 1; transform: scale(1) rotate(-8deg); }
          90%, 100% { opacity: 0; transform: scale(0.8) rotate(-8deg); }
        }
        
        .lt-dashed-thread {
          stroke-dasharray: 4, 4;
          stroke-dashoffset: 40;
          animation: lt-draw-dashed 6s ease-in-out infinite forwards;
        }
        @keyframes lt-draw-dashed {
          0%, 45% { stroke-dashoffset: 40; opacity: 0; }
          55%, 85% { stroke-dashoffset: 0; opacity: 1; }
          90%, 100% { stroke-dashoffset: 0; opacity: 0; }
        }

        .lt-drop-box {
          opacity: 0;
          transform: translateY(-10px);
          animation: lt-drop-box-in 6s ease-out infinite forwards;
        }
        @keyframes lt-drop-box-in {
          0%, 50% { opacity: 0; transform: translateY(-10px); }
          55%, 85% { opacity: 1; transform: translateY(0); }
          90%, 100% { opacity: 0; transform: translateY(0); }
        }

        .lt-node-label {
          animation: lt-fade-label 6s ease-out infinite forwards;
        }
        @keyframes lt-fade-label {
          0%, 85% { opacity: 1; }
          90%, 100% { opacity: 0; }
        }

        @media (prefers-reduced-motion: reduce) {
          .lt-thread, .lt-stamp, .lt-dashed-thread, .lt-drop-box, .lt-node-label, .lt-ledger-lines {
            animation: none !important;
            opacity: 1 !important;
            stroke-dashoffset: 0 !important;
            transform: none !important;
          }
          .lt-stamp {
            transform: rotate(-8deg) !important;
          }
        }
      `}</style>

      <svg
        viewBox="0 0 600 420"
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full text-[#FFFFFF]"
        aria-hidden="true"
        style={{ pointerEvents: 'none' }}
      >
        {/* Ledger Lines Background */}
        <g className="lt-ledger-lines lp-font-mono text-[11px]" fill="currentColor" opacity="0.1">
          <text x="40" y="100">TXN 00481 -&gt; ACC-1001 &#x20B9;2,40,000</text>
          <text x="40" y="140">SESSION 7F3A OPENED</text>
          <text x="40" y="180">BENEFICIARY UPDATED</text>
          <text x="40" y="220">TXN 00482 -&gt; OVERRIDE REQ</text>
          <text x="40" y="260">LIMIT INCREASE APPROVED</text>
          <text x="40" y="300">SYSTEM OUTBOUND ALERT - RED</text>
          <text x="40" y="340">TXN 00489 -&gt; ACC-1006 &#x20B9;12,60,000</text>
        </g>

        {/* Nodes */}
        {/* ACC-1001 A */}
        <circle cx="150" cy="180" r="14" fill="transparent" stroke="currentColor" strokeOpacity="0.14" strokeWidth="1" />
        <text x="150" y="210" textAnchor="middle" className="lt-node-label lp-font-mono text-[11px]" fill="currentColor" opacity="0.7">ACC-1001</text>

        {/* ACC-1002 B */}
        <circle cx="450" cy="130" r="14" fill="transparent" stroke="currentColor" strokeOpacity="0.14" strokeWidth="1" />
        <text x="450" y="110" textAnchor="middle" className="lt-node-label lp-font-mono text-[11px]" fill="currentColor" opacity="0.7">ACC-1002</text>

        {/* ACC-1006 C */}
        <circle cx="300" cy="320" r="14" fill="transparent" stroke="currentColor" strokeOpacity="0.14" strokeWidth="1" />
        <text x="300" y="350" textAnchor="middle" className="lt-node-label lp-font-mono text-[11px]" fill="currentColor" opacity="0.7">ACC-1006</text>

        {/* Thread */}
        <path
          d="M150,180 L450,130 L300,320 L150,180"
          fill="none"
          stroke="#8EE4D0"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lt-thread"
        />

        {/* Thread Labels */}
        <text x="300" y="145" textAnchor="middle" fill="#8EE4D0" className="lt-thread lp-font-mono text-[10px] font-bold">&#x20B9;15L</text>
        <text x="390" y="240" textAnchor="middle" fill="#8EE4D0" className="lt-thread lp-font-mono text-[10px] font-bold">&#x20B9;15L</text>

        {/* Dashed Thread dropping from B */}
        <path
          d="M450,130 L450,220"
          fill="none"
          stroke="#8EE4D0"
          strokeWidth="2"
          strokeLinecap="round"
          className="lt-dashed-thread"
        />

        <g className="lt-drop-box">
          <rect x="380" y="220" width="140" height="26" fill="transparent" stroke="#8EE4D0" strokeWidth="1" rx="2" />
          <text x="450" y="237" textAnchor="middle" fill="#8EE4D0" className="lp-font-mono text-[10px] font-bold">EMP-1001 / ACCESS LOG</text>
        </g>

        {/* Rubber Stamp */}
        <g className="lt-stamp" transform="rotate(-8 260 210)">
          <rect x="200" y="170" width="160" height="32" fill="transparent" stroke="#8EE4D0" strokeWidth="2" rx="4" />
          <text x="280" y="191" textAnchor="middle" fill="#8EE4D0" className="lp-font-mono text-[14px] font-[800]">ALT-8891 / FLAGGED</text>
        </g>
      </svg>
    </>
  );
}
