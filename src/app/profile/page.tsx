'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  User,
  Shield,
  Lock,
  Mail,
  Building,
  MapPin,
  Globe,
  Clock,
  KeyRound,
  CheckCircle2,
  FileCheck,
  Smartphone,
  ShieldAlert,
  ArrowRight,
  Save,
  Edit3,
  X,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function ProfilePage() {
  const { user, updateUser, auditLogs } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Editable Form States
  const [name, setName] = useState(user.name || 'Rajesh Sharma');
  const [avatar, setAvatar] = useState(user.avatar || 'RS');
  const [email, setEmail] = useState(user.email || 'rajesh.sharma@sentineliq.com');
  const [jobTitle, setJobTitle] = useState(user.jobTitle || 'Lead AML Investigator & Financial Cyber Threat Specialist');
  const [department, setDepartment] = useState(user.department || 'Financial Crime & AML Investigations');
  const [location, setLocation] = useState(user.location || 'Mumbai Enterprise HQ (Floor 12)');
  const [timezone, setTimezone] = useState(user.timezone || 'UTC+05:30 (Asia/Kolkata)');
  const [shortBio, setShortBio] = useState(user.shortBio || 'Specializing in insider risk correlation, circular wire detection, and high-value AML investigations.');
  
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleCancel = () => {
    setName(user.name || 'Rajesh Sharma');
    setAvatar(user.avatar || 'RS');
    setEmail(user.email || 'rajesh.sharma@sentineliq.com');
    setJobTitle(user.jobTitle || 'Lead AML Investigator & Financial Cyber Threat Specialist');
    setDepartment(user.department || 'Financial Crime & AML Investigations');
    setLocation(user.location || 'Mumbai Enterprise HQ (Floor 12)');
    setTimezone(user.timezone || 'UTC+05:30 (Asia/Kolkata)');
    setShortBio(user.shortBio || 'Specializing in insider risk correlation, circular wire detection, and high-value AML investigations.');
    setIsEditing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    setTimeout(() => {
      updateUser({
        name,
        avatar,
        email,
        jobTitle,
        department,
        location,
        timezone,
        shortBio,
      });
      setIsLoading(false);
      setIsEditing(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }, 400);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Investigator Identity & Profile
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage your enterprise identity, privileged clearance roles, multi-factor credentials, and session security.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Edit3 className="h-3.5 w-3.5" /> Edit Profile
            </button>
          ) : (
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
            >
              <X className="h-3.5 w-3.5" /> Cancel Editing
            </button>
          )}

          <Link
            href="/settings/security"
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 shadow transition"
          >
            <Lock className="h-3.5 w-3.5 text-indigo-400" /> Security Settings
          </Link>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Profile & workspace credentials updated successfully!
        </div>
      )}

      {/* Identity Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 bg-slate-900/60 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-indigo-600 text-[#172321] font-semibold text-xl flex items-center justify-center border border-indigo-400/30 shrink-0">
            {user.avatar || 'RS'}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">{user.name}</h2>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                LEVEL-4 PRIVILEGED
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium">{user.title || 'Lead AML Investigator'}</p>
            <p className="text-[11px] text-slate-400 flex items-center gap-3 pt-0.5">
              <span>Role: <strong className="text-white">{user.role}</strong></span>
              <span>•</span>
              <span>Dept: <strong className="text-slate-200">{user.department}</strong></span>
              <span>•</span>
              <span className="font-mono">{user.email}</span>
            </p>
          </div>
        </div>

        {/* Security Badge Pill */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center min-w-[220px] shrink-0">
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">
            AUTHENTICATION STATUS
          </span>
          <span className="text-xs font-extrabold text-emerald-400 font-mono mt-1 flex items-center justify-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            SSO & HARDWARE MFA ACTIVE
          </span>
          <span className="text-[10px] text-slate-500 font-mono mt-1 block">
            Last Active: {user.lastActive || 'Just now'}
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Details or Edit Form */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800/80 space-y-6 shadow-xl">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-indigo-400" />
              {isEditing ? 'Edit Profile & Professional Details' : 'Account Overview'}
            </h3>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs text-indigo-400 hover:underline font-semibold"
              >
                Edit Details
              </button>
            )}
          </div>

          {!isEditing ? (
            /* Read-Only Profile View */
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 font-mono block">FULL NAME</span>
                  <span className="font-semibold text-slate-100 text-sm">{user.name}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 font-mono block">WORK EMAIL</span>
                  <span className="font-mono text-indigo-300 font-semibold">{user.email}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 font-mono block">JOB TITLE</span>
                  <span className="font-semibold text-slate-200">{user.jobTitle || user.title}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 font-mono block">DEPARTMENT</span>
                  <span className="font-semibold text-slate-200">{user.department}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 font-mono block">OFFICE LOCATION</span>
                  <span className="font-semibold text-slate-200">{user.location}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 font-mono block">PRIMARY TIMEZONE</span>
                  <span className="font-mono text-slate-300">{user.timezone}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 font-mono block">SHORT INVESTIGATOR BIO</span>
                <p className="text-slate-300 leading-relaxed text-xs">{user.shortBio}</p>
              </div>
            </div>
          ) : (
            /* Editable Profile Form */
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">FULL NAME</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">AVATAR INITIALS</label>
                  <input
                    type="text"
                    maxLength={3}
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono uppercase focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">WORK EMAIL ADDRESS</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">JOB TITLE</label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">DEPARTMENT</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">OFFICE LOCATION</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-mono text-[11px] mb-1">PRIMARY TIMEZONE</label>
                <input
                  type="text"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-mono text-[11px] mb-1">SHORT INVESTIGATOR BIO</label>
                <textarea
                  rows={3}
                  value={shortBio}
                  onChange={(e) => setShortBio(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium focus:outline-none focus:border-indigo-500 resize-none"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-semibold hover:bg-slate-850 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow flex items-center gap-1.5 transition cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" /> Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Security & System Info Side Column */}
        <div className="space-y-6">
          {/* Security Credentials Card */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-400" />
                Security Credentials & Access
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-1">
                <span className="text-[10px] text-slate-500 font-mono block">SYSTEM CLEARANCE</span>
                <span className="font-bold text-slate-200">Level 4 - Privileged Financial Crime Analyst</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-1">
                <span className="text-[10px] text-slate-500 font-mono block">MULTI-FACTOR AUTHENTICATION</span>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-emerald-400 flex items-center gap-1">
                    <Smartphone className="h-3.5 w-3.5" /> Hardware Token Enforced
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">ACTIVE</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-1">
                <span className="text-[10px] text-slate-500 font-mono block">ACTIVE WORKSPACE DOMAIN</span>
                <span className="font-mono text-indigo-300 font-semibold">prod-mumbai-cluster-04.sentineliq.internal</span>
              </div>
            </div>
          </div>

          {/* User Audit Trail */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-400" />
                Recent User Actions Audit Log
              </h3>
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 text-xs">
              {auditLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-300 font-mono text-[11px]">{log.action}</span>
                    <span className="text-[9px] text-slate-500 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{log.details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
