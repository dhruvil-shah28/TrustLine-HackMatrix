import codecs
import re

with codecs.open('src/components/landing/Navbar.tsx', 'r', 'utf-8') as f:
    text = f.read()

if 'const RBI_REFERENCES = [' not in text:
    rbi_const = """
const RBI_REFERENCES = [
  { label: 'Master Direction: Know Your Customer (KYC), 2016', href: 'https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=10292' },
  { label: 'Master Directions: Fraud Risk Management, July 2024', href: 'https://www.rbi.org.in/Scripts/BS_ViewMasterDirections.aspx' },
];

export default function """
    text = text.replace('export default function ', rbi_const, 1)

if 'dropdownRef' not in text:
    hooks = """  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    const handleEscape = (event: any) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
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
  }, []);"""
    text = re.sub(r'const \[isDropdownOpen, setIsDropdownOpen\] = useState\(false\);', hooks, text)
    if 'dropdownRef = useRef' not in text:
        text = text.replace('  const [scrolled, setScrolled]', hooks + '\n  const [scrolled, setScrolled]')

nav_area = """<nav className="flex items-center gap-5 lg:gap-7 text-sm font-semibold" style={{ color: '#151915' }}>
          
          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center justify-center gap-1.5 hover:text-[#0e4a2d] transition-colors py-2 group/btn"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
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
                className="absolute top-[80%] right-0 md:-right-4 w-[340px] p-6 shadow-2xl rounded-sm flex flex-col gap-6 opacity-0 animate-in fade-in slide-in-from-top-2"
                style={{ background: '#F8F7F1', border: '1px solid rgba(17,17,17,0.08)' }}
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <div>
                  <div className="text-xs font-bold text-[#0e4a2d] uppercase tracking-wider mb-2">PRODUCT</div>
                  <Link href="/help" className="block py-1 hover:text-[#4CAF82] transition-colors text-sm">Help and guides</Link>
                </div>

                <div>
                  <div className="text-xs font-bold text-[#0e4a2d] uppercase tracking-wider mb-2">RBI REFERENCES</div>
                  <div className="flex flex-col gap-2">
                    {RBI_REFERENCES.map((ref, idx) => (
                      <a key={idx} href={ref.href} target="_blank" rel="noopener noreferrer" className="block py-1 hover:text-[#4CAF82] transition-colors text-sm leading-tight text-[#151915]/80">
                        {ref.label} <span className="ml-[2px] opacity-60">↗</span>
                      </a>
                    ))}
                  </div>
                </div>

                <div className="pt-4 mt-2 border-t border-[#111111]/10 text-[#151915]/55" style={{ fontFamily: 'var(--font-plex-mono), ui-monospace, monospace', fontSize: '11px', lineHeight: 1.4 }}>
                  External links to the Reserve Bank of India. For reference only.
                </div>
              </div>
            )}
          </div>

          <Link href="/login" className="hidden sm:block hover:text-[#0e4a2d] transition-colors py-2">Sign In</Link>
          <Link href="/login" className="px-5 py-2.5 rounded-sm text-[#F8F7F1] transition-all hover:opacity-90 shadow-[0_2px_10px_rgba(14,74,45,0.15)] flex items-center gap-2 text-xs uppercase tracking-wider" style={{ background: '#0A3D2E' }}>
            Enter Workspace <span aria-hidden="true">&rarr;</span>
          </Link>
        </nav>"""

text = re.sub(r'<nav.*?</nav>', nav_area, text, flags=re.DOTALL)

with codecs.open('src/components/landing/Navbar.tsx', 'w', 'utf-8') as f:
    f.write(text)
