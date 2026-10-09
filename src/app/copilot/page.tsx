'use client';

import { useState } from 'react';
import { Bot, Send, Sparkles, FileCheck, ShieldAlert, ArrowRight } from 'lucide-react';

export default function CopilotPage() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; evidence?: any[] }>>([
    {
      role: 'assistant',
      text: 'Welcome to the TRUSTLINE Investigation Copilot. I retrieve structured graph, timeline, and transaction evidence from the database to answer your compliance and insider-risk questions.',
    },
  ]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const sampleQuestions = [
    'Why was ALT-8891 generated?',
    'What connects employee Vikram Malhotra to these transactions?',
    'Summarize the circular money flow pattern.',
    'What evidence supports the insider-risk signal?',
    'What should the investigator review next?',
  ];

  const handleSend = async (q: string) => {
    if (!q.trim()) return;

    const userMsg = q;
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setQuery('');
    setLoading(true);

    try {
      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMsg }),
      });
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: data.answer,
          evidence: data.supportingEvidence,
        },
      ]);
      setLoading(false);
    } catch (e) {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Bot className="h-6 w-6 text-indigo-400" />
          AI & Evidence Investigation Copilot
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Evidence-grounded assistant retrieving verified financial crime telemetry to explain alerts and assist investigators.
        </p>
      </div>

      {/* Suggested Prompts */}
      <div className="flex flex-wrap gap-2">
        {sampleQuestions.map((sq) => (
          <button
            key={sq}
            onClick={() => handleSend(sq)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-indigo-300 font-medium transition-colors"
          >
            {sq} &rarr;
          </button>
        ))}
      </div>

      {/* Chat Messages */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 min-h-[450px] flex flex-col justify-between space-y-4">
        <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl text-xs leading-relaxed space-y-2 ${
                m.role === 'user'
                  ? 'bg-indigo-600/20 border border-indigo-500/40 text-slate-100 ml-12'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 mr-12'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-[11px]">
                {m.role === 'user' ? (
                  <span className="text-indigo-400">Investigator Query</span>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Bot className="h-3.5 w-3.5" /> TRUSTLINE Copilot (Verified Evidence)
                  </span>
                )}
              </div>
              <p>{m.text}</p>

              {m.evidence && m.evidence.length > 0 && (
                <div className="pt-2 border-t border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Retrieved Evidence References:</span>
                  {m.evidence.map((ev: any, i: number) => (
                    <div key={i} className="p-2 rounded bg-slate-950 font-mono text-[10px] text-slate-300 flex justify-between">
                      <span>[{ev.category}] {ev.title}</span>
                      <span className="text-indigo-400">{ev.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 mr-12 animate-pulse">
              Synthesizing evidence graph telemetry...
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
          <input
            type="text"
            placeholder="Ask anything about transactions, employees, or evidence..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(query)}
            className="bg-slate-950 border border-slate-800 text-xs text-white px-4 py-2.5 rounded-xl outline-none focus:border-indigo-500 flex-1"
          />
          <button
            onClick={() => handleSend(query)}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
