import codecs

with codecs.open('src/components/landing/Navbar.tsx', 'r', 'utf-8') as f:
    text = f.read()

# 1. State hook removal
text = text.replace('  const [isDropdownOpen, setIsDropdownOpen] = useState(false);\n', '')

# 2. Scroll logic cleanup
old_scroll_chunk = """        if (currentScrollY > lastScrollY.current + 10) {
          setIsVisible(false);
          setIsDropdownOpen(false);
        }"""
new_scroll_chunk = """        if (currentScrollY > lastScrollY.current + 10) {
          setIsVisible(false);
        }"""
text = text.replace(old_scroll_chunk, new_scroll_chunk)

# 3. HTML Node purges inside the <nav> block
old_nav = """        {/* Navigation Area */}
        <nav className="flex items-center gap-5 lg:gap-7 text-sm font-semibold" style={{ color: '#151915' }}>
          <div className="relative">
            <button
              className="flex items-center justify-center gap-1.5 hover:text-[#0e4a2d] transition-colors py-2 group/btn"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              Platform
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}>
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {isDropdownOpen && (
              <div
                className="absolute top-[80%] left-0 md:-left-12 w-[480px] p-6 shadow-2xl rounded-sm grid grid-cols-2 gap-8 opacity-0 animate-in fade-in slide-in-from-top-2"
                style={{ background: '#F8F7F1', border: '1px solid rgba(17,17,17,0.08)' }}
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
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
                  <Link href="/scenario-replay" className="block py-1 hover:text-[#4CAF82] transition-colors">Scenario Replay</Link>
                </div>
                <div className="col-span-2 pt-4 mt-2 border-t border-[#111111]/10 flex gap-6">
                  <div className="text-xs font-bold text-[#0e4a2d] uppercase tracking-wider mb-1">Administration:</div>
                  <Link href="/audit-log" className="hover:text-[#4CAF82] transition-colors text-sm">Audit Log</Link>
                  <Link href="/notifications" className="hover:text-[#4CAF82] transition-colors text-sm">Notifications</Link>
                  <Link href="/settings" className="hover:text-[#4CAF82] transition-colors text-sm">Settings</Link>
                </div>
              </div>
            )}
          </div>

          <a href="#cta" className="hidden md:block hover:text-[#0e4a2d] transition-colors py-2">Methodology</a>
          <Link href="/help" className="hidden md:block hover:text-[#0e4a2d] transition-colors py-2">Documentation</Link>
          <div className="w-px h-4 bg-[#151915]/15 hidden md:block" />
          <Link href="/login" className="hidden sm:block hover:text-[#0e4a2d] transition-colors py-2">Sign In</Link>
          <Link href="/login" className="px-5 py-2.5 rounded-sm text-[#F8F7F1] transition-all hover:opacity-90 shadow-[0_2px_10px_rgba(14,74,45,0.15)] flex items-center gap-2 text-xs uppercase tracking-wider" style={{ background: '#0A3D2E' }}>
            Enter Workspace <span aria-hidden="true">&rarr;</span>
          </Link>
        </nav>"""

new_nav = """        {/* Navigation Area */}
        <nav className="flex items-center gap-5 lg:gap-7 text-sm font-semibold" style={{ color: '#151915' }}>
          <Link href="/login" className="hidden sm:block hover:text-[#0e4a2d] transition-colors py-2">Sign In</Link>
          <Link href="/login" className="px-5 py-2.5 rounded-sm text-[#F8F7F1] transition-all hover:opacity-90 shadow-[0_2px_10px_rgba(14,74,45,0.15)] flex items-center gap-2 text-xs uppercase tracking-wider" style={{ background: '#0A3D2E' }}>
            Enter Workspace <span aria-hidden="true">&rarr;</span>
          </Link>
        </nav>"""

text = text.replace(old_nav, new_nav)

with codecs.open('src/components/landing/Navbar.tsx', 'w', 'utf-8') as f:
    f.write(text)
