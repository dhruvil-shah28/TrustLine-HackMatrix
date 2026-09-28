'use client';

import { useState } from 'react';
import { HelpCircle, ShieldAlert, FileCheck, GitFork, Bot, CheckCircle2, Send } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function HelpSupportPage() {
  const { showToast } = useAuth();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    showToast('Support request submitted to SentinelIQ compliance desk.');
    setTimeout(() => {
      setSubmitted(false);
      setSubject('');
      setMessage('');
    }, 2500);
  };

  const faqItems = [
    {
      question: 'How does SentinelIQ generate connected risk alerts?',
      answer: 'SentinelIQ uses a hybrid detection architecture combining rule-based structuring thresholds (< ₹5L CTR limits), graph pattern cycle algorithms (2-node and 3-node circular routing), ML peer baseline Z-Score deviations, and insider access correlation logged within 10 minutes prior to transfer execution.',
    },
    {
      question: 'What do the risk severity levels signify?',
      answer: 'CRITICAL (Score 80-100): High-confidence connected insider risk involving active circular routing or limit override. HIGH (Score 60-79): Structuring or velocity outlier patterns. MEDIUM (Score 35-59): Unassigned profile lookups requiring compliance review. LOW (Score 0-34): Standard verified baseline activity.',
    },
    {
      question: 'How are evidence items collected and exported?',
      answer: 'Investigators can attach multi-modal evidence items (Transactions, Workstation Access Logs, Subgraph Topology JSON, ML Outlier Data) into formal Case Dossiers. One-click PDF Evidence Packages can be generated for compliance audit boards.',
    },
    {
      question: 'What AI model powers Investigation Copilot?',
      answer: 'Investigation Copilot retrieves structured graph telemetry first, leveraging evidence-grounded synthesis to explain alerts without hallucinating. It operates under a strict zero-retention privacy policy and includes a deterministic rule engine fallback when offline.',
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-4">
        <h1 className="heading-page flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-indigo-400" />
          Help & Knowledge Center
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Documentation, risk scoring methodologies, evidence workflows, and compliance support.
        </p>
      </div>

      {/* Grid: FAQ & Contact Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Documentation Cards */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="heading-card">Platform Guide & Methodologies</h2>

          <div className="space-y-3">
            {faqItems.map((faq, idx) => (
              <div key={idx} className="ui-card p-4 space-y-1.5">
                <h3 className="font-bold text-slate-100 text-xs flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-indigo-400 shrink-0" />
                  {faq.question}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Support Contact Form */}
        <div className="ui-card p-5 space-y-4 h-fit">
          <h2 className="heading-card">Contact Compliance Support</h2>
          <p className="text-xs text-slate-400">
            Need technical assistance or rule customization? Contact our enterprise AML support desk.
          </p>

          <form onSubmit={handleSupportSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Inquiry Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Rule Threshold Configuration"
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 p-2.5 rounded-lg outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Message Details</label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your inquiry..."
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 p-2.5 rounded-lg outline-none focus:border-indigo-500"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-full flex items-center justify-center gap-1.5">
              <Send className="h-3.5 w-3.5" /> Submit Ticket
            </button>

            {submitted && (
              <p className="text-emerald-400 text-[11px] text-center font-semibold pt-1">
                ✓ Ticket submitted successfully!
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
