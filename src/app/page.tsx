'use client';

import React from 'react';
import LandingNavbar from '@/components/landing/Navbar';
import SignalGrid from '@/components/landing/SignalGrid';
import Hero from '@/components/landing/Hero';
import Closing from '@/components/landing/Closing';
import Footer from '@/components/landing/Footer';
import './landing.css';

export default function LandingPage() {
  return (
    <div className="landing-root relative min-h-screen overflow-x-hidden">

      {/* 1. Canvas Interactive Layer (Grid Dots) */}
      <SignalGrid />

      {/* 2. Top Navigation */}
      <LandingNavbar publicLanding />

      {/* 3. Editorial Content Array */}
      <div className="relative z-10 w-full overflow-hidden">
        {/* Signatures */}
        <Hero />

        {/* Minimal CTA / Buffer for pinning scroll */}
        <Closing />

      </div>

      <Footer />

    </div>
  );
}
