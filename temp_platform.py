import codecs

with codecs.open('src/components/landing/Navbar.tsx', 'r', 'utf-8') as f:
    text = f.read()

# 1. State hooks
if 'const [isPlatformOpen' not in text:
    state_injection = """  const [isPlatformOpen, setIsPlatformOpen] = useState(false);
  const platformRef = useRef<HTMLDivElement>(null);
"""
    text = text.replace('  const [isDropdownOpen, setIsDropdownOpen] = useState(false);', state_injection + '  const [isDropdownOpen, setIsDropdownOpen] = useState(false);')

# 2. Update handleClickOutside and handleEscape
if 'setIsPlatformOpen(false)' not in text:
    text = text.replace('if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {', 
                        'if (platformRef.current && !platformRef.current.contains(event.target as Node)) setIsPlatformOpen(false);\n      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {')
    text = text.replace('if (event.key === \'Escape\') {\n        setIsDropdownOpen(false);\n      }',
                        'if (event.key === \'Escape\') {\n        setIsDropdownOpen(false);\n        setIsPlatformOpen(false);\n      }')

# 3. Add to scroll reset logic (both instances if multiple)
text = text.replace('setIsDropdownOpen(false);', 'setIsDropdownOpen(false);\n          setIsPlatformOpen(false);')
# Reverse double replacement just in case
text = text.replace('setIsPlatformOpen(false);\n          setIsPlatformOpen(false);', 'setIsPlatformOpen(false);')

# 4. Inject the Platform Dropdown JSX
platform_jsx = """          
          <div className="relative" ref={platformRef}>
            <button
              className="flex items-center justify-center gap-1.5 hover:text-[#0e4a2d] transition-colors py-2 group/btn"
              onMouseEnter={() => setIsPlatformOpen(true)}
              onMouseLeave={() => setIsPlatformOpen(false)}
              onClick={() => setIsPlatformOpen(!isPlatformOpen)}
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
                className="absolute top-[80%] left-0 md:-left-12 w-[480px] p-6 shadow-2xl rounded-sm grid grid-cols-2 gap-8 opacity-0 animate-in fade-in slide-in-from-top-2"
                style={{ background: '#F8F7F1', border: '1px solid rgba(17,17,17,0.08)' }}
                onMouseEnter={() => setIsPlatformOpen(true)}
                onMouseLeave={() => setIsPlatformOpen(false)}
              >
                <div>
                  <div className="text-xs font-bold text-[#0e4a2d] uppercase tracking-wider mb-3">Overview</div>
                  <Link href="/dashboard" className="block py-1 hover:text-[#4CAF82] transition-colors mb-4">Dashboard</Link>

                  <div className="text-xs font-bold text-[#0e4a2d] uppercase tracking-wider mb-3">Investigations</div>
                  <Link href="/alerts" className="block py-1 hover:text-[#4CAF82] transition-colors">Alerts</Link>
                  <Link href="/graph" className="block py-1 hover:text-[#4CAF82] transition-colors">Money Flow</Link>
                  <Link href="/cases" className="block py-1 hover:text-[#4CAF82] transition-colors">Cases</Link>
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0e4a2d] uppercase tracking-wider mb-3">Entity Intelligence</div>
                  <Link href="/employees" className="block py-1 hover:text-[#4CAF82] transition-colors">Employees</Link>
                  <Link href="/customers" className="block py-1 hover:text-[#4CAF82] transition-colors mb-4">Customers</Link>

                  <div className="text-xs font-bold text-[#0e4a2d] uppercase tracking-wider mb-3">Intelligence Tools</div>
                  <Link href="/lab" className="block py-1 hover:text-[#4CAF82] transition-colors">Detection Lab</Link>
                  <Link href="/copilot" className="block py-1 hover:text-[#4CAF82] transition-colors">AI Copilot</Link>
                </div>
              </div>
            )}
          </div>
"""

if 'setIsPlatformOpen(true)' not in text:
    nav_start = """<nav className="flex items-center gap-5 lg:gap-7 text-sm font-semibold" style={{ color: '#151915' }}>"""
    text = text.replace(nav_start, nav_start + platform_jsx)

with codecs.open('src/components/landing/Navbar.tsx', 'w', 'utf-8') as f:
    f.write(text)
