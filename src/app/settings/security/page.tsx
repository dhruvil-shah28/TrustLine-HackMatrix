'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Shield, Lock, Laptop, CheckCircle2, ArrowLeft, Key } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function SecurityPage() {
  const { user, showToast } = useAuth();
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Password change simulation successful.');
    setOldPass('');
    setNewPass('');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-4">
        <Link href="/settings" className="text-xs text-indigo-400 hover:underline flex items-center gap-1 mb-1">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Settings Center
        </Link>
        <h1 className="heading-page flex items-center gap-2">
          <Shield className="h-5 w-5 text-indigo-400" />
          Security & Authentication Settings
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage active sessions, corporate SAML Single Sign-On, and device authentication logs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Active Session Badge */}
        <div className="ui-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Laptop className="h-5 w-5 text-indigo-400" />
            <span className="heading-card">Current Session</span>
          </div>

          <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs space-y-1">
            <div className="flex items-center justify-between text-emerald-300 font-bold">
              <span>● Active Workstation</span>
              <span className="text-[10px] font-mono technical-metadata">192.168.1.104</span>
            </div>
            <p className="text-[11px] text-slate-300">Chrome on Windows 11 Enterprise</p>
            <p className="text-[10px] text-slate-400">Authenticated: Today at 09:15 IST</p>
          </div>
        </div>

        {/* Right Column: Password Simulation & Auth Protocol */}
        <div className="md:col-span-2 space-y-6">
          <div className="ui-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="heading-card flex items-center gap-2">
                <Key className="h-4 w-4 text-indigo-400" />
                Password & Auth Credential Update
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                DEMO MODE PREVIEW
              </span>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Current Password</label>
                <input
                  type="password"
                  value={oldPass}
                  onChange={(e) => setOldPass(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 p-2.5 rounded-lg outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">New Password</label>
                <input
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 p-2.5 rounded-lg outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button type="submit" className="btn btn-primary">
                  Update Password
                </button>
              </div>
            </form>
          </div>

          {/* Active Devices Log */}
          <div className="ui-card p-5 space-y-3">
            <h3 className="heading-card">Active Authenticated Devices</h3>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-200 block">Mumbai HQ Office Workstation</span>
                  <span className="text-[10px] text-slate-400 font-mono technical-metadata">192.168.1.104 • Windows 11 Pro</span>
                </div>
                <span className="text-emerald-400 text-[10px] font-bold">CURRENT DEVICE</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-200 block">Secure Mobile Investigator App</span>
                  <span className="text-[10px] text-slate-400 font-mono technical-metadata">10.0.12.99 • iOS 18 Sentinel App</span>
                </div>
                <button className="text-rose-400 hover:underline text-[10px]">Revoke Access</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
