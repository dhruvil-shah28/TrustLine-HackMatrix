'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShieldAlert, Mail, ArrowLeft, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('rajesh.sharma@sentineliq.com');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="h-12 w-12 rounded-xl bg-indigo-600 mx-auto flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">SentinelIQ Recovery</h1>
          <p className="text-xs text-slate-400">
            Reset credentials for Financial Crime & Insider Risk Workspace
          </p>
        </div>

        {/* Card */}
        <div className="ui-card p-6 space-y-5">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <p className="text-slate-300 leading-relaxed">
                Enter your verified corporate email address and we will dispatch a secure password reset token.
              </p>

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Work Email Address</label>
                <div className="relative">
                  <Mail className="h-4 w-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 pl-9 pr-3 py-2 rounded-lg outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full py-2.5 text-xs font-bold"
              >
                {isLoading ? 'Sending Token...' : 'Dispatch Reset Link'}
              </button>

              <div className="text-center pt-2">
                <Link href="/login" className="text-slate-400 hover:text-white flex items-center justify-center gap-1">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
                </Link>
              </div>
            </form>
          ) : (
            <div className="space-y-4 text-xs text-center">
              <div className="h-10 w-10 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h2 className="heading-card">Recovery Link Dispatched</h2>
              <p className="text-slate-300 leading-relaxed">
                A password reset token has been sent to <strong className="text-white">{email}</strong>.
              </p>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
                <span>DEMO FAST-TRACK LINK:</span>
                <Link href="/reset-password" className="block text-indigo-400 font-bold hover:underline flex items-center justify-center gap-1">
                  Proceed to Reset Password Screen <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <Link href="/login" className="btn btn-secondary w-full block text-center">
                Return to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
