'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('rahul.sharma@trustline.in');
  const [password, setPassword] = useState('trustline-demo');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const signIn = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    window.setTimeout(() => { login(email); router.replace('/'); }, 350);
  };

  // Shared input container style
  const inputWrap = (focused: boolean): React.CSSProperties => ({
    position: 'relative',
    marginTop: 6,
    borderRadius: 9,
    background: '#202020',
    border: `1px solid ${focused ? '#E8C66A' : 'rgba(255,255,255,0.12)'}`,
    boxShadow: focused ? '0 0 0 3px rgba(232,198,106,0.10)' : 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    display: 'flex',
    alignItems: 'center',
  });

  const inputStyle: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    width: '100%',
    fontSize: 14,
    color: '#F5F2EA',
    padding: '11px 12px 11px 44px',
  };

  const iconStyle = (focused: boolean): React.CSSProperties => ({
    position: 'absolute',
    left: 14,
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
    width: 16,
    height: 16,
    color: focused ? '#E8C66A' : '#B8B5AE',
    transition: 'color 0.15s',
    flexShrink: 0,
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: '#111111',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 900,
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1.05fr) minmax(0,0.95fr)',
        overflow: 'hidden',
        borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.08)',
        background: '#1B1B1B',
        boxShadow: '0 16px 60px rgba(0,0,0,0.7)',
      }} className="max-md:grid-cols-1">

        {/* ── Left Brand Panel ── */}
        <section style={{
          background: 'linear-gradient(155deg, #1A1A18 0%, #111111 100%)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          padding: '44px 40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }} className="hidden md:flex">
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'rgba(232,198,106,0.12)',
              border: '1px solid rgba(232,198,106,0.3)',
              display: 'grid', placeItems: 'center',
            }}>
              <ShieldCheck style={{ width: 20, height: 20, color: '#E8C66A' }} />
            </span>
            <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '0.08em', color: '#F5F2EA' }}>
              TRUSTLINE
            </span>
          </div>

          {/* Hero copy */}
          <div style={{ maxWidth: 320 }}>
            <p style={{
              fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: '#E8C66A', marginBottom: 14
            }}>
              Financial Crime Intelligence
            </p>
            <h1 style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.25, color: '#F5F2EA', marginBottom: 16 }}>
              Make every investigation defensible.
            </h1>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: '#B8B5AE' }}>
              A focused workspace for connected risk signals, evidence, and case decisions.
            </p>
          </div>

          <p style={{ fontSize: 11, color: '#85827C' }}>
            Secure access for authorised investigation teams.
          </p>
        </section>

        {/* ── Right Form Panel ── */}
        <section style={{ padding: '44px 40px' }}>
          {/* Mobile brand */}
          <div style={{
            display: 'none', alignItems: 'center', gap: 8, marginBottom: 28,
            fontSize: 14, fontWeight: 700, color: '#E8C66A'
          }}
            className="flex md:hidden">
            <ShieldCheck style={{ width: 18, height: 18 }} />
            TRUSTLINE
          </div>

          {/* Heading */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#F5F2EA', letterSpacing: '-0.01em' }}>
              Sign in to your workspace
            </h2>
            <p style={{ fontSize: 13, color: '#B8B5AE', marginTop: 6 }}>
              Use your work email to continue.
            </p>
          </div>

          <form onSubmit={signIn} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Email */}
            <label style={{ display: 'block' }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#F5F2EA' }}>Work email</span>
              <div style={inputWrap(emailFocused)}>
                <Mail style={iconStyle(emailFocused)} />
                <input
                  style={inputStyle}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  placeholder="you@company.com"
                  required
                />
              </div>
            </label>

            {/* Password */}
            <label style={{ display: 'block' }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#F5F2EA' }}>Password</span>
              <div style={inputWrap(passwordFocused)}>
                <LockKeyhole style={iconStyle(passwordFocused)} />
                <input
                  style={{ ...inputStyle, paddingRight: 44 }}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  placeholder="••••••••••••"
                  required
                />
                <button
                  type="button"
                  aria-label="Toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#B8B5AE', padding: 0, display: 'flex', alignItems: 'center',
                  }}
                >
                  {showPassword
                    ? <EyeOff style={{ width: 16, height: 16 }} />
                    : <Eye style={{ width: 16, height: 16 }} />}
                </button>
              </div>
            </label>

            {/* Remember + Forgot */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#B8B5AE', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked style={{ accentColor: '#E8C66A' }} />
                Remember this device
              </label>
              <Link href="/forgot-password"
                style={{ fontWeight: 600, color: '#E8C66A', textDecoration: 'none', fontSize: 12 }}>
                Forgot password?
              </Link>
            </div>

            {/* Primary CTA */}
            <button
              disabled={isSubmitting}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                width: '100%', padding: '12px 20px', borderRadius: 9,
                background: isSubmitting ? 'rgba(232,198,106,0.5)' : '#E8C66A',
                color: '#111111', border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontSize: 14, fontWeight: 700, letterSpacing: '0.01em',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (!isSubmitting) (e.currentTarget as HTMLButtonElement).style.background = '#F0D07A'; }}
              onMouseLeave={e => { if (!isSubmitting) (e.currentTarget as HTMLButtonElement).style.background = '#E8C66A'; }}
            >
              {isSubmitting ? 'Signing in…' : 'Sign in'}
              {!isSubmitting && <ArrowRight style={{ width: 16, height: 16 }} />}
            </button>
          </form>

          {/* Divider */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            margin: '20px 0', fontSize: 11, color: '#85827C',
          }}>
            <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
            or
            <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
          </div>

          {/* Demo button */}
          <button
            disabled={isSubmitting}
            onClick={() => {
              setIsSubmitting(true);
              window.setTimeout(() => { login('rahul.sharma@trustline.in'); router.replace('/'); }, 250);
            }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '100%', padding: '11px 20px', borderRadius: 9,
              background: 'rgba(255,255,255,0.04)', color: '#B8B5AE',
              border: '1px solid rgba(255,255,255,0.10)', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)';
              (e.currentTarget as HTMLButtonElement).style.color = '#F5F2EA';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)';
              (e.currentTarget as HTMLButtonElement).style.color = '#B8B5AE';
            }}
          >
            Enter demo workspace
          </button>

          <p style={{ marginTop: 24, textAlign: 'center', fontSize: 11, color: '#85827C' }}>
            Protected by Trustline security controls.
          </p>
        </section>
      </div>
    </div>
  );
}
