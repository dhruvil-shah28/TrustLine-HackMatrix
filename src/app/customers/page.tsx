'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, ShieldAlert, CreditCard, ArrowUpRight, Search, RefreshCw } from 'lucide-react';

export default function CustomersListPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/customers')
      .then((r) => r.json())
      .then((data) => {
        setCustomers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.customerCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-700/80 pb-5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-400/25 bg-emerald-500/10 text-emerald-300 shrink-0">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-white tracking-tight leading-tight">
                Customer & Corporate Account Intelligence
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                Explore customer KYC profiles, linked bank accounts, balance positions, and connected financial transfers.
              </p>
            </div>
          </div>
        </div>

        <div className="flex w-full max-w-[340px] justify-end shrink-0">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              aria-label="Search customer name or code"
              placeholder="Search customer name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-700/80 bg-[#1E3735] pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-400 outline-none transition focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/10"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="ui-card p-12 text-center text-sm text-slate-300">Loading customer accounts...</div>
      ) : filteredCustomers.length === 0 ? (
        <div className="ui-card p-12 text-center">
          <p className="text-base font-semibold text-white">No customer records match this search.</p>
          <p className="mt-2 text-sm text-slate-300">Try a customer name, code, or customer type.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {filteredCustomers.map((cust) => {
            const isHighRisk = cust.riskProfile === 'HIGH';

            return (
              <div
                key={cust.id}
                className={`ui-card p-5 space-y-4 rounded-2xl ${
                  isHighRisk ? 'border border-rose-500/25 bg-[#213A38]' : 'border border-emerald-400/15 bg-[#233D3A]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono technical-metadata text-[11px] text-emerald-200 bg-[#1A2F2E] px-2 py-0.5 rounded border border-emerald-400/15">
                      {cust.customerCode}
                    </span>
                    <span className={`badge ${isHighRisk ? 'badge-critical' : 'badge-low'}`}>
                      KYC: {cust.kycStatus}
                    </span>
                  </div>
                  <span className="badge badge-neutral">{cust.type}</span>
                </div>

                <div className="space-y-1">
                  <h2 className="font-bold text-white text-[1.05rem] leading-tight">{cust.name}</h2>
                  <p className="text-sm text-slate-300">
                    Risk Profile:{' '}
                    <strong className={isHighRisk ? 'text-rose-300' : 'text-emerald-300'}>{cust.riskProfile}</strong>
                  </p>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-700/80">
                  <span className="heading-section block text-slate-300">Linked Accounts ({cust.accounts?.length || 0}):</span>
                  {cust.accounts?.map((acc: any) => (
                    <div
                      key={acc.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-slate-700/80 bg-[#1A2E2D] px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <span className="technical-metadata text-slate-100 font-medium block truncate">{acc.accountNumber}</span>
                        <span className="text-[10px] text-slate-400">{acc.accountType} Account</span>
                      </div>
                      <span className="text-sm font-bold text-emerald-300 whitespace-nowrap">₹{(acc.balance / 100000).toFixed(2)} Lakhs</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
