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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Customer & Corporate Account Intelligence
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Explore customer KYC profiles, linked bank accounts, balance positions, and connected financial transfers.
              </p>
            </div>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search customer name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ui-input pl-9 w-64"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-sm text-slate-400 ui-card">Loading customer accounts...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredCustomers.map((cust) => {
            const isHighRisk = cust.riskProfile === 'HIGH';

            return (
              <div
                key={cust.id}
                className={`ui-card p-5 space-y-4 border-l-4 ${
                  isHighRisk ? 'border-l-rose-500' : 'border-l-indigo-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono technical-metadata text-xs text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">
                      {cust.customerCode}
                    </span>
                    <span className={`badge ${isHighRisk ? 'badge-critical' : 'badge-low'}`}>
                      KYC: {cust.kycStatus}
                    </span>
                  </div>
                  <span className="badge badge-neutral">{cust.type}</span>
                </div>

                <div>
                  <h2 className="font-bold text-white text-base">{cust.name}</h2>
                  <p className="text-sm text-slate-400 mt-0.5">Risk Profile: <strong className={isHighRisk ? 'text-rose-400' : 'text-emerald-400'}>{cust.riskProfile}</strong></p>
                </div>

                {/* Linked Accounts List */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="heading-section block">Linked Accounts ({cust.accounts?.length || 0}):</span>
                  {cust.accounts?.map((acc: any) => (
                    <div
                      key={acc.id}
                      className="p-3 rounded-xl bg-[#030712] border border-slate-800/90 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="technical-metadata text-slate-200 font-medium block">{acc.accountNumber}</span>
                        <span className="text-[10px] text-slate-500">{acc.accountType} Account</span>
                      </div>
                      <span className="text-emerald-400 font-bold text-xs">₹{(acc.balance / 100000).toFixed(2)} Lakhs</span>
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
