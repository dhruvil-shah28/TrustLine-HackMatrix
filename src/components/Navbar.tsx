'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShieldAlert,
  GitFork,
  Users,
  Briefcase,
  FlaskConical,
  Bot,
  Search,
  Building2,
  Play,
  LayoutDashboard,
  ChevronDown,
  Menu,
  X,
  Bell,
  User,
  Settings,
  Clock,
  LogOut,
  Check,
  Shield,
  HelpCircle,
  Sliders,
} from 'lucide-react';
import { UserRole } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    user,
    isLoggedIn,
    switchRole,
    logout,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showToolsDropdown, setShowToolsDropdown] = useState(false);
  const [showUserPopover, setShowUserPopover] = useState(false);
  const [showNotificationPopover, setShowNotificationPopover] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toolsRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (toolsRef.current && !toolsRef.current.contains(event.target as Node)) {
        setShowToolsDropdown(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserPopover(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotificationPopover(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      setIsSearching(true);
      fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
        .then((res) => res.json())
        .then((data) => {
          setSearchResults(data.results || []);
          setIsSearching(false);
        })
        .catch(() => setIsSearching(false));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  // Don't render full navbar on login / forgot-password / reset-password pages
  const isAuthPage = ['/login', '/forgot-password', '/reset-password'].includes(pathname);
  if (isAuthPage) return null;

  // Role-Aware Navigation Mapping
  const roleNavItems: Record<UserRole, Array<{ label: string; href: string; icon: any }>> = {
    INVESTIGATOR: [
      { label: 'Dashboard', href: '/', icon: LayoutDashboard },
      { label: 'Alerts', href: '/alerts', icon: ShieldAlert },
      { label: 'Money Flow', href: '/graph', icon: GitFork },
      { label: 'Employees', href: '/employees', icon: Users },
      { label: 'Customers', href: '/customers', icon: Building2 },
      { label: 'Cases', href: '/cases', icon: Briefcase },
    ],
    COMPLIANCE: [
      { label: 'Risk Overview', href: '/', icon: LayoutDashboard },
      { label: 'Cases Workspace', href: '/cases', icon: Briefcase },
      { label: 'Alerts Queue', href: '/alerts', icon: ShieldAlert },
      { label: 'Customers', href: '/customers', icon: Building2 },
      { label: 'Audit Log', href: '/audit-log', icon: Clock },
    ],
    RISK_ANALYST: [
      { label: 'Dashboard', href: '/', icon: LayoutDashboard },
      { label: 'Detection Lab', href: '/lab', icon: FlaskConical },
      { label: 'Money Flow Graph', href: '/graph', icon: GitFork },
      { label: 'Scenario Replay', href: '/scenario-replay', icon: Play },
      { label: 'Employees', href: '/employees', icon: Users },
    ],
    ADMIN: [
      { label: 'Dashboard', href: '/', icon: LayoutDashboard },
      { label: 'Audit Logs', href: '/audit-log', icon: Clock },
      { label: 'Detection Lab', href: '/lab', icon: FlaskConical },
      { label: 'Settings', href: '/settings', icon: Settings },
      { label: 'Alerts', href: '/alerts', icon: ShieldAlert },
    ],
  };

  const currentNav = roleNavItems[user.role] || roleNavItems.INVESTIGATOR;

  const secondaryNav = [
    { label: 'Detection Lab', href: '/lab', icon: FlaskConical, desc: 'Rule, Graph & ML matrix' },
    { label: 'AI Copilot', href: '/copilot', icon: Bot, desc: 'Evidence-grounded assistant' },
    { label: 'Scenario Replay', href: '/scenario-replay', icon: Play, desc: 'Live event simulation' },
    { label: 'System Audit Log', href: '/audit-log', icon: Clock, desc: 'Compliance action logs' },
    { label: 'Help & Support', href: '/help', icon: HelpCircle, desc: 'Documentation & support' },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-50 border-b" style={{ background: '#111111', borderBottomColor: 'rgba(255,255,255,0.08)' }}>
      <div className="max-w-[1536px] mx-auto px-4 lg:px-6 h-16 flex items-center justify-between gap-4">
        {/* Enterprise Branding */}
        <div className="flex items-center gap-3.5 shrink-0">
          <Link href="/" className="flex items-center gap-3 group" style={{ textDecoration: 'none' }}>
            {/* Logo mark */}
            <div
              className="flex items-center justify-center shrink-0 transition-opacity group-hover:opacity-85"
              style={{
                width: 38, height: 38,
                borderRadius: 10,
                background: '#E8C66A',
                color: '#111111',
                boxShadow: '0 2px 8px rgba(232,198,106,0.25)',
              }}
            >
              {/* TrustLine custom logomark: shield + T monogram */}
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                {/* Shield body */}
                <path
                  d="M11 1.5L3 4.5V10.5C3 15.0 6.5 19.0 11 20.5C15.5 19.0 19 15.0 19 10.5V4.5L11 1.5Z"
                  fill="#111111"
                  fillOpacity="0.18"
                  stroke="#111111"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                {/* T letterform */}
                <line x1="7" y1="8" x2="15" y2="8" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="11" y1="8" x2="11" y2="15" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>

            {/* Two-line wordmark */}
            <div className="flex flex-col justify-center leading-none" style={{ gap: 3 }}>
              <span
                className="whitespace-nowrap"
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  letterSpacing: '-0.01em',
                  color: '#F5F2EA',
                  lineHeight: 1,
                }}
              >
                TRUSTLINE
              </span>
              <span
                className="hidden sm:block whitespace-nowrap"
                style={{
                  fontSize: 9,
                  fontWeight: 600,
                  letterSpacing: '0.10em',
                  textTransform: 'uppercase',
                  color: '#85827C',
                  lineHeight: 1,
                }}
              >
                Financial Crime &amp; Insider Risk
              </span>
            </div>
          </Link>

          {/* Subtle separator before nav */}
          <span className="hidden lg:inline-block h-6 w-px ml-1" style={{ background: 'rgba(255,255,255,0.08)' }} />
        </div>

        {/* Primary Navigation - Desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {currentNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors"
                style={isActive
                  ? { background: '#E8C66A', color: '#1A1500' }
                  : { color: '#B8B5AE' }
                }
                onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.color = '#F5F2EA'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; } }}
                onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.color = '#B8B5AE'; (e.currentTarget as HTMLElement).style.background = 'transparent'; } }}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            );
          })}

          {/* Intelligence Tools Dropdown */}
          <div className="relative" ref={toolsRef}>
            <button
              onClick={() => setShowToolsDropdown(!showToolsDropdown)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors"
              style={{ color: '#B8B5AE' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#F5F2EA'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#B8B5AE'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <span>Intelligence Tools</span>
              <ChevronDown className={`h-3 w-3 transition-transform ${showToolsDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showToolsDropdown && (
              <div className="absolute left-0 top-9 w-60 rounded-xl shadow-xl p-1.5 z-50 space-y-0.5" style={{ background: '#1B1B1B', border: '1px solid rgba(255,255,255,0.08)' }}>
                {secondaryNav.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setShowToolsDropdown(false)}
                      className="flex items-start gap-2.5 p-2 rounded-lg text-xs transition-colors"
                      style={isActive
                        ? { background: 'rgba(232,198,106,0.1)', borderColor: 'rgba(232,198,106,0.2)', border: '1px solid rgba(232,198,106,0.2)' }
                        : {}
                      }
                      onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
                      onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    >
                      <Icon className="h-4 w-4 mt-0.5 shrink-0" style={{ color: isActive ? '#E8C66A' : '#85827C' }} />
                      <div>
                        <div className="font-semibold" style={{ color: '#F5F2EA' }}>{item.label}</div>
                        <div className="text-[10px]" style={{ color: '#85827C' }}>{item.desc}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* Right Action Area */}
        <div className="flex items-center gap-2.5">
          {/* Global Search Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowSearchModal(true)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs w-36 lg:w-48 transition-colors"
              style={{ background: '#242424', border: '1px solid rgba(255,255,255,0.08)', color: '#85827C' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.14)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}
            >
              <Search className="h-3.5 w-3.5 shrink-0" style={{ color: '#85827C' }} />
              <span className="truncate">Search entity...</span>
              <kbd className="hidden sm:inline-block ml-auto text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.06)', color: '#85827C' }}>⌘K</kbd>
            </button>

            {/* Search Modal */}
            {showSearchModal && (
              <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
                <div className="w-full max-w-lg rounded-xl shadow-2xl p-3 space-y-2" style={{ background: '#1B1B1B', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#242424', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <Search className="h-4 w-4 shrink-0" style={{ color: '#85827C' }} />
                    <input
                      type="text"
                      placeholder="Search employee, account, customer, alert code (e.g. ALT-8891)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent text-xs outline-none w-full"
                      style={{ color: '#F5F2EA' }}
                      autoFocus
                    />
                    <button onClick={() => setShowSearchModal(false)} className="text-xs" style={{ color: '#85827C' }}>✕</button>
                  </div>

                  {isSearching && <p className="text-xs p-2 font-mono" style={{ color: '#85827C' }}>Searching entity graph...</p>}

                  {searchResults.length > 0 && (
                    <div className="space-y-1 max-h-72 overflow-y-auto">
                      {searchResults.map((res) => (
                        <Link
                          key={res.id}
                          href={res.link}
                          onClick={() => setShowSearchModal(false)}
                          className="block p-2 rounded-lg transition-colors"
                          style={{ border: '1px solid transparent' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.borderColor = 'transparent'; }}
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold" style={{ color: '#F5F2EA' }}>{res.label}</span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono" style={{ background: 'rgba(232,198,106,0.1)', color: '#E8C66A', border: '1px solid rgba(232,198,106,0.2)' }}>
                              {res.type}
                            </span>
                          </div>
                          <p className="text-[11px] mt-0.5" style={{ color: '#85827C' }}>{res.subLabel}</p>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Notification Center Popover */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotificationPopover(!showNotificationPopover)}
              className="p-1.5 rounded-lg relative transition-colors"
              style={{ background: '#242424', border: '1px solid rgba(255,255,255,0.08)', color: '#B8B5AE' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#F5F2EA'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#B8B5AE'; }}
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full font-mono text-[9px] font-bold flex items-center justify-center" style={{ background: '#E05252', color: '#fff' }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotificationPopover && (
              <div className="absolute right-0 top-9 w-80 rounded-xl shadow-2xl p-3 z-50 space-y-2" style={{ background: '#1B1B1B', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-center justify-between pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold" style={{ color: '#F5F2EA' }}>Notifications</span>
                    <Link href="/notifications" onClick={() => setShowNotificationPopover(false)} className="text-[10px] hover:underline" style={{ color: '#E8C66A' }}>
                      View all &rarr;
                    </Link>
                  </div>
                  <button onClick={markAllNotificationsAsRead} className="text-[10px] hover:underline" style={{ color: '#E8C66A' }}>
                    Mark all read
                  </button>
                </div>

                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                  {notifications.map((n) => (
                    <Link
                      key={n.id}
                      href={n.link}
                      onClick={() => {
                        markNotificationAsRead(n.id);
                        setShowNotificationPopover(false);
                      }}
                      className="block p-2 rounded-lg text-xs transition-colors"
                      style={{ background: n.read ? 'rgba(255,255,255,0.03)' : 'rgba(232,198,106,0.06)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="font-bold" style={{ color: n.read ? '#B8B5AE' : '#E8C66A' }}>{n.title}</span>
                        <span className="text-[10px]" style={{ color: '#85827C' }}>{n.timestamp}</span>
                      </div>
                      <p className="text-[11px] mt-0.5" style={{ color: '#B8B5AE' }}>{n.description}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Custom Account / Role Popover */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => setShowUserPopover(!showUserPopover)}
              className="flex items-center gap-2 p-1.5 rounded-lg transition-colors"
              style={{ background: '#242424', border: '1px solid rgba(255,255,255,0.08)', color: '#F5F2EA' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.14)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}
            >
              <div className="h-6 w-6 rounded-full font-bold text-[10px] flex items-center justify-center shrink-0" style={{ background: '#E8C66A', color: '#1A1500' }}>
                {user.avatar}
              </div>
              <div className="hidden lg:block text-left text-[11px] leading-tight">
                <div className="font-bold flex items-center gap-1" style={{ color: '#F5F2EA' }}>
                  <span>{user.name}</span>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#4CAF82' }} />
                </div>
                <div className="text-[10px]" style={{ color: '#85827C' }}>{user.role.replace('_', ' ')}</div>
              </div>
              <ChevronDown className="h-3 w-3" style={{ color: '#85827C' }} />
            </button>

            {/* Custom Popover Content */}
            {showUserPopover && (
              <div className="absolute right-0 top-10 w-64 rounded-xl shadow-2xl p-3 z-50 space-y-3" style={{ background: '#1B1B1B', border: '1px solid rgba(255,255,255,0.08)' }}>
                {/* User Info Header */}
                <div className="flex items-center gap-2.5 pb-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="h-9 w-9 rounded-full font-bold text-xs flex items-center justify-center shrink-0" style={{ background: '#E8C66A', color: '#1A1500' }}>
                    {user.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-xs flex items-center gap-1.5" style={{ color: '#F5F2EA' }}>
                      {user.name}
                      <span className="px-1.5 rounded text-[9px] font-semibold" style={{ background: 'rgba(76,175,130,0.15)', color: '#6ECBA0', border: '1px solid rgba(76,175,130,0.25)' }}>
                        ● Active
                      </span>
                    </div>
                    <div className="text-[11px] truncate" style={{ color: '#85827C' }}>{user.email}</div>
                  </div>
                </div>

                {/* Menu List */}
                <div className="space-y-0.5 text-xs pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  {[
                    { href: '/profile', icon: User, label: 'My Profile' },
                    { href: '/settings', icon: Settings, label: 'Account Settings' },
                    { href: '/settings', icon: Sliders, label: 'Preferences' },
                    { href: '/notifications', icon: Bell, label: 'Notifications' },
                    { href: '/settings/security', icon: Shield, label: 'Security' },
                    { href: '/help', icon: HelpCircle, label: 'Help & Support' },
                  ].map(({ href, icon: Icon, label }) => (
                    <Link
                      key={label}
                      href={href}
                      onClick={() => setShowUserPopover(false)}
                      className="flex items-center gap-2 p-1.5 rounded-lg transition-colors"
                      style={{ color: '#B8B5AE' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.color = '#F5F2EA'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#B8B5AE'; }}
                    >
                      <Icon className="h-3.5 w-3.5" style={{ color: '#E8C66A' }} /> {label}
                    </Link>
                  ))}
                </div>

                {/* SWITCH ROLE Section */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider block px-1" style={{ color: '#85827C' }}>
                    SWITCH ROLE
                  </span>
                  {[
                    { role: 'INVESTIGATOR', label: 'AML Investigator' },
                    { role: 'COMPLIANCE', label: 'Compliance Lead' },
                    { role: 'RISK_ANALYST', label: 'Risk Analyst' },
                    { role: 'ADMIN', label: 'Admin' },
                  ].map((r) => {
                    const isSelected = user.role === r.role;
                    return (
                      <button
                        key={r.role}
                        onClick={() => {
                          switchRole(r.role as UserRole);
                          setShowUserPopover(false);
                        }}
                        className="w-full flex items-center justify-between p-1.5 rounded-lg text-xs transition-colors"
                        style={isSelected
                          ? { background: 'rgba(232,198,106,0.1)', color: '#E8C66A', border: '1px solid rgba(232,198,106,0.2)', fontWeight: 600 }
                          : { color: '#B8B5AE', border: '1px solid transparent' }
                        }
                        onMouseEnter={e => { if (!isSelected) { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.color = '#F5F2EA'; } }}
                        onMouseLeave={e => { if (!isSelected) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#B8B5AE'; } }}
                      >
                        <span>{r.label}</span>
                        {isSelected && <Check className="h-3.5 w-3.5" style={{ color: '#E8C66A' }} />}
                      </button>
                    );
                  })}
                </div>

                {/* Sign Out */}
                <div className="pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <button
                    onClick={() => {
                      logout();
                      setShowUserPopover(false);
                      router.push('/login');
                    }}
                    className="w-full flex items-center gap-2 p-1.5 rounded-lg text-xs font-semibold transition-colors"
                    style={{ color: '#F08080' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(224,82,82,0.08)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    <LogOut className="h-3.5 w-3.5" /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg transition-colors"
            style={{ color: '#B8B5AE', background: '#242424', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden p-3 space-y-1" style={{ background: '#1B1B1B', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          {[...currentNav, ...secondaryNav].map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                style={isActive ? { background: '#E8C66A', color: '#1A1500' } : { color: '#B8B5AE' }}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
