import sys, re

with open('src/app/login/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Add Image and Navbar imports
code = code.replace(
    'import { useRouter } from \'next/navigation\';',
    'import { useRouter } from \'next/navigation\';\nimport Image from \'next/image\';\nimport LandingNavbar from \'@/components/landing/Navbar\';'
)

# 1. Main Wrappers
code = code.replace(
    '''    <div
      style={{
        minHeight: '100vh',
        background: '#111111',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
      }}
    >''',
    '''    <div
      style={{
        minHeight: '100vh',
        background: '#F8F7F1',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '110px 16px 48px',
      }}
    >
      <LandingNavbar />'''
)

# 2. Main Card
code = code.replace(
'''      <div
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
        className=\"max-md:grid-cols-1\"
      >''',
'''      <div
        style={{
          width: '100%',
          maxWidth: 1200,
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1.05fr) minmax(0,0.95fr)',
          overflow: 'hidden',
          borderRadius: 12,
          border: '1px solid rgba(21, 25, 21, 0.12)',
          background: '#FFFFFF',
          boxShadow: '0 1px 2px rgba(21, 25, 21, 0.06)',
          margin: 'auto 0',
        }}
        className=\"max-md:grid-cols-1\"
      >'''
)

# 3. Left Panel Box
code = code.replace(
'''        <section
          style={{
            background: 'linear-gradient(155deg, #1A1A18 0%, #111111 100%)',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            padding: '44px 40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
          className="hidden md:flex"
        >''',
'''        <section
          style={{
            background: '#F1EFE6',
            borderRight: '1px solid rgba(21, 25, 21, 0.12)',
            padding: '44px 40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
          className="hidden md:flex"
        >'''
)

# 4. Logo replace
code = code.replace(
'''          {/* Brand Logo */}
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
          </div>''',
'''          {/* Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Image src=\"/brand/trustline-full.png\" alt=\"TRUSTLINE\" width={160} height={44} style={{ height: 44, width: 'auto', objectFit: 'contain' }} />
          </div>'''
)

# Eyebrow gold -> deep green
code = code.replace(
'''            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#E8C66A',''',
'''            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#0A3D2E','''
)

# Heading left ink text
code = code.replace(
    'h1 style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.25, color: \'#F5F2EA\', marginBottom: 16 }}',
    'h1 className=\"lp-font-space\" style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.25, color: \'#151915\', marginBottom: 16 }}'
)

# Paragraph ink @70%
code = code.replace(
    'p style={{ fontSize: 13, lineHeight: 1.7, color: \'#B8B5AE\', marginBottom: 24 }}',
    'p style={{ fontSize: 13, lineHeight: 1.7, color: \'rgba(21, 25, 21, 0.7)\', marginBottom: 24 }}'
)

# Chips replacement
chip_old = \"className=\\\"px-2.5 py-1 rounded-full text-[10px] lp-font-mono bg-{c}-500/10 text-{c}-300 border border-{c}-500/30\\\"\"
chip_str = \"className=\\\"px-2.5 py-1 rounded-[2px] text-[11px] lp-font-mono uppercase\\\" style={{ background: 'transparent', border: '1px solid rgba(21,25,21,0.25)', color: 'rgba(21,25,21,0.75)' }}\"

for c in ['amber', 'indigo', 'emerald', 'slate']:
    code = code.replace(chip_old.format(c=c), chip_str)

# Bottom note 55%
code = code.replace('p style={{ fontSize: 11, color: \'#85827C\' }}', 'p style={{ fontSize: 11, color: \'rgba(21, 25, 21, 0.55)\' }}')

# Right Mobile logo header color changing to deep green
code = code.replace(
'''            <div
              style={{
                display: 'none',
                alignItems: 'center',
                gap: 8,
                marginBottom: 20,
                fontSize: 14,
                fontWeight: 700,
                color: '#E8C66A',
              }}
              className=\"flex md:hidden\"
            >
              <ShieldCheck style={{ width: 18, height: 18 }} />
              TRUSTLINE
            </div>''',
'''            <div
              style={{
                display: 'none',
                alignItems: 'center',
                gap: 8,
                marginBottom: 20,
                fontSize: 14,
                fontWeight: 700,
                color: '#151915',
              }}
              className=\"flex md:hidden\"
            >
              <Image src=\"/brand/trustline-full.png\" alt=\"TRUSTLINE\" width={120} height={32} style={{ height: 32, width: 'auto', objectFit: 'contain' }} />
            </div>'''
)

# Role Selection
code = code.replace(
'''          {/* Role Choice Selector */}
          <div style={{ marginBottom: 24 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#85827C', textTransform: 'uppercase' }}>
              Select Workspace Role
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>''',
'''          {/* Role Choice Selector */}
          <div style={{ marginBottom: 24 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(21,25,21,0.55)', textTransform: 'uppercase' }}>
              Select Workspace Role
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>'''
)

code = code.replace('''                  border: `1px solid ${selectedRole === 'INVESTIGATOR' ? '#E8C66A' : 'rgba(255,255,255,0.1)'}`,
                  background: selectedRole === 'INVESTIGATOR' ? 'rgba(232,198,106,0.12)' : '#202020',
                  color: selectedRole === 'INVESTIGATOR' ? '#E8C66A' : '#B8B5AE',''',
'''                  border: `1px solid ${selectedRole === 'INVESTIGATOR' ? '#0A3D2E' : 'rgba(21,25,21,0.22)'}`,
                  background: selectedRole === 'INVESTIGATOR' ? '#0A3D2E' : '#FFFFFF',
                  color: selectedRole === 'INVESTIGATOR' ? '#F8F7F1' : '#151915',''')

code = code.replace('''                  borderRadius: 9,''', '''                  borderRadius: 6,''')

code = code.replace('''                  border: `1px solid ${selectedRole === 'EMPLOYEE' ? '#E8C66A' : 'rgba(255,255,255,0.1)'}`,
                  background: selectedRole === 'EMPLOYEE' ? 'rgba(232,198,106,0.12)' : '#202020',
                  color: selectedRole === 'EMPLOYEE' ? '#E8C66A' : '#B8B5AE',''',
'''                  border: `1px solid ${selectedRole === 'EMPLOYEE' ? '#0A3D2E' : 'rgba(21,25,21,0.22)'}`,
                  background: selectedRole === 'EMPLOYEE' ? '#0A3D2E' : '#FFFFFF',
                  color: selectedRole === 'EMPLOYEE' ? '#F8F7F1' : '#151915',''')

# Mode Tabs
code = code.replace('''borderBottom: '1px solid rgba(255,255,255,0.08)' ''', '''borderBottom: '1px solid rgba(21,25,21,0.12)' ''')

old_tab = '''                color: formMode === 'SIGN_IN' ? '#E8C66A' : '#85827C',
                borderBottom: formMode === 'SIGN_IN' ? '2px solid #E8C66A' : 'none','''
new_tab = '''                color: formMode === 'SIGN_IN' ? '#151915' : 'rgba(21,25,21,0.55)',
                borderBottom: formMode === 'SIGN_IN' ? '2px solid #0A3D2E' : 'none','''
code = code.replace(old_tab, new_tab)

old_tab2 = '''                color: formMode === 'REGISTER' ? '#E8C66A' : '#85827C',
                borderBottom: formMode === 'REGISTER' ? '2px solid #E8C66A' : 'none','''
new_tab2 = '''                color: formMode === 'REGISTER' ? '#151915' : 'rgba(21,25,21,0.55)',
                borderBottom: formMode === 'REGISTER' ? '2px solid #0A3D2E' : 'none','''
code = code.replace(old_tab2, new_tab2)

old_tab3 = '''                  color: formMode === 'ACTIVATE' ? '#E8C66A' : '#85827C',
                  borderBottom: formMode === 'ACTIVATE' ? '2px solid #E8C66A' : 'none','''
new_tab3 = '''                  color: formMode === 'ACTIVATE' ? '#151915' : 'rgba(21,25,21,0.55)',
                  borderBottom: formMode === 'ACTIVATE' ? '2px solid #0A3D2E' : 'none','''
code = code.replace(old_tab3, new_tab3)

# Demo mode box
code = code.replace(
'''            <div style={{
              background: 'rgba(232,198,106,0.1)',
              border: '1px solid rgba(232,198,106,0.3)',
              borderRadius: 8,
              padding: '12px 16px',
              marginBottom: 24,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, color: '#E8C66A', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <CheckCircle2 style={{ width: 14, height: 14 }} />
                <span>Demo Access</span>
              </div>
              <p style={{ fontSize: 13, color: '#F5F2EA', margin: 0, lineHeight: 1.5 }}>
                {selectedRole === 'EMPLOYEE' ? (
                  <>
                    <strong style={{ color: '#E8C66A' }}>Employee ID:</strong> EMP-1001 <br />
                    <strong style={{ color: '#E8C66A' }}>Password:</strong> TL-Employee#2026
                  </>
                ) : (
                  <>
                    <strong style={{ color: '#E8C66A' }}>Email:</strong> d.patel@apexbank.com <br />
                    <strong style={{ color: '#E8C66A' }}>Password:</strong> TL-Employee#2026
                  </>
                )}
              </p>
            </div>''',
'''            <div style={{
              background: '#F1EFE6',
              border: '1px solid rgba(21,25,21,0.12)',
              borderRadius: 6,
              padding: '12px 16px',
              marginBottom: 24,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, color: '#151915', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <CheckCircle2 style={{ width: 14, height: 14 }} />
                <span>Demo Access</span>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(21,25,21,0.7)', margin: 0, lineHeight: 1.5 }}>
                {selectedRole === 'EMPLOYEE' ? (
                  <>
                    <strong style={{ color: '#151915' }}>Employee ID:</strong> EMP-1001 <br />
                    <strong style={{ color: '#151915' }}>Password:</strong> TL-Employee#2026
                  </>
                ) : (
                  <>
                    <strong style={{ color: '#151915' }}>Email:</strong> d.patel@apexbank.com <br />
                    <strong style={{ color: '#151915' }}>Password:</strong> TL-Employee#2026
                  </>
                )}
              </p>
            </div>'''
)

# Dynamic Inputs
code = code.replace(
'''  const inputWrap = (fieldKey: string): React.CSSProperties => ({
    position: 'relative',
    marginTop: 6,
    borderRadius: 9,
    background: '#202020',
    border: `1px solid ${focusedField === fieldKey ? '#E8C66A' : 'rgba(255,255,255,0.12)'}`,
    boxShadow: focusedField === fieldKey ? '0 0 0 3px rgba(232,198,106,0.10)' : 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    display: 'flex',
    alignItems: 'center',
  });''',
'''  const inputWrap = (fieldKey: string): React.CSSProperties => ({
    position: 'relative',
    marginTop: 6,
    borderRadius: 6,
    background: '#FFFFFF',
    border: `1px solid ${focusedField === fieldKey ? '#0A3D2E' : 'rgba(21,25,21,0.22)'}`,
    boxShadow: focusedField === fieldKey ? '0 0 0 1px #5DAE87' : 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    display: 'flex',
    alignItems: 'center',
  });'''
)

code = code.replace(
'''  const inputStyle: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    width: '100%',
    fontSize: 14,
    color: '#F5F2EA',
    padding: '11px 12px 11px 44px',
  };''',
'''  const inputStyle: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    width: '100%',
    fontSize: 14,
    color: '#151915',
    padding: '11px 12px 11px 44px',
  };'''
)

code = code.replace(
'''  const iconStyle = (fieldKey: string): React.CSSProperties => ({
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
  });''',
'''  const iconStyle = (fieldKey: string): React.CSSProperties => ({
    position: 'absolute',
    left: 14,
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
    width: 16,
    height: 16,
    color: focusedField === fieldKey ? '#0A3D2E' : 'rgba(21,25,21,0.55)',
    transition: 'color 0.15s',
    flexShrink: 0,
  });'''
)
# placeholder styling hook via className
code = code.replace('<input\\n                    style={inputStyle}', '<input\\n                    className=\"placeholder-[rgba(21,25,21,0.4)]\"\\n                    style={inputStyle}')
code = code.replace('<input\\n                    style={{ ...inputStyle, paddingRight: 44 }}', '<input\\n                    className=\"placeholder-[rgba(21,25,21,0.4)]\"\\n                    style={{ ...inputStyle, paddingRight: 44 }}')
code = code.replace('<textarea\\n                    style={{ ...inputStyle, height: \\'100%\\', resize: \\'none\\', paddingLeft: 44, paddingTop: 4 }}', '<textarea\\n                    className=\"placeholder-[rgba(21,25,21,0.4)]\"\\n                    style={{ ...inputStyle, height: \\'100%\\', resize: \\'none\\', paddingLeft: 44, paddingTop: 4 }}')

# Labels '#F5F2EA' -> '#151915'
code = code.replace('color: \'#F5F2EA\'', 'color: \'#151915\'')
# Double check eye icon color
code = code.replace('color: \'#B8B5AE\'', 'color: \'rgba(21,25,21,0.55)\'')


code = code.replace(
'''              <button
                type=\"button\"
                aria-label=\"Toggle password visibility\"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'rgba(21,25,21,0.55)',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >''',
'''              <button
                type=\"button\"
                aria-label=\"Toggle password visibility\"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'rgba(21,25,21,0.55)',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >''')

# Error msg
code = code.replace(
'''              <div
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
              >''',
'''              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 12px',
                  borderRadius: 6,
                  background: '#FFFFFF',
                  border: '1px solid #B8432F',
                  color: '#B8432F',
                  fontSize: 12,
                }}
              >'''
)

code = code.replace(
'''              <div
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
              >''',
'''              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  padding: '10px 12px',
                  borderRadius: 6,
                  background: '#F1EFE6',
                  border: '1px solid #5DAE87',
                  color: '#0A3D2E',
                  fontSize: 12,
                }}
              >'''
)

# Submit button hover logic
code = code.replace(
'''            <button
              disabled={isSubmitting}
              type=\"submit\"
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
            >''',
'''            <button
              disabled={isSubmitting}
              type=\"submit\"
              className=\"hover:bg-[#0F4D3B] lp-font-space\"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                width: '100%',
                padding: '12px 20px',
                marginTop: 6,
                borderRadius: 6,
                background: '#0A3D2E',
                color: '#F8F7F1',
                opacity: isSubmitting ? 0.6 : 1,
                border: 'none',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: '0.01em',
                transition: 'background 0.15s, opacity 0.15s',
              }}
            >'''
)

with open('src/app/login/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
