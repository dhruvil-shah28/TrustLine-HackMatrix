'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';


const RBI_REFERENCES = [
  { label: 'Master Direction: Know Your Customer (KYC), 2016', href: 'https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=10292' },
  { label: 'Master Directions: Fraud Risk Management, July 2024', href: 'https://www.rbi.org.in/Scripts/BS_ViewMasterDirections.aspx' },
];

export default function LandingNavbar({
  logoVariant = 'default',
  clickDropdowns = false,
  publicLanding = false,
}: {
  logoVariant?: 'default' | 'image';
  clickDropdowns?: boolean;
  publicLanding?: boolean;
}) {
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(true);
    const [isPlatformOpen, setIsPlatformOpen] = useState(false);
  const platformRef = useRef<HTMLDivElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (platformRef.current && !platformRef.current.contains(event.target as Node)) setIsPlatformOpen(false);
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
          setIsPlatformOpen(false);
      }
    };
    const handleEscape = (event: any) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
          setIsPlatformOpen(false);
        setIsPlatformOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);
  const [scrolled, setScrolled] = useState(false);
  const [glassSupported, setGlassSupported] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    // Check backdrop-filter support securely
    if (typeof CSS !== 'undefined' && CSS.supports) {
      setGlassSupported(
        CSS.supports('backdrop-filter', 'blur(16px)') ||
        CSS.supports('-webkit-backdrop-filter', 'blur(16px)')
      );
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const heroHeight = window.innerHeight;

      setScrolled(currentScrollY > 24);

      // Always show in hero
      if (currentScrollY < heroHeight * 0.8) {
        setIsVisible(true);
      } else {
        if (currentScrollY > lastScrollY.current + 10) {
          setIsVisible(false);
          setIsDropdownOpen(false);
          setIsPlatformOpen(false);
        } else if (currentScrollY < lastScrollY.current - 10) {
          setIsVisible(true);
        }
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Force the floating navbar surface to take precedence over app-shell styles.
  useEffect(() => {
    if (headerRef.current) {
      const bg = glassSupported
        ? (scrolled ? 'rgba(242,241,235,0.98)' : 'rgba(242,241,235,0.94)')
        : '#F2F1EB';

      headerRef.current.style.setProperty('background', bg, 'important');
      headerRef.current.style.setProperty('backdrop-filter', glassSupported ? 'blur(16px) saturate(120%)' : 'none', 'important');
      headerRef.current.style.setProperty('-webkit-backdrop-filter', glassSupported ? 'blur(16px) saturate(120%)' : 'none', 'important');
      headerRef.current.style.setProperty('border', '1px solid #D7E2DA', 'important');
      headerRef.current.style.setProperty('border-bottom', '1px solid #D7E2DA', 'important');
      headerRef.current.style.setProperty('box-shadow', '0 1px 2px rgba(21,25,21,0.06)', 'important');
    }
  }, [scrolled, glassSupported]);

  return (
    <header
      ref={headerRef}
      className={`fixed top-4 left-1/2 z-50 h-[60px] w-[calc(100%-32px)] max-w-[1200px] rounded-[20px] transition-transform duration-300 motion-reduce:transition-none ${isVisible ? 'translate-y-0 -translate-x-1/2' : '-translate-y-[100px] -translate-x-1/2'}`}
      style={{
        background: glassSupported
          ? (scrolled ? 'rgba(242,241,235,0.98)' : 'rgba(242,241,235,0.94)')
          : '#F2F1EB',
        backdropFilter: glassSupported ? 'blur(16px) saturate(120%)' : 'none',
        WebkitBackdropFilter: glassSupported ? 'blur(16px) saturate(120%)' : 'none',
        border: '1px solid #D7E2DA',
        boxShadow: '0 1px 2px rgba(21, 25, 21, 0.06)'
      }}
    >
      <div className="h-full px-4 lg:px-6 flex items-center justify-between">

        {/* Logo Area */}
        <Link href="/" className="flex items-center gap-3 group" style={{ textDecoration: 'none' }}>
          <div
            id="nav-wordmark"
            ref={wordmarkRef}
            className="flex items-center shrink-0 transition-transform group-hover:scale-[1.02]"
          >
            <Image
              src={publicLanding ? '/brand/trustline-logo-trim.png' : '/brand/trustline-full.png'}
              alt="TRUSTLINE"
              width={240}
              height={60}
              priority
              style={{
                height: publicLanding ? undefined : logoVariant === 'image' ? 52 : 44,
                width: 'auto',
                objectFit: 'contain',
              }}
              className={publicLanding ? 'h-8 min-[440px]:h-10 sm:h-11' : undefined}
            />
          </div>
        </Link>

        {/* Navigation Area */}
        <nav className={`flex items-center ${publicLanding ? 'gap-1 sm:gap-5 lg:gap-7' : 'gap-3 sm:gap-5 lg:gap-7'} text-sm font-semibold`} style={{ color: '#172321' }}>
          {!publicLanding && <div className="relative" ref={platformRef}>
            <button
              className="flex items-center justify-center gap-1.5 hover:text-[#104D35] transition-colors py-2 group/btn"
              onMouseEnter={() => { if (!clickDropdowns) setIsPlatformOpen(true); }}
              onMouseLeave={() => { if (!clickDropdowns) setIsPlatformOpen(false); }}
              onClick={() => {
                if (clickDropdowns) {
                  setIsPlatformOpen((open) => !open);
                  setIsDropdownOpen(false);
                } else {
                  setIsPlatformOpen(!isPlatformOpen);
                }
              }}
              aria-haspopup="true"
              aria-expanded={isPlatformOpen}
            >
              Platform
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" className={`transition-transform duration-200 ${isPlatformOpen ? 'rotate-180' : ''}`}>
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {isPlatformOpen && (
              <div
                className={`absolute top-[80%] left-0 md:-left-12 w-[480px] p-6 shadow-2xl rounded-sm grid grid-cols-2 gap-8 opacity-0 animate-in fade-in slide-in-from-top-2 ${clickDropdowns ? 'employeeNavDropdown' : ''}`}
                style={{ background: '#F2F1EB', border: '1px solid #D7E2DA' }}
                onMouseEnter={() => { if (!clickDropdowns) setIsPlatformOpen(true); }}
                onMouseLeave={() => { if (!clickDropdowns) setIsPlatformOpen(false); }}
              >
                <div>
                  <div className="text-xs font-bold text-[#104D35] uppercase tracking-wider mb-3">Overview</div>
                  <Link href="/dashboard" className="block py-1 hover:text-[#104D35] transition-colors mb-4">Dashboard</Link>

                  <div className="text-xs font-bold text-[#104D35] uppercase tracking-wider mb-3">Investigations</div>
                  <Link href="/alerts" className="block py-1 hover:text-[#104D35] transition-colors">Alerts</Link>
                  <Link href="/graph" className="block py-1 hover:text-[#104D35] transition-colors">Money Flow</Link>
                  <Link href="/cases" className="block py-1 hover:text-[#104D35] transition-colors">Cases</Link>
                </div>
                <div>
                  <div className="text-xs font-bold text-[#104D35] uppercase tracking-wider mb-3">Entity Intelligence</div>
                  <Link href="/employees" className="block py-1 hover:text-[#104D35] transition-colors">Employees</Link>
                  <Link href="/customers" className="block py-1 hover:text-[#104D35] transition-colors mb-4">Customers</Link>

                  <div className="text-xs font-bold text-[#104D35] uppercase tracking-wider mb-3">Intelligence Tools</div>
                  <Link href="/lab" className="block py-1 hover:text-[#104D35] transition-colors">Detection Lab</Link>
                  <Link href="/copilot" className="block py-1 hover:text-[#104D35] transition-colors">AI Copilot</Link>
                </div>
              </div>
            )}
          </div>}

          {!publicLanding && <Link href="/help#methodologies" className="hover:text-[#104D35] transition-colors py-2">Methodology</Link>}

          {!publicLanding && <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center justify-center gap-1.5 hover:text-[#104D35] transition-colors py-2 group/btn"
              onMouseEnter={() => { if (!clickDropdowns) setIsDropdownOpen(true); }}
              onMouseLeave={() => { if (!clickDropdowns) setIsDropdownOpen(false); }}
              onClick={() => {
                if (clickDropdowns) {
                  setIsDropdownOpen((open) => !open);
                  setIsPlatformOpen(false);
                } else {
                  setIsDropdownOpen(!isDropdownOpen);
                }
              }}
              aria-haspopup="true"
              aria-expanded={isDropdownOpen}
            >
              Documentation
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}>
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {isDropdownOpen && (
              <div
                className={`absolute top-[80%] right-0 md:-right-4 w-[340px] p-6 shadow-2xl rounded-sm flex flex-col gap-6 opacity-0 animate-in fade-in slide-in-from-top-2 ${clickDropdowns ? 'employeeNavDropdown' : ''}`}
                style={{ background: '#F2F1EB', border: '1px solid #D7E2DA' }}
                onMouseEnter={() => { if (!clickDropdowns) setIsDropdownOpen(true); }}
                onMouseLeave={() => { if (!clickDropdowns) setIsDropdownOpen(false); }}
              >
                <div>
                  <div className="text-xs font-bold text-[#104D35] uppercase tracking-wider mb-2">PRODUCT</div>
                  <Link href="/help" className="block py-1 hover:text-[#104D35] transition-colors text-sm">Help and guides</Link>
                </div>

                <div>
                  <div className="text-xs font-bold text-[#104D35] uppercase tracking-wider mb-2">RBI REFERENCES</div>
                  <div className="flex flex-col gap-2">
                    {RBI_REFERENCES.map((ref, idx) => (
                      <a key={idx} href={ref.href} target="_blank" rel="noopener noreferrer" className="block py-1 hover:text-[#104D35] transition-colors text-sm leading-tight text-[#172321]/80">
                        {ref.label} <span className="ml-[2px] opacity-60">↗</span>
                      </a>
                    ))}
                  </div>
                </div>

                <div className="pt-4 mt-2 border-t border-[#D7E2DA] text-[#596863]" style={{ fontFamily: 'var(--font-plex-mono), ui-monospace, monospace', fontSize: '11px', lineHeight: 1.4 }}>
                  External links to the Reserve Bank of India. For reference only.
                </div>
              </div>
            )}
          </div>}

          <Link href="/login" className={`${publicLanding ? 'text-xs sm:text-sm' : 'hidden sm:block'} hover:text-[#104D35] transition-colors py-2 whitespace-nowrap`}>Sign In</Link>
          <Link href="/login" className={`${publicLanding ? 'px-1 gap-1 text-[9px] min-[440px]:px-2 min-[440px]:gap-2 min-[440px]:text-[10px] sm:px-5 sm:text-xs' : 'px-3 sm:px-5 text-xs'} py-2.5 rounded-sm text-[#FBFAF6] transition-all hover:opacity-90 flex items-center uppercase tracking-wider whitespace-nowrap`} style={{ background: '#104D35' }}>
            Enter Workspace <span aria-hidden="true">&rarr;</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
