'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Lock, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { showToast } = useAuth();
  const [password, setPassword] = useState('NewSecurePass2026!');
  const [confirmPassword, setConfirmPassword] = useState('NewSecurePass2026!');
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);
      showToast('Password updated successfully.');
      setTimeout(() => router.push('/login'), 1200);
    }, 600);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="h-12 w-12 rounded-xl bg-indigo-600 mx-auto flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create New Password</h1>
          <p className="text-xs text-slate-400">SentinelIQ Enterprise Credentials Update</p>
        </div>

        <div className="ui-card p-6 space-y-5">
          {!success ? (
            <form onSubmit={handleReset} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">New Password</label>
                <div className="relative">
                  <Lock className="h-4 w-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 pl-9 pr-9 py-2 rounded-lg outline-none focus:border-indigo-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <Lock className="h-4 w-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 pl-9 pr-3 py-2 rounded-lg outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              {/* Strength Meter */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Password Strength</span>
                  <span className="text-emerald-400 font-bold">Strong (Compliant)</span>
                </div>
                <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden flex gap-1">
                  <div className="h-full bg-emerald-500 flex-1" />
                  <div className="h-full bg-emerald-500 flex-1" />
                  <div className="h-full bg-emerald-500 flex-1" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full py-2.5 text-xs font-bold"
              >
                {isLoading ? 'Updating Password...' : 'Save New Password & Log In'}
              </button>
            </form>
          ) : (
            <div className="p-6 text-center space-y-3">
              <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
              <h2 className="heading-card">Password Updated!</h2>
              <p className="text-xs text-slate-400">Redirecting to login portal...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
