'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Settings,
  Shield,
  Bell,
  Sliders,
  User,
  Lock,
  Globe,
  CheckCircle2,
  Save,
  Moon,
  Eye,
  Smartphone,
  Check,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function SettingsPage() {
  const { user, updateUser, showToast } = useAuth();
  const [activeTab, setActiveTab] = useState<'Account' | 'Preferences' | 'Notifications' | 'Appearance' | 'Security' | 'Privacy'>('Preferences');

  // Form states
  const [timezone, setTimezone] = useState(user.timezone || 'UTC+05:30 (Asia/Kolkata)');
  const [dateFormat, setDateFormat] = useState(user.dateFormat || 'DD/MM/YYYY HH:mm:ss');
  const [defaultDashboard, setDefaultDashboard] = useState(user.defaultDashboard || 'Executive Risk Overview');
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>(user.theme || 'dark');
  const [density, setDensity] = useState<'comfortable' | 'compact'>(user.density || 'comfortable');

  // Notification prefs
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [criticalPush, setCriticalPush] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  // Security prefs
  const [mfaEnforced, setMfaEnforced] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('30_MINS');

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      timezone,
      dateFormat,
      defaultDashboard,
      theme,
      density,
    });
    setSavedSuccess(true);
    showToast('Settings & preferences saved successfully.');
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const navTabs = [
    { id: 'Account', label: 'Account', icon: User, desc: 'Personal info & profile details', href: '/profile' },
    { id: 'Preferences', label: 'Preferences', icon: Sliders, desc: 'Timezone, format & workspace' },
    { id: 'Notifications', label: 'Notifications', icon: Bell, desc: 'Alert channels & triggers' },
    { id: 'Appearance', label: 'Appearance', icon: Moon, desc: 'Theme & visual density' },
    { id: 'Security', label: 'Security', icon: Lock, desc: 'Credentials & sessions', href: '/settings/security' },
    { id: 'Privacy', label: 'Privacy', icon: Shield, desc: 'Audit logging & telemetry' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Settings & Workspace Control
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure investigation workspace parameters, notification thresholds, and security preferences.
              </p>
            </div>
          </div>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
            <CheckCircle2 className="h-4 w-4" /> All settings saved
          </div>
        )}
      </div>

      {/* Main Layout with Settings Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Sidebar */}
        <div className="lg:col-span-1 glass-panel p-3 rounded-2xl border border-slate-800 space-y-1 shadow-xl h-fit">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block px-3 py-2 font-mono">
            SETTINGS NAVIGATION
          </span>
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;

            if (tab.href) {
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className="w-full flex items-start gap-3 p-3 rounded-xl text-left transition hover:bg-slate-900 text-slate-300 group"
                >
                  <Icon className="h-4 w-4 text-indigo-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-indigo-300">{tab.label}</div>
                    <div className="text-[10px] text-slate-400">{tab.desc}</div>
                  </div>
                </Link>
              );
            }

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition cursor-pointer ${
                  isCurrent
                    ? 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 font-semibold'
                    : 'hover:bg-slate-900 text-slate-300'
                }`}
              >
                <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${isCurrent ? 'text-indigo-400' : 'text-slate-400'}`} />
                <div>
                  <div className="text-xs font-semibold text-white">{tab.label}</div>
                  <div className="text-[10px] text-slate-400">{tab.desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Settings Content Area */}
        <div className="lg:col-span-3 glass-panel p-6 rounded-2xl border border-slate-800 space-y-6 shadow-xl">
          <form onSubmit={handleSave} className="space-y-6 text-xs">
            {/* Preferences Tab */}
            {activeTab === 'Preferences' && (
              <div className="space-y-5">
                <div className="border-b border-slate-800 pb-3">
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sliders className="h-4 w-4 text-indigo-400" />
                    Workspace Preferences
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Customize default views, timezone display, and data formats
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-slate-400 font-mono text-[11px] mb-1.5">TIMEZONE REGION</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-mono text-[11px] mb-1.5">DATE & TIME FORMAT</label>
                    <select
                      value={dateFormat}
                      onChange={(e) => setDateFormat(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium focus:outline-none focus:border-indigo-500 cursor-pointer font-mono"
                    >
                      <option value="DD/MM/YYYY HH:mm:ss">DD/MM/YYYY HH:mm:ss (IST)</option>
                      <option value="YYYY-MM-DD HH:mm:ss">YYYY-MM-DD HH:mm:ss (ISO standard)</option>
                      <option value="MM/DD/YYYY hh:mm A">MM/DD/YYYY hh:mm A (12-hour)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1.5">DEFAULT DASHBOARD LANDING</label>
                  <select
                    value={defaultDashboard}
                    onChange={(e) => setDefaultDashboard(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="Executive Risk Overview">Executive Risk Overview</option>
                    <option value="Critical Alerts Queue">Critical Alerts Queue</option>
                    <option value="Insider Risk Employees">Insider Risk Workspace</option>
                  </select>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'Notifications' && (
              <div className="space-y-5">
                <div className="border-b border-slate-800 pb-3">
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <Bell className="h-4 w-4 text-indigo-400" />
                    Notification Preferences & Alerts
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Configure dispatch channels for high-risk threat telemetry
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 cursor-pointer">
                    <div>
                      <span className="font-semibold text-slate-200 block text-xs">Email Alert Notifications</span>
                      <span className="text-[10px] text-slate-400">Receive instant email digests for Critical Risk alerts</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailAlerts}
                      onChange={(e) => setEmailAlerts(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0 h-4 w-4 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 cursor-pointer">
                    <div>
                      <span className="font-semibold text-slate-200 block text-xs">Critical Risk Push Telemetry</span>
                      <span className="text-[10px] text-slate-400">Real-time desktop popup notifications for circular loops & structuring</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={criticalPush}
                      onChange={(e) => setCriticalPush(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0 h-4 w-4 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 cursor-pointer">
                    <div>
                      <span className="font-semibold text-slate-200 block text-xs">Weekly Executive Compliance Summary</span>
                      <span className="text-[10px] text-slate-400">Weekly PDF digest of closed investigations and detection precision</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={weeklyDigest}
                      onChange={(e) => setWeeklyDigest(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0 h-4 w-4 cursor-pointer"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === 'Appearance' && (
              <div className="space-y-5">
                <div className="border-b border-slate-800 pb-3">
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <Moon className="h-4 w-4 text-indigo-400" />
                    Appearance & Display Density
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Adjust theme palette and UI scale for financial monitoring
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-slate-400 font-mono text-[11px] mb-1.5">COLOR THEME</label>
                    <select
                      value={theme}
                      onChange={(e: any) => setTheme(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="dark">Enterprise Slate Dark (Default)</option>
                      <option value="system">System Preference</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-mono text-[11px] mb-1.5">LAYOUT DENSITY</label>
                    <select
                      value={density}
                      onChange={(e: any) => setDensity(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="comfortable">Comfortable Grid Spacing</option>
                      <option value="compact">High-Density Analytical Matrix</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'Privacy' && (
              <div className="space-y-5">
                <div className="border-b border-slate-800 pb-3">
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <Shield className="h-4 w-4 text-emerald-400" />
                    Privacy & Compliance Telemetry Log
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Audit trail logging policies for investigator actions
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <span className="font-semibold text-slate-200 block">INVESTIGATOR AUDIT LOGGING</span>
                  <p className="text-slate-400 leading-relaxed">
                    All entity lookups, alert status overrides, case file exports, and role switches are cryptographically logged to the system audit ledger (`AuditLog`) in accordance with RBI AML/CFT compliance directives.
                  </p>
                </div>
              </div>
            )}

            {/* Form Action Footer */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-mono">
                Changes apply across active workspace session
              </span>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 transition cursor-pointer"
              >
                <Save className="h-4 w-4" /> Save Preferences
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
