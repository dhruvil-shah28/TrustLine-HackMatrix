import sys, re

# ================= LOGINTRACE RECOLOUR =================
with open('src/components/landing/LoginTrace.tsx', 'r', encoding='utf-8') as f:
    trace = f.read()

trace = trace.replace('#B8432F', '#8EE4D0') # mint
trace = trace.replace('#EFE9DA', '#FFFFFF') # base text
trace = re.sub(r'<circle[^>]*fill="#C9A45C"[^>]*/>\s*', '', trace) # remove brass dots
trace = trace.replace('opacity="0.14"', 'opacity="0.2"')

with open('src/components/landing/LoginTrace.tsx', 'w', encoding='utf-8') as f:
    f.write(trace)

# ================= PAGE.TSX REWRITE =================
with open('src/app/login/page.tsx', 'r', encoding='utf-8') as f:
    page = f.read()

# Splice point 1: Add Poppins Import
if 'import { Poppins } from' not in page:
    if 'import LandingNavbar' in page:
        page = page.replace('import LandingNavbar', 'import { Poppins } from \'next/font/google\';\nimport LandingNavbar')
        
    if 'const poppins = Poppins' not in page:
        page = page.replace('export default function LoginPage() {', '''const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
});

export default function LoginPage() {''')

# Splice point 2: replace all styles down from inputWrap
idx = page.find('  const inputWrap')
if idx == -1:
    print('Could not find inputWrap!')
    sys.exit(1)

logic_part = page[:idx]

# New Return block
new_return = r'''  const inputWrap = (fieldKey: string): React.CSSProperties => ({
    position: 'relative',
    marginTop: 6,
    background: '#FFFFFF',
    border: `1px solid ${focusedField === fieldKey ? '#223033' : '#D9DEDD'}`,
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
      className={`${poppins.variable} w-full`}
      style={{
        minHeight: '100vh',
        background: '#223033',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 120,
        paddingBottom: 56,
        paddingLeft: 20,
        paddingRight: 20,
        fontFamily: 'var(--font-poppins), system-ui, sans-serif'
      }}
    >
      <LandingNavbar />

      <div
        style={{
          width: '100%',
          maxWidth: 1280,
          display: 'flex',
          justifyContent: 'space-between',
          gap: 64,
          margin: 'auto 0',
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
          {/* Logo on white pill */}
          <div style={{ display: 'inline-flex', alignItems: 'center', background: '#FFFFFF', padding: '8px 12px', borderRadius: 10, alignSelf: 'flex-start' }}>
            <Image 
              src="/brand/trustline-full.png" 
              alt="TRUSTLINE" 
              width={160} 
              height={36} 
              style={{ height: 32, width: 'auto', objectFit: 'contain' }} 
            />
          </div>
          
          <div style={{ marginTop: 40, position: 'relative', zIndex: 10 }}>
            {/* EYEBROW */}
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#8EE4D0',
                marginBottom: 16,
              }}
            >
              Unified Authentication Portal
            </p>

            {/* HEADLINE */}
            <h1 style={{ fontSize: 'clamp(38px, 4.6vw, 72px)', fontWeight: 700, lineHeight: 1.02, letterSpacing: '-0.02em', color: '#8EE4D0', marginBottom: 24, textWrap: 'balance', maxWidth: 640 }}>
              {selectedRole === 'INVESTIGATOR'
                ? 'Authorized Risk & Financial Crime Investigation Workspace.'
                : 'Employee Banking Operations & Account Workspace.'}
            </h1>

            {/* PARAGRAPH */}
            <p style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.7, color: '#FFFFFF', opacity: 0.78, marginBottom: 32, maxWidth: 520 }}>
              {selectedRole === 'INVESTIGATOR'
                ? 'Access Attack DNA, Hidden Link Hunter, Behavioural Drift Radar, Counterfactual Simulations, and Cryptographic Evidence Seals.'
                : 'Access customer accounts, limit overrides, transaction processing, and internal banking workflows.'}
            </p>

            {/* FEATURE LABELS */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 40 }}>
              {selectedRole === 'INVESTIGATOR' ? (
                <>
                  <span className="px-3 py-1.5 rounded-[6px] text-[12px] uppercase" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.28)', color: 'rgba(255,255,255,0.82)', fontWeight: 500, letterSpacing: '0.06em' }}>
                    EVIDENCE LOCK (SHA-256)
                  </span>
                  <span className="px-3 py-1.5 rounded-[6px] text-[12px] uppercase" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.28)', color: 'rgba(255,255,255,0.82)', fontWeight: 500, letterSpacing: '0.06em' }}>
                    BEHAVIOURAL DRIFT
                  </span>
                  <span className="px-3 py-1.5 rounded-[6px] text-[12px] uppercase" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.28)', color: 'rgba(255,255,255,0.82)', fontWeight: 500, letterSpacing: '0.06em' }}>
                    HIDDEN LINK HUNTER
                  </span>
                </>
              ) : (
                <>
                  <span className="px-3 py-1.5 rounded-[6px] text-[12px] uppercase" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.28)', color: 'rgba(255,255,255,0.82)', fontWeight: 500, letterSpacing: '0.06em' }}>
                    CUSTOMER PORTAL
                  </span>
                  <span className="px-3 py-1.5 rounded-[6px] text-[12px] uppercase" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.28)', color: 'rgba(255,255,255,0.82)', fontWeight: 500, letterSpacing: '0.06em' }}>
                    LIMIT OVERRIDES
                  </span>
                  <span className="px-3 py-1.5 rounded-[6px] text-[12px] uppercase" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.28)', color: 'rgba(255,255,255,0.82)', fontWeight: 500, letterSpacing: '0.06em' }}>
                    AUDIT TRAIL LOGS
                  </span>
                </>
              )}
            </div>
            
            {/* TRACE COMPONENT */}
            <div className="hidden min-[1200px]:block relative w-full h-[300px] pointer-events-none mb-4">
              <LoginTrace />
            </div>

            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
              Protected by TrustLine multi-tenant authorization controls.
            </p>
          </div>
        </section>

        {/* ── Right Form Card ── */}
        <section 
          style={{
            flex: '1 1 44%',
            background: '#FFFFFF',
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
                  border: `1px solid ${selectedRole === 'INVESTIGATOR' ? '#223033' : '#D9DEDD'}`,
                  background: selectedRole === 'INVESTIGATOR' ? '#223033' : '#FFFFFF',
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
                  border: `1px solid ${selectedRole === 'EMPLOYEE' ? '#223033' : '#D9DEDD'}`,
                  background: selectedRole === 'EMPLOYEE' ? '#223033' : '#FFFFFF',
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
                borderBottom: formMode === 'SIGN_IN' ? '2px solid #223033' : '2px solid transparent',
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
                borderBottom: formMode === 'REGISTER' ? '2px solid #223033' : '2px solid transparent',
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
                  borderBottom: formMode === 'ACTIVATE' ? '2px solid #223033' : '2px solid transparent',
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
                borderLeft: '3px solid #223033',
                background: '#F0F5F4',
                color: '#223033',
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
                background: '#223033',
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
  );
}
'''

new_page = logic_part + new_return
with open('src/app/login/page.tsx', 'w', encoding='utf-8') as f:
    f.write(new_page)
