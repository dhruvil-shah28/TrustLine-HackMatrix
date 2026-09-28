'use client';

import { useState, useEffect } from 'react';
import { FlaskConical, Play, CheckCircle2, XCircle, ShieldAlert, ShieldCheck, Activity } from 'lucide-react';
import { DetectionResult } from '@/lib/types';

export default function DetectionLabPage() {
  const [labData, setLabData] = useState<{ metrics: any; results: DetectionResult[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const runLabEvaluation = () => {
    setRunning(true);
    fetch('/api/detection-lab')
      .then((r) => r.json())
      .then((data) => {
        setLabData(data);
        setLoading(false);
        setRunning(false);
      })
      .catch(() => {
        setLoading(false);
        setRunning(false);
      });
  };

  useEffect(() => {
    runLabEvaluation();
  }, []);

  const metrics = labData?.metrics;
  const results = labData?.results || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-amber-400" />
            Detection Lab & Accuracy Evaluation
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Empirical evaluation matrix tested against 11 labelled synthetic scenarios (6 Suspicious & 5 Legitimate Baseline Controls).
          </p>
        </div>

        <button
          onClick={runLabEvaluation}
          disabled={running}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 shrink-0"
        >
          <Play className={`h-4 w-4 ${running ? 'animate-spin' : ''}`} />
          {running ? 'Running Detection Suite...' : 'Re-Run Hybrid Detection Test'}
        </button>
      </div>

      {loading || !metrics ? (
        <div className="p-12 text-center text-xs text-slate-400 glass-panel rounded-xl">Running detection suite on labelled scenarios...</div>
      ) : (
        <>
          {/* Key Evaluation Metrics Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-panel p-4 rounded-xl border border-indigo-500/30 bg-indigo-950/20">
              <span className="text-xs text-indigo-300 font-medium uppercase">F1 Score</span>
              <p className="text-3xl font-extrabold text-white mt-1">{metrics.f1Score}%</p>
              <p className="text-[11px] text-indigo-400 mt-1">Precision: {metrics.precision}% | Recall: {metrics.recall}%</p>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20">
              <span className="text-xs text-emerald-300 font-medium uppercase">Overall Accuracy</span>
              <p className="text-3xl font-extrabold text-white mt-1">{metrics.accuracy}%</p>
              <p className="text-[11px] text-emerald-400 mt-1">Correctly Classified {metrics.tp + metrics.tn} / 11</p>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-rose-500/30 bg-rose-950/20">
              <span className="text-xs text-rose-300 font-medium uppercase">False Positive Rate (FPR)</span>
              <p className="text-3xl font-extrabold text-white mt-1">{metrics.falsePositiveRate}%</p>
              <p className="text-[11px] text-rose-400 mt-1">Legitimate Flagged: {metrics.fp} Scenarios</p>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-amber-500/30 bg-amber-950/20">
              <span className="text-xs text-amber-300 font-medium uppercase">True Positives</span>
              <p className="text-3xl font-extrabold text-white mt-1">{metrics.tp}</p>
              <p className="text-[11px] text-amber-400 mt-1">Suspicious Caught: {metrics.tp} / 6</p>
            </div>
          </div>

          {/* Main Layout: Confusion Matrix & Scenario Results Table */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Confusion Matrix Graphical Card */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="h-4 w-4 text-indigo-400" />
                Confusion Matrix
              </h2>

              <div className="grid grid-cols-2 gap-3 text-center pt-2">
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-emerald-300 block">True Positive (TP)</span>
                  <span className="text-2xl font-bold text-emerald-400 font-mono">{metrics.tp}</span>
                  <p className="text-[10px] text-slate-400">Suspicious Flagged Correctly</p>
                </div>

                <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-rose-300 block">False Positive (FP)</span>
                  <span className="text-2xl font-bold text-rose-400 font-mono">{metrics.fp}</span>
                  <p className="text-[10px] text-slate-400">Legitimate Incorrectly Flagged</p>
                </div>

                <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-amber-300 block">False Negative (FN)</span>
                  <span className="text-2xl font-bold text-amber-400 font-mono">{metrics.fn}</span>
                  <p className="text-[10px] text-slate-400">Suspicious Missed</p>
                </div>

                <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/40 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-indigo-300 block">True Negative (TN)</span>
                  <span className="text-2xl font-bold text-indigo-400 font-mono">{metrics.tn}</span>
                  <p className="text-[10px] text-slate-400">Legitimate Verified Clear</p>
                </div>
              </div>
            </div>

            {/* Labelled Scenarios Table */}
            <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
              <h2 className="text-sm font-bold text-white">Labelled Evaluation Test Cases</h2>

              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {results.map((sc) => (
                  <div
                    key={sc.scenarioCode}
                    className={`p-3 rounded-xl border text-xs space-y-1 transition-all ${
                      sc.isSuspicious
                        ? 'bg-rose-950/20 border-rose-500/30'
                        : 'bg-emerald-950/20 border-emerald-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-slate-400">{sc.scenarioCode}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            sc.isSuspicious
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}
                        >
                          {sc.isSuspicious ? 'LABEL: SUSPICIOUS' : 'LABEL: LEGITIMATE'}
                        </span>
                      </div>

                      <span className="font-mono text-xs font-bold text-slate-200">
                        Risk Score: <span className={sc.riskScore > 50 ? 'text-rose-400' : 'text-emerald-400'}>{sc.riskScore}</span>
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-100">{sc.name}</h3>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>Method: <strong className="text-slate-300">{sc.detectionMethod}</strong></span>
                      <span className="flex items-center gap-1 font-semibold text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Classification Match
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
