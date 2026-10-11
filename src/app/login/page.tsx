'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
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
          router.replace(data.redirectTo || '/dashboard');
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
    background: '#FFFFFF',
    border: `1px solid ${focusedField === fieldKey ? '#203234' : '#D7E2DA'}`,
    borderRadius: 8,
    boxShadow: focusedField === fieldKey ? '0 0 0 3px rgba(142,228,208,0.55)' : 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    display: 'flex',
    alignItems: 'center',
    height: 52,
  });

  const inputStyle: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    width: '100%',
    fontSize: 15,
    color: '#1B2426',
    padding: '0 12px 0 44px',
    height: '100%',
  };

  const iconStyle = (fieldKey: string): React.CSSProperties => ({
    position: 'absolute',
    left: 14,
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
    width: 20,
    height: 20,
    color: 'rgba(27,36,38,0.55)',
    transition: 'color 0.15s',
    flexShrink: 0,
  });

  return (
    <div
      className="w-full"
      style={{
        minHeight: '100vh',
        background: '#355F5A',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 56,
        paddingBottom: 56,
        paddingLeft: 20,
        paddingRight: 20,
        fontFamily: 'var(--font-plex-sans), "IBM Plex Sans", system-ui, sans-serif'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 1180,
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          margin: '0 auto',
        }}
      >
        <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start' }}>
          <Image
            src="/brand/trustline-full.png"
            alt="TRUSTLINE"
            width={260}
            height={70}
            priority
            style={{
              width: 240,
              height: 'auto',
              objectFit: 'contain',
              display: 'block',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.18))',
            }}
          />
        </div>

        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            gap: 40,
            margin: 0,
          }}
          className="flex-col min-[900px]:flex-row"
        >
        {/* ── Left Block ── */}
        <section
          style={{
            flex: '1 1 52%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            position: 'relative'
          }}
          className="w-full"
        >

          <div style={{ marginTop: 40, position: 'relative', zIndex: 10 }}>
            {/* EYEBROW */}
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#C3F0E5',
                marginBottom: 16,
              }}
            >
              Unified Authentication Portal
            </p>

            {/* HEADLINE */}
            <h1 style={{ fontSize: 'clamp(38px, 4.6vw, 72px)', fontWeight: 700, lineHeight: 1.02, letterSpacing: '-0.02em', color: '#D7F9F0', marginBottom: 24, textWrap: 'balance', maxWidth: 640 }}>
              {selectedRole === 'INVESTIGATOR'
                ? 'Authorized Risk & Financial Crime Investigation Workspace.'
                : 'Employee Banking Operations & Account Workspace.'}
            </h1>

            {/* PARAGRAPH */}
            <p style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.7, color: '#F0F8F6', opacity: 0.9, marginBottom: 32, maxWidth: 520 }}>
              {selectedRole === 'INVESTIGATOR'
                ? 'Access Attack DNA, Hidden Link Hunter, Behavioural Drift Radar, Counterfactual Simulations, and Cryptographic Evidence Seals.'
                : 'Access customer accounts, limit overrides, transaction processing, and internal banking workflows.'}
            </p>
          </div>
        </section>

        {/* ── Right Form Card ── */}
        <section
          style={{
            flex: '1 1 44%',
            background: '#F8F7F3',
            borderRadius: 14,
            padding: 40,
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            maxWidth: 460,
            width: '100%',
            height: 'fit-content'
          }}
          className="mx-auto min-[900px]:mx-0"
        >
          {/* Role Choice Selector */}
          <div style={{ marginBottom: 32 }}>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', color: 'rgba(27,36,38,0.6)', textTransform: 'uppercase' }}>
              Select Workspace Role
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('INVESTIGATOR');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                style={{
                  height: 44,
                  borderRadius: 999,
                  border: `1px solid ${selectedRole === 'INVESTIGATOR' ? '#203234' : '#D7E2DA'}`,
                  background: selectedRole === 'INVESTIGATOR' ? '#203234' : '#FFFFFF',
                  color: selectedRole === 'INVESTIGATOR' ? '#FFFFFF' : '#1B2426',
                  fontSize: 14,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <Briefcase style={{ width: 16, height: 16 }} />
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
                  height: 44,
                  borderRadius: 999,
                  border: `1px solid ${selectedRole === 'EMPLOYEE' ? '#203234' : '#D7E2DA'}`,
                  background: selectedRole === 'EMPLOYEE' ? '#203234' : '#FFFFFF',
                  color: selectedRole === 'EMPLOYEE' ? '#FFFFFF' : '#1B2426',
                  fontSize: 14,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <UserCheck style={{ width: 16, height: 16 }} />
                Employee
              </button>
            </div>
          </div>

          {/* Mode Tabs */}
          <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid #E4E8E7', marginBottom: 28, paddingBottom: 0 }}>
            <button
              type="button"
              onClick={() => {
                setFormMode('SIGN_IN');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              style={{
                fontSize: 15,
                fontWeight: formMode === 'SIGN_IN' ? 600 : 500,
                color: formMode === 'SIGN_IN' ? '#1B2426' : 'rgba(27,36,38,0.55)',
                borderBottom: formMode === 'SIGN_IN' ? '2px solid #203234' : '2px solid transparent',
                paddingBottom: 12,
                marginBottom: -1,
                background: 'none',
                borderTop: 'none', borderLeft: 'none', borderRight: 'none',
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
                fontSize: 15,
                fontWeight: formMode === 'REGISTER' ? 600 : 500,
                color: formMode === 'REGISTER' ? '#1B2426' : 'rgba(27,36,38,0.55)',
                borderBottom: formMode === 'REGISTER' ? '2px solid #203234' : '2px solid transparent',
                paddingBottom: 12,
                marginBottom: -1,
                background: 'none',
                borderTop: 'none', borderLeft: 'none', borderRight: 'none',
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
                  fontSize: 15,
                  fontWeight: formMode === 'ACTIVATE' ? 600 : 500,
                  color: formMode === 'ACTIVATE' ? '#1B2426' : 'rgba(27,36,38,0.55)',
                  borderBottom: formMode === 'ACTIVATE' ? '2px solid #203234' : '2px solid transparent',
                  paddingBottom: 12,
                  marginBottom: -1,
                  background: 'none',
                  borderTop: 'none', borderLeft: 'none', borderRight: 'none',
                  cursor: 'pointer',
                }}
              >
                Activate ID
              </button>
            )}
          </div>

          {/* Demo Access Note */}
          {process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && (
            <div style={{
              background: '#F9FAFA',
              border: '1px solid #E4E8E7',
              borderRadius: 8,
              padding: '16px',
              marginBottom: 24,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, color: '#1B2426', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <CheckCircle2 style={{ width: 16, height: 16 }} />
                <span>Demo Access</span>
              </div>
              <p style={{ fontSize: 14, color: 'rgba(27,36,38,0.7)', margin: 0, lineHeight: 1.5 }}>
                {selectedRole === 'EMPLOYEE' ? (
                  <>
                    <strong style={{ color: '#1B2426' }}>Employee ID:</strong> EMP-1001 <br />
                    <strong style={{ color: '#1B2426' }}>Password:</strong> TL-Employee#2026
                  </>
                ) : (
                  <>
                    <strong style={{ color: '#1B2426' }}>Email:</strong> d.patel@apexbank.com <br />
                    <strong style={{ color: '#1B2426' }}>Password:</strong> TL-Employee#2026
                  </>
                )}
              </p>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 16px',
                marginBottom: 24,
                borderLeft: '3px solid #B8432F',
                background: '#FFF5F5',
                color: '#B8432F',
                fontSize: 13,
                fontWeight: 600,
                borderRadius: '0 8px 8px 0'
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
                alignItems: 'center',
                gap: 8,
                padding: '12px 16px',
                marginBottom: 24,
                borderLeft: '3px solid #203234',
                background: '#F0F5F4',
                color: '#203234',
                fontSize: 13,
                fontWeight: 600,
                borderRadius: '0 8px 8px 0'
              }}
            >
              <CheckCircle2 style={{ width: 16, height: 16, flexShrink: 0 }} />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form Content */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Employee ID */}
            {selectedRole === 'EMPLOYEE' && (formMode === 'SIGN_IN' || formMode === 'ACTIVATE') && (
              <label style={{ display: 'block' }}>
                <div style={{ marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#1B2426' }}>Employee ID</span>
                </div>
                <div style={inputWrap('employeeCode')}>
                  <ShieldCheck style={iconStyle('employeeCode')} />
                  <input
                    className="placeholder-[rgba(27,36,38,0.4)]"
                    style={inputStyle}
                    type="text"
                    value={employeeCode}
                    onChange={(e) => setEmployeeCode(e.target.value.toUpperCase())}
                    onFocus={() => setFocusedField('employeeCode')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="EMP-1001"
                    required
                  />
                </div>
              </label>
            )}

            {/* Name */}
            {formMode === 'REGISTER' && (
              <label style={{ display: 'block' }}>
                <div style={{ marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#1B2426' }}>Full Name</span>
                </div>
                <div style={inputWrap('name')}>
                  <UserPlus style={iconStyle('name')} />
                  <input
                    className="placeholder-[rgba(27,36,38,0.4)]"
                    style={inputStyle}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Ananya Sharma"
                    required
                  />
                </div>
              </label>
            )}

            {/* Email */}
            {(selectedRole === 'INVESTIGATOR' || formMode === 'REGISTER' || formMode === 'ACTIVATE') && (
              <label style={{ display: 'block' }}>
                <div style={{ marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#1B2426' }}>Work Email</span>
                </div>
                <div style={inputWrap('email')}>
                  <Mail style={iconStyle('email')} />
                  <input
                    className="placeholder-[rgba(27,36,38,0.4)]"
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

            {/* Department */}
            {formMode === 'REGISTER' && (
              <label style={{ display: 'block' }}>
                <div style={{ marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#1B2426' }}>Department / Business Unit</span>
                </div>
                <div style={inputWrap('department')}>
                  <Building2 style={iconStyle('department')} />
                  <input
                    className="placeholder-[rgba(27,36,38,0.4)]"
                    style={inputStyle}
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    onFocus={() => setFocusedField('department')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Commercial Credit / AML Unit"
                    required
                  />
                </div>
              </label>
            )}

            {/* Access Justification */}
            {selectedRole === 'INVESTIGATOR' && formMode === 'REGISTER' && (
              <label style={{ display: 'block' }}>
                <div style={{ marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#1B2426' }}>Investigation Access Justification</span>
                </div>
                <div style={{ ...inputWrap('accessJustification'), height: 100, alignItems: 'flex-start' }}>
                  <Briefcase style={{ ...iconStyle('accessJustification'), top: 22 }} />
                  <textarea
                    className="placeholder-[rgba(27,36,38,0.4)]"
                    style={{ ...inputStyle, height: '100%', resize: 'none', paddingLeft: 44, paddingTop: 16 }}
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

            {/* Password input */}
            {!(selectedRole === 'INVESTIGATOR' && formMode === 'REGISTER') && (
              <label style={{ display: 'block' }}>
                <div style={{ marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#1B2426' }}>Password</span>
                </div>
                <div style={inputWrap('password')}>
                  <LockKeyhole style={iconStyle('password')} />
                  <input
                    className="placeholder-[rgba(27,36,38,0.4)]"
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
                      color: 'rgba(27,36,38,0.55)',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {showPassword ? <EyeOff style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
                  </button>
                </div>
              </label>
            )}

            {/* Submit Button */}
            <button
              disabled={isSubmitting}
              type="submit"
              className="hover:bg-[#2D4044]"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                width: '100%',
                height: 54,
                marginTop: 16,
                background: '#203234',
                color: '#FFFFFF',
                opacity: isSubmitting ? 0.6 : 1,
                border: 'none',
                borderRadius: 999,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontSize: 16,
                fontWeight: 600,
                transition: 'all 0.15s',
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
              {!isSubmitting && <ArrowRight style={{ width: 18, height: 18 }} />}
            </button>

          </form>
        </section>
      </div>
    </div>
  </div>
  );
}
