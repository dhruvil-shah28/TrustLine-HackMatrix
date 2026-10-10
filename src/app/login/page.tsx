'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserCheck,
  Briefcase,
  UserPlus,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Building2,
} from 'lucide-react';

type AuthRole = 'INVESTIGATOR' | 'EMPLOYEE';
type FormMode = 'SIGN_IN' | 'REGISTER' | 'ACTIVATE';

export default function LoginPage() {
  const router = useRouter();
  const { refreshSession } = useAuth();

  // Role Selection
  const [selectedRole, setSelectedRole] = useState<AuthRole>('INVESTIGATOR');
  const [formMode, setFormMode] = useState<FormMode>('SIGN_IN');

  // Form Fields
  const [employeeCode, setEmployeeCode] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Commercial Banking');
  const [password, setPassword] = useState('');
  const [accessJustification, setAccessJustification] = useState('');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [assignedCode, setAssignedCode] = useState<string | null>(null);

  // Focus tracking
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');
    setAssignedCode(null);

    try {
      if (selectedRole === 'EMPLOYEE') {
        if (formMode === 'SIGN_IN') {
          const res = await fetch('/api/auth/employee/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({
              employeeCode: employeeCode.trim(),
              password,
            }),
          });
          const data = await res.json();
          if (!res.ok) {
            setErrorMessage(data.error || 'Sign-in failed. Check your Employee ID and password.');
            return;
          }

          const verified = await refreshSession();
          if (!verified) {
            setErrorMessage('Login succeeded, but session verification failed.');
            return;
          }
          router.replace('/employee');
          router.refresh();
        } else if (formMode === 'REGISTER') {
          const res = await fetch('/api/auth/employee/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name,
              email,
              department,
              password,
            }),
          });
          const data = await res.json();
          if (!res.ok) {
            setErrorMessage(data.error || 'Registration failed.');
            return;
          }

          setAssignedCode(data.employee.employeeCode);
          setSuccessMessage(`Account created successfully! Assigned Employee ID: ${data.employee.employeeCode}`);

          const verified = await refreshSession();
          if (verified) {
            setTimeout(() => {
              router.replace('/employee');
              router.refresh();
            }, 2000);
          }
        } else if (formMode === 'ACTIVATE') {
          const res = await fetch('/api/auth/employee/activate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              employeeCode: employeeCode.trim(),
              email: email.trim(),
              password,
            }),
          });
          const data = await res.json();
          if (!res.ok) {
            setErrorMessage(data.error || 'Activation failed.');
            return;
          }
          setSuccessMessage('Account activated successfully! You can now sign in.');
          setFormMode('SIGN_IN');
        }
      } else {
        // INVESTIGATOR
        if (formMode === 'SIGN_IN') {
          const res = await fetch('/api/auth/investigator', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({
              email: email.trim(),
              employeeCode: employeeCode.trim(),
              password,
            }),
          });
          const data = await res.json();
          if (!res.ok) {
            setErrorMessage(data.error || 'Investigator authentication failed.');
            return;
          }
          await refreshSession();
          router.replace(data.redirectTo || '/');
          router.refresh();
        } else {
          // Request Access / Onboarding
          const res = await fetch('/api/auth/investigator', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'request-access',
              name,
              email,
              department,
              accessJustification,
            }),
          });
          const data = await res.json();
          if (!res.ok) {
            setErrorMessage(data.error || 'Access request failed.');
            return;
          }
          setSuccessMessage(data.message);
        }
      }
    } catch {
      setErrorMessage('Unable to connect to the authentication service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputWrap = (fieldKey: string): React.CSSProperties => ({
    position: 'relative',
    marginTop: 6,
    borderRadius: 9,
    background: '#202020',
    border: `1px solid ${focusedField === fieldKey ? '#E8C66A' : 'rgba(255,255,255,0.12)'}`,
    boxShadow: focusedField === fieldKey ? '0 0 0 3px rgba(232,198,106,0.10)' : 'none',
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

  const iconStyle = (fieldKey: string): React.CSSProperties => ({
    position: 'absolute',
    left: 14,
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
    width: 16,
    height: 16,
    color: focusedField === fieldKey ? '#E8C66A' : '#B8B5AE',
    transition: 'color 0.15s',
    flexShrink: 0,
  });

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#111111',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 960,
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1.05fr) minmax(0,0.95fr)',
          overflow: 'hidden',
          borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.08)',
          background: '#1B1B1B',
          boxShadow: '0 16px 60px rgba(0,0,0,0.7)',
        }}
        className="max-md:grid-cols-1"
      >
        {/* ── Left Brand & Role Selection Panel ── */}
        <section
          style={{
            background: 'linear-gradient(155deg, #1A1A18 0%, #111111 100%)',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            padding: '44px 40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
          className="hidden md:flex"
        >
          {/* Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'rgba(232,198,106,0.12)',
                border: '1px solid rgba(232,198,106,0.3)',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <ShieldCheck style={{ width: 20, height: 20, color: '#E8C66A' }} />
            </span>
            <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '0.08em', color: '#F5F2EA' }}>
              TRUSTLINE
            </span>
          </div>

          {/* Core Value Statement & Role Overview */}
          <div style={{ maxWidth: 360 }}>
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#E8C66A',
                marginBottom: 14,
              }}
            >
              Unified Authentication Portal
            </p>

            <h1 style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.25, color: '#F5F2EA', marginBottom: 16 }}>
              {selectedRole === 'INVESTIGATOR'
                ? 'Authorized Risk & Financial Crime Investigation Workspace.'
                : 'Employee Banking Operations & Account Workspace.'}
            </h1>

            <p style={{ fontSize: 13, lineHeight: 1.7, color: '#B8B5AE', marginBottom: 24 }}>
              {selectedRole === 'INVESTIGATOR'
                ? 'Access Attack DNA, Hidden Link Hunter, Behavioural Drift Radar, Counterfactual Simulations, and Cryptographic Evidence Seals.'
                : 'Access customer accounts, limit overrides, transaction processing, and internal banking workflows.'}
            </p>

            {/* Features summary badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {selectedRole === 'INVESTIGATOR' ? (
                <>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    EVIDENCE LOCK (SHA-256)
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                    BEHAVIOURAL DRIFT
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                    HIDDEN LINK HUNTER
                  </span>
                </>
              ) : (
                <>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    CUSTOMER PORTAL
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                    LIMIT OVERRIDES
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-slate-500/10 text-slate-300 border border-slate-500/30">
                    AUDIT TRAIL LOGS
                  </span>
                </>
              )}
            </div>
          </div>

          <p style={{ fontSize: 11, color: '#85827C' }}>
            Protected by TrustLine multi-tenant authorization controls.
          </p>
        </section>

        {/* ── Right Form Panel ── */}
        <section style={{ padding: '40px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {/* Mobile brand header */}
          <div
            style={{
              display: 'none',
              alignItems: 'center',
              gap: 8,
              marginBottom: 20,
              fontSize: 14,
              fontWeight: 700,
              color: '#E8C66A',
            }}
            className="flex md:hidden"
          >
            <ShieldCheck style={{ width: 18, height: 18 }} />
            TRUSTLINE
          </div>

          {/* Role Choice Selector */}
          <div style={{ marginBottom: 24 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#85827C', textTransform: 'uppercase' }}>
              Select Workspace Role
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('INVESTIGATOR');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                style={{
                  padding: '10px 14px',
                  borderRadius: 9,
                  border: `1px solid ${selectedRole === 'INVESTIGATOR' ? '#E8C66A' : 'rgba(255,255,255,0.1)'}`,
                  background: selectedRole === 'INVESTIGATOR' ? 'rgba(232,198,106,0.12)' : '#202020',
                  color: selectedRole === 'INVESTIGATOR' ? '#E8C66A' : '#B8B5AE',
                  fontSize: 13,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <Briefcase style={{ width: 15, height: 15 }} />
                Investigator
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedRole('EMPLOYEE');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                style={{
                  padding: '10px 14px',
                  borderRadius: 9,
                  border: `1px solid ${selectedRole === 'EMPLOYEE' ? '#E8C66A' : 'rgba(255,255,255,0.1)'}`,
                  background: selectedRole === 'EMPLOYEE' ? 'rgba(232,198,106,0.12)' : '#202020',
                  color: selectedRole === 'EMPLOYEE' ? '#E8C66A' : '#B8B5AE',
                  fontSize: 13,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <UserCheck style={{ width: 15, height: 15 }} />
                Employee
              </button>
            </div>
          </div>

          {/* Mode Tabs (Sign In / Register / Activate) */}
          <div style={{ display: 'flex', gap: 16, borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 24, paddingBottom: 8 }}>
            <button
              type="button"
              onClick={() => {
                setFormMode('SIGN_IN');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              style={{
                fontSize: 13,
                fontWeight: formMode === 'SIGN_IN' ? 700 : 500,
                color: formMode === 'SIGN_IN' ? '#E8C66A' : '#85827C',
                borderBottom: formMode === 'SIGN_IN' ? '2px solid #E8C66A' : 'none',
                paddingBottom: 6,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Sign In
            </button>

            <button
              type="button"
              onClick={() => {
                setFormMode('REGISTER');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              style={{
                fontSize: 13,
                fontWeight: formMode === 'REGISTER' ? 700 : 500,
                color: formMode === 'REGISTER' ? '#E8C66A' : '#85827C',
                borderBottom: formMode === 'REGISTER' ? '2px solid #E8C66A' : 'none',
                paddingBottom: 6,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {selectedRole === 'INVESTIGATOR' ? 'Request Access' : 'Create Account'}
            </button>

            {selectedRole === 'EMPLOYEE' && (
              <button
                type="button"
                onClick={() => {
                  setFormMode('ACTIVATE');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                style={{
                  fontSize: 13,
                  fontWeight: formMode === 'ACTIVATE' ? 700 : 500,
                  color: formMode === 'ACTIVATE' ? '#E8C66A' : '#85827C',
                  borderBottom: formMode === 'ACTIVATE' ? '2px solid #E8C66A' : 'none',
                  paddingBottom: 6,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Activate ID
              </button>
            )}
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Employee ID input (for Employee Sign In or Activation) */}
            {selectedRole === 'EMPLOYEE' && (formMode === 'SIGN_IN' || formMode === 'ACTIVATE') && (
              <label style={{ display: 'block' }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#F5F2EA' }}>Employee ID</span>
                <div style={inputWrap('employeeCode')}>
                  <ShieldCheck style={iconStyle('employeeCode')} />
                  <input
                    style={inputStyle}
                    type="text"
                    value={employeeCode}
                    onChange={(e) => setEmployeeCode(e.target.value.toUpperCase())}
                    onFocus={() => setFocusedField('employeeCode')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="e.g. EMP-1001"
                    required
                  />
                </div>
              </label>
            )}

            {/* Name input (for Register or Request Access) */}
            {formMode === 'REGISTER' && (
              <label style={{ display: 'block' }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#F5F2EA' }}>Full Name</span>
                <div style={inputWrap('name')}>
                  <UserPlus style={iconStyle('name')} />
                  <input
                    style={inputStyle}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="e.g. Ananya Sharma"
                    required
                  />
                </div>
              </label>
            )}

            {/* Email input (for Investigator Sign In, Registration, or Activation) */}
            {(selectedRole === 'INVESTIGATOR' || formMode === 'REGISTER' || formMode === 'ACTIVATE') && (
              <label style={{ display: 'block' }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#F5F2EA' }}>Work Email</span>
                <div style={inputWrap('email')}>
                  <Mail style={iconStyle('email')} />
                  <input
                    style={inputStyle}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="name@apexbank.com"
                    required
                  />
                </div>
              </label>
            )}

            {/* Department input (for Registration or Access Request) */}
            {formMode === 'REGISTER' && (
              <label style={{ display: 'block' }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#F5F2EA' }}>Department / Business Unit</span>
                <div style={inputWrap('department')}>
                  <Building2 style={iconStyle('department')} />
                  <input
                    style={inputStyle}
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    onFocus={() => setFocusedField('department')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="e.g. Commercial Credit / AML Unit"
                    required
                  />
                </div>
              </label>
            )}

            {/* Access Justification (for Investigator Request Access) */}
            {selectedRole === 'INVESTIGATOR' && formMode === 'REGISTER' && (
              <label style={{ display: 'block' }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#F5F2EA' }}>Investigation Access Justification</span>
                <div style={{ ...inputWrap('accessJustification'), height: 80, alignItems: 'flex-start', paddingTop: 8 }}>
                  <Briefcase style={{ ...iconStyle('accessJustification'), top: 18 }} />
                  <textarea
                    style={{ ...inputStyle, height: '100%', resize: 'none', paddingLeft: 44, paddingTop: 4 }}
                    value={accessJustification}
                    onChange={(e) => setAccessJustification(e.target.value)}
                    onFocus={() => setFocusedField('accessJustification')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Provide your case code or supervisor authorization details..."
                    required
                  />
                </div>
              </label>
            )}

            {/* Password input (except for Investigator Request Access) */}
            {!(selectedRole === 'INVESTIGATOR' && formMode === 'REGISTER') && (
              <label style={{ display: 'block' }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#F5F2EA' }}>Password</span>
                <div style={inputWrap('password')}>
                  <LockKeyhole style={iconStyle('password')} />
                  <input
                    style={{ ...inputStyle, paddingRight: 44 }}
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="••••••••••••"
                    required
                  />
                  <button
                    type="button"
                    aria-label="Toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#B8B5AE',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {showPassword ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                  </button>
                </div>
              </label>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 12px',
                  borderRadius: 8,
                  background: 'rgba(255,141,141,0.1)',
                  border: '1px solid rgba(255,141,141,0.3)',
                  color: '#FF8D8D',
                  fontSize: 12,
                }}
              >
                <AlertCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  padding: '10px 12px',
                  borderRadius: 8,
                  background: 'rgba(52,211,153,0.1)',
                  border: '1px solid rgba(52,211,153,0.3)',
                  color: '#34D399',
                  fontSize: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                  <CheckCircle2 style={{ width: 16, height: 16 }} />
                  <span>Success</span>
                </div>
                <span>{successMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              disabled={isSubmitting}
              type="submit"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                width: '100%',
                padding: '12px 20px',
                marginTop: 6,
                borderRadius: 9,
                background: isSubmitting ? 'rgba(232,198,106,0.5)' : '#E8C66A',
                color: '#111111',
                border: 'none',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: '0.01em',
                transition: 'background 0.15s',
              }}
            >
              {isSubmitting
                ? 'Processing...'
                : formMode === 'SIGN_IN'
                ? `Sign In as ${selectedRole === 'INVESTIGATOR' ? 'Investigator' : 'Employee'}`
                : formMode === 'REGISTER'
                ? selectedRole === 'INVESTIGATOR'
                  ? 'Submit Access Request'
                  : 'Register Employee Account'
                : 'Activate Account'}
              {!isSubmitting && <ArrowRight style={{ width: 16, height: 16 }} />}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
