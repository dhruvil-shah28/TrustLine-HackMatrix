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
          <h2 id="methodologies" className="heading-card">Platform Guide & Methodologies</h2>

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

          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <h2 id="rbi-guidelines" className="heading-card flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-emerald-400" />
              RBI Regulatory References
            </h2>
            <div className="space-y-4 mt-4">

              <div className="ui-card p-4 space-y-2 border-l-2 border-l-emerald-500/50">
                <div className="flex flex-col gap-0.5">
                  <h3 className="font-bold text-slate-100 text-sm">Reserve Bank of India (Know Your Customer (KYC)) Directions, 2016</h3>
                  <a href="https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=11566&Mode=0" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 text-[11px] font-mono w-fit flex items-center gap-1">
                    Official consolidated direction; updated August 14, 2025 ↗
                  </a>
                </div>
                <div className="grid grid-cols-2 gap-4 text-[11px] text-slate-400 bg-slate-950/30 p-2 rounded">
                  <div><span className="font-semibold text-slate-300">Published / current text:</span> February 25, 2016; updated August 14, 2025</div>
                  <div><span className="font-semibold text-slate-300">Scope:</span> Every RBI-regulated entity, except where the Direction specifies otherwise</div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-indigo-300 font-semibold mb-1 block">RBI direction:</strong>
                  Requires applicable entities to conduct customer due diligence and monitor transactions under the KYC/AML framework, including ongoing review of customer activity.
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-indigo-300 font-semibold mb-1 block">TRUSTLINE feature mapping (implementation choice):</strong>
                  The Customers page, transaction Alerts, and Money Flow graph can support analyst review of customer-linked activity. They do not perform customer identification or establish KYC compliance.
                </p>
              </div>

              <div className="ui-card p-4 space-y-2 border-l-2 border-l-emerald-500/50">
                <div className="flex flex-col gap-0.5">
                  <h3 className="font-bold text-slate-100 text-sm">Reserve Bank of India (Fraud Risk Management in Commercial Banks (including Regional Rural Banks) and All India Financial Institutions) Directions, 2024</h3>
                  <a href="https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12702&Mode=0" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 text-[11px] font-mono w-fit flex items-center gap-1">
                    Official Direction, issued July 15, 2024 ↗
                  </a>
                </div>
                <div className="grid grid-cols-2 gap-4 text-[11px] text-slate-400 bg-slate-950/30 p-2 rounded">
                  <div><span className="font-semibold text-slate-300">Issued:</span> July 15, 2024</div>
                  <div><span className="font-semibold text-slate-300">Scope:</span> Commercial banks (including RRBs) and All India Financial Institutions</div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-indigo-300 font-semibold mb-1 block">RBI direction:</strong>
                  Requires a fraud-risk framework that supports prevention, early detection, investigation, and timely reporting; includes Early Warning Signals and Red Flagging of Accounts. Other entity classes have separate RBI directions.
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-indigo-300 font-semibold mb-1 block">TRUSTLINE feature mapping (implementation choice):</strong>
                  Detection Lab, Alerts, Cases, and Audit Logs provide detection and investigation workflow surfaces; they do not replace an entity's approved fraud-risk framework or required reporting.
                </p>
              </div>

              <div className="ui-card p-4 space-y-2 border-l-2 border-l-emerald-500/50">
                <div className="flex flex-col gap-0.5">
                  <h3 className="font-bold text-slate-100 text-sm">Reserve Bank of India (Information Technology Governance, Risk, Controls and Assurance Practices) Directions, 2023</h3>
                  <a href="https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12562&Mode=0" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 text-[11px] font-mono w-fit flex items-center gap-1">
                    Official Direction; effective April 1, 2024 ↗
                  </a>
                </div>
                <div className="grid grid-cols-2 gap-4 text-[11px] text-slate-400 bg-slate-950/30 p-2 rounded">
                  <div><span className="font-semibold text-slate-300">Issued / effective:</span> November 7, 2023 / April 1, 2024</div>
                  <div><span className="font-semibold text-slate-300">Scope:</span> Covered commercial banks, specified NBFCs, CICs, and AIFIs; exclusions apply</div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-indigo-300 font-semibold mb-1 block">RBI direction:</strong>
                  Sets IT governance, risk, control, assurance, and business-continuity requirements for entities within its defined scope.
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-indigo-300 font-semibold mb-1 block">TRUSTLINE feature mapping (implementation choice):</strong>
                  Employee records and Audit Logs can help investigators examine employee-linked events and recorded actions. They are not an IT control framework or assurance certification.
                </p>
              </div>

              <div className="ui-card p-4 space-y-2 border-l-2 border-l-emerald-500/50">
                <div className="flex flex-col gap-0.5">
                  <h3 className="font-bold text-slate-100 text-sm">Reserve Bank of India (Digital Payment Security Controls) Directions, 2021</h3>
                  <a href="https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12032&Mode=0" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 text-[11px] font-mono w-fit flex items-center gap-1">
                    Official Direction, issued February 18, 2021 ↗
                  </a>
                </div>
                <div className="grid grid-cols-2 gap-4 text-[11px] text-slate-400 bg-slate-950/30 p-2 rounded">
                  <div><span className="font-semibold text-slate-300">Issued:</span> February 18, 2021</div>
                  <div><span className="font-semibold text-slate-300">Scope:</span> Scheduled commercial banks (excluding RRBs), SFBs, Payments Banks, and credit-card-issuing NBFCs</div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-indigo-300 font-semibold mb-1 block">RBI direction:</strong>
                  Requires covered entities to govern and manage security risks for digital payment products and services and implement the prescribed security controls.
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-indigo-300 font-semibold mb-1 block">TRUSTLINE feature mapping (implementation choice):</strong>
                  Alerts and the Money Flow graph can assist with review of transaction activity represented in TRUSTLINE; the product does not secure payment channels or implement RBI-required payment controls.
                </p>
              </div>

              <div className="ui-card p-4 space-y-2 border-l-2 border-l-emerald-500/50">
                <div className="flex flex-col gap-0.5">
                  <h3 className="font-bold text-slate-100 text-sm">Reserve Bank of India (Cyber Resilience and Digital Payment Security Controls for non-bank PSOs) Master Directions, 2024</h3>
                  <a href="https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12715&Mode=0" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 text-[11px] font-mono w-fit flex items-center gap-1">
                    Official Direction, issued July 30, 2024 ↗
                  </a>
                </div>
                <div className="grid grid-cols-2 gap-4 text-[11px] text-slate-400 bg-slate-950/30 p-2 rounded">
                  <div><span className="font-semibold text-slate-300">Issued:</span> July 30, 2024; large: April 1, 2025; medium: April 1, 2026; small: April 1, 2028</div>
                  <div><span className="font-semibold text-slate-300">Scope:</span> All RBI-authorised non-bank Payment System Operators</div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-indigo-300 font-semibold mb-1 block">RBI direction:</strong>
                  Establishes cyber-resilience governance and information-security controls, including risk monitoring, identity and access management, and incident preparedness; implementation is phased by PSO size.
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-indigo-300 font-semibold mb-1 block">TRUSTLINE feature mapping (implementation choice):</strong>
                  Employee records, Audit Logs, Alerts, and Scenario Replay may support investigation of recorded activity and scenarios. They are not cyber-security controls, PSO incident reporting, or a cyber-resilience program.
                </p>
              </div>

              <p className="text-[11px] text-slate-500 mt-6 bg-slate-900/50 p-3 rounded italic tracking-wide leading-relaxed border border-slate-800">
                These references are provided for informational purposes only and do not constitute legal advice, regulatory approval, certification, or confirmation of compliance. Applicability depends on the relevant entity, activity, and current regulatory requirements.
              </p>
            </div>
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
