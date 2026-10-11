'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  Network,
  Radar,
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
    const trimmed = searchQuery.trim();

    if (!showSearchModal) {
      return;
    }

    if (trimmed.length >= 2) {
      setIsSearching(true);
      fetch(`/api/search?q=${encodeURIComponent(trimmed)}`)
        .then(async (res) => {
          const payload = await res.json();
          if (!res.ok) {
            throw new Error(payload?.error || 'Search failed');
          }
          setSearchResults(payload.results || []);
        })
        .catch(() => {
          setSearchResults([]);
        })
        .finally(() => setIsSearching(false));
    } else {
      setIsSearching(false);
      setSearchResults([]);
    }
  }, [searchQuery, showSearchModal]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowSearchModal(false);
        setShowToolsDropdown(false);
        setShowUserPopover(false);
        setShowNotificationPopover(false);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  // Don't render full navbar on login / forgot-password / reset-password pages
  const isAuthPage = ['/login', '/forgot-password', '/reset-password'].includes(pathname);
  if (isAuthPage) return null;

  // Role-Aware Navigation Mapping
  const roleNavItems: Record<UserRole, Array<{ label: string; href: string; icon: any }>> = {
    EMPLOYEE: [
      { label: 'Employee Banking Portal', href: '/employee', icon: LayoutDashboard },
    ],
    INVESTIGATOR: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Alerts', href: '/alerts', icon: ShieldAlert },
      { label: 'Money Flow', href: '/graph', icon: GitFork },
      { label: 'Employees', href: '/employees', icon: Users },
      { label: 'Customers', href: '/customers', icon: Building2 },
      { label: 'Cases', href: '/cases', icon: Briefcase },
    ],
    COMPLIANCE: [
      { label: 'Risk Overview', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Cases Workspace', href: '/cases', icon: Briefcase },
      { label: 'Alerts Queue', href: '/alerts', icon: ShieldAlert },
      { label: 'Customers', href: '/customers', icon: Building2 },
      { label: 'Audit Log', href: '/audit-log', icon: Clock },
    ],
    RISK_ANALYST: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Detection Lab', href: '/lab', icon: FlaskConical },
      { label: 'Money Flow Graph', href: '/graph', icon: GitFork },
      { label: 'Scenario Replay', href: '/scenario-replay', icon: Play },
      { label: 'Employees', href: '/employees', icon: Users },
    ],
    ADMIN: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Audit Logs', href: '/audit-log', icon: Clock },
      { label: 'Detection Lab', href: '/lab', icon: FlaskConical },
      { label: 'Settings', href: '/settings', icon: Settings },
      { label: 'Alerts', href: '/alerts', icon: ShieldAlert },
    ],
  };

  const currentNav = roleNavItems[user.role] || roleNavItems.INVESTIGATOR;

  const secondaryNav = [
    { label: 'Behavioural Drift Radar', href: '/lab?tab=radar', icon: Radar, desc: 'Learned anomaly detection & prioritisations' },
    { label: 'Hidden Link Hunter', href: '/graph?mode=hunter', icon: Network, desc: 'Cross-entity relationship discovery' },
    { label: 'Detection Lab', href: '/lab', icon: FlaskConical, desc: 'Rule, Graph & ML matrix' },
    { label: 'AI Copilot', href: '/copilot', icon: Bot, desc: 'Evidence-grounded assistant' },
    { label: 'Scenario Replay', href: '/scenario-replay', icon: Play, desc: 'Live event simulation' },
    { label: 'System Audit Log', href: '/audit-log', icon: Clock, desc: 'Compliance action logs' },
    { label: 'Help & Support', href: '/help', icon: HelpCircle, desc: 'Documentation & support' },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="app-command-header sticky top-3 z-50 mx-auto mb-5 w-[calc(100%-24px)] max-w-[1500px] rounded-[20px] border" style={{
      background: 'rgba(248,247,241,0.84)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderColor: 'rgba(215,226,218,0.84)',
      boxShadow: '0 8px 24px rgba(10,28,28,0.12)'
    }}>
      <div className="mx-auto px-4 lg:px-6 h-16 flex items-center justify-between gap-4">
        {/* Enterprise Branding */}
        <div className="flex items-center gap-3.5 shrink-0">
          <Link href="/" aria-label="TRUSTLINE home" className="flex items-center shrink-0 transition-opacity hover:opacity-85" style={{ textDecoration: 'none' }}>
            <Image
              src="/brand/trustline-full.png"
              alt="TRUSTLINE"
              width={220}
              height={55}
              priority
              className="h-auto w-[176px] sm:w-[200px]"
              style={{ objectFit: 'contain' }}
            />
          </Link>

          {/* Subtle separator before nav */}
          <span className="hidden lg:inline-block h-6 w-px ml-1" style={{ background: 'rgba(255,255,255,0.08)' }} />
        </div>

        {/* Primary Navigation - Desktop */}
        <nav className="hidden md:flex items-center gap-1 flex-1 min-w-0 justify-start ml-2">
          {currentNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors"
                style={isActive
                  ? { background: '#174B3F', color: '#F7FBF8', border: '1px solid rgba(165, 235, 217, 0.2)' }
                  : { color: '#334D49' }
                }
                onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.color = '#183F37'; (e.currentTarget as HTMLElement).style.background = 'rgba(23, 75, 63, 0.06)'; } }}
                onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.color = '#334D49'; (e.currentTarget as HTMLElement).style.background = 'transparent'; } }}
                aria-current={isActive ? 'page' : undefined}
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
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#F2F4EF'; (e.currentTarget as HTMLElement).style.background = 'rgba(131,224,201,0.08)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#B7C6C0'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <span>Intelligence Tools</span>
              <ChevronDown className={`h-3 w-3 transition-transform ${showToolsDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showToolsDropdown && (
              <div className="absolute left-0 top-9 w-60 rounded-xl shadow-xl p-1.5 z-50 space-y-0.5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
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
                        ? { background: 'rgba(23, 75, 63, 0.14)', borderColor: 'rgba(165, 235, 217, 0.22)', border: '1px solid rgba(165, 235, 217, 0.22)' }
                        : {}
                      }
                      onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(23, 75, 63, 0.06)'; }}
                      onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    >
                      <Icon className="h-4 w-4 mt-0.5 shrink-0" style={{ color: isActive ? '#83E0C9' : '#9BAEA7' }} />
                      <div>
                        <div className="font-semibold" style={{ color: '#F2F4EF' }}>{item.label}</div>
                        <div className="text-[10px]" style={{ color: '#9BAEA7' }}>{item.desc}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* Right Action Area */}
        <div className="flex items-center justify-end gap-2.5 shrink-0 ml-2">
          {/* Global Search Trigger */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setShowSearchModal(true)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs h-9 transition-colors"
              style={{ background: 'var(--bg-inset)', border: '1px solid var(--border-subtle)', color: '#9BAEA7', width: '190px' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(131,224,201,0.32)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-subtle)'; }}
            >
              <Search className="h-3.5 w-3.5 shrink-0" style={{ color: '#9BAEA7' }} />
              <span className="truncate text-left">Search entity...</span>
              <kbd className="hidden sm:inline-block ml-auto text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.06)', color: '#9BAEA7' }}>⌘K</kbd>
            </button>

            {/* Search Modal */}
            {showSearchModal && (
              <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
                <div className="w-full max-w-lg rounded-xl shadow-2xl p-3 space-y-2" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      setShowSearchModal(true);
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg"
                    style={{ background: 'var(--bg-inset)', border: '1px solid var(--border-subtle)' }}
                  >
                    <Search className="h-4 w-4 shrink-0" style={{ color: '#9BAEA7' }} />
                    <input
                      type="text"
                      placeholder="Search employee, account, customer, alert code (e.g. ALT-8891)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent text-xs outline-none w-full"
                      style={{ color: '#F2F4EF' }}
                      autoFocus
                      aria-label="Search entities"
                    />
                    {searchQuery.trim() && (
                      <button type="button" onClick={() => setSearchQuery('')} className="text-xs" style={{ color: '#9BAEA7' }}>Clear</button>
                    )}
                    <button type="button" onClick={() => setShowSearchModal(false)} className="text-xs" style={{ color: '#9BAEA7' }}>✕</button>
                  </form>

                  {isSearching && <p className="text-xs p-2 font-mono" style={{ color: '#9BAEA7' }}>Searching entity graph...</p>}

                  {!isSearching && searchQuery.trim().length >= 2 && searchResults.length === 0 && (
                    <div className="p-3 rounded-lg text-xs" style={{ background: 'rgba(255,255,255,0.03)', color: '#B7C6C0', border: '1px solid var(--border-subtle)' }}>
                      No matching entities found for “{searchQuery.trim()}”.
                    </div>
                  )}

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
                            <span className="font-semibold" style={{ color: '#F2F4EF' }}>{res.label}</span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono" style={{ background: 'rgba(131,224,201,0.14)', color: '#83E0C9', border: '1px solid rgba(131,224,201,0.32)' }}>
                              {res.type}
                            </span>
                          </div>
                          <p className="text-[11px] mt-0.5" style={{ color: '#9BAEA7' }}>{res.subLabel}</p>
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
              style={{ background: 'var(--bg-inset)', border: '1px solid var(--border-subtle)', color: '#B7C6C0' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#F2F4EF'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#B7C6C0'; }}
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full font-mono text-[9px] font-bold flex items-center justify-center" style={{ background: '#E05252', color: '#fff' }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotificationPopover && (
              <div className="absolute right-0 top-9 w-80 rounded-xl shadow-2xl p-3 z-50 space-y-2" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                <div className="flex items-center justify-between pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold" style={{ color: '#F2F4EF' }}>Notifications</span>
                    <Link href="/notifications" onClick={() => setShowNotificationPopover(false)} className="text-[10px] hover:underline" style={{ color: '#83E0C9' }}>
                      View all &rarr;
                    </Link>
                  </div>
                  <button onClick={markAllNotificationsAsRead} className="text-[10px] hover:underline" style={{ color: '#83E0C9' }}>
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
                      style={{ background: n.read ? 'rgba(255,255,255,0.03)' : 'rgba(131,224,201,0.14)', border: '1px solid var(--border-subtle)' }}
                    >
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="font-bold" style={{ color: n.read ? '#B7C6C0' : '#83E0C9' }}>{n.title}</span>
                        <span className="text-[10px]" style={{ color: '#9BAEA7' }}>{n.timestamp}</span>
                      </div>
                      <p className="text-[11px] mt-0.5" style={{ color: '#B7C6C0' }}>{n.description}</p>
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
              className="flex items-center gap-2.5 p-1.5 pr-2 rounded-lg transition-colors shrink-0"
              style={{ background: 'var(--bg-inset)', border: '1px solid var(--border-subtle)', color: '#F2F4EF', minWidth: '170px' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.14)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}
            >
              <div className="h-7 w-7 rounded-full font-bold text-[10px] flex items-center justify-center shrink-0" style={{ background: '#83E0C9', color: '#172321' }}>
                {user.avatar}
              </div>
              <div className="hidden lg:flex min-w-0 flex-1 items-center justify-between gap-2 text-left text-[11px] leading-tight">
                <div className="min-w-0">
                  <div className="font-bold flex items-center gap-1.5" style={{ color: '#F2F4EF' }}>
                    <span className="truncate">{user.name}</span>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#4CAF82' }} />
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.08em]" style={{ color: '#9BAEA7' }}>{user.role.replace('_', ' ')}</div>
                </div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 shrink-0" style={{ color: '#9BAEA7' }} />
            </button>

            {/* Custom Popover Content */}
            {showUserPopover && (
              <div className="absolute right-0 top-10 w-64 rounded-xl shadow-2xl p-3 z-50 space-y-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                {/* User Info Header */}
                <div className="flex items-center gap-2.5 pb-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="h-9 w-9 rounded-full font-bold text-xs flex items-center justify-center shrink-0" style={{ background: '#83E0C9', color: '#172321' }}>
                    {user.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-xs flex items-center gap-1.5" style={{ color: '#F2F4EF' }}>
                      {user.name}
                      <span className="px-1.5 rounded text-[9px] font-semibold" style={{ background: 'rgba(76,175,130,0.15)', color: '#6ECBA0', border: '1px solid rgba(76,175,130,0.25)' }}>
                        ● Active
                      </span>
                    </div>
                    <div className="text-[11px] truncate" style={{ color: '#9BAEA7' }}>{user.email}</div>
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
                      style={{ color: '#B7C6C0' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(131,224,201,0.08)'; (e.currentTarget as HTMLElement).style.color = '#F2F4EF'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#B7C6C0'; }}
                    >
                      <Icon className="h-3.5 w-3.5" style={{ color: '#83E0C9' }} /> {label}
                    </Link>
                  ))}
                </div>

                {/* SWITCH ROLE Section */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider block px-1" style={{ color: '#9BAEA7' }}>
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
                          ? { background: 'rgba(131,224,201,0.14)', color: '#83E0C9', border: '1px solid rgba(131,224,201,0.32)', fontWeight: 600 }
                          : { color: '#B7C6C0', border: '1px solid transparent' }
                        }
                        onMouseEnter={e => { if (!isSelected) { (e.currentTarget as HTMLElement).style.background = 'rgba(131,224,201,0.08)'; (e.currentTarget as HTMLElement).style.color = '#F2F4EF'; } }}
                        onMouseLeave={e => { if (!isSelected) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#B7C6C0'; } }}
                      >
                        <span>{r.label}</span>
                        {isSelected && <Check className="h-3.5 w-3.5" style={{ color: '#83E0C9' }} />}
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
            style={{ color: '#B7C6C0', background: 'var(--bg-inset)', border: '1px solid var(--border-subtle)' }}
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden p-3 space-y-1" style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-subtle)' }}>
          {[...currentNav, ...secondaryNav].map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                style={isActive ? { background: 'rgba(131,224,201,0.14)', color: '#83E0C9' } : { color: '#B7C6C0' }}
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
