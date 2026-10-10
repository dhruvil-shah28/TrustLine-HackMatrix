'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, ShieldAlert, CheckCircle2, Clock, Activity } from 'lucide-react';

export default function ScenarioReplayPage() {
  const [steps, setSteps] = useState<any[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    fetch('/api/scenario-replay')
      .then((r) => r.json())
      .then((data) => setSteps(data.steps || []));
  }, []);

  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev < steps.length - 1) return prev + 1;
          setIsPlaying(false);
          return prev;
        });
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, steps.length]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Play className="h-6 w-6 text-rose-500" />
            Interactive Scenario Replay & Simulation
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Simulate progressive insider access, structuring, and circular funds routing in real-time.
          </p>
        </div>

        {/* Simulation Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isPlaying ? 'Pause Simulation' : 'Play Live Simulation'}
          </button>
          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentStepIndex(0);
            }}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Progressive Alert Detection Status Card */}
      <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-rose-500 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono technical-metadata text-xs text-slate-400">SIMULATED DATASET: SCEN-SIM-01</span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
            LIVE ACCUMULATION
          </span>
        </div>

        <h2 className="text-lg font-bold text-white">Progressive Connected Anomaly Detection State</h2>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-bold text-slate-400">Accumulated Signals:</span>
          {steps.slice(0, currentStepIndex + 1).flatMap((s) => s.detectedSignals).map((sig, i) => (
            <span key={i} className="px-2.5 py-1 rounded-lg text-xs bg-slate-900 text-rose-300 border border-rose-500/40 font-mono font-bold">
              ✓ {sig}
            </span>
          ))}
        </div>
      </div>

      {/* Timeline Steps List */}
      <div className="space-y-3">
        {steps.map((step, idx) => {
          const isActive = idx <= currentStepIndex;
          const isCurrent = idx === currentStepIndex;

          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition-all space-y-2 ${
                isCurrent
                  ? 'bg-indigo-950/40 border-indigo-500 shadow-lg shadow-indigo-500/20 scale-[1.01]'
                  : isActive
                  ? 'bg-slate-900 border-slate-800 text-slate-200'
                  : 'bg-slate-950/40 border-slate-900 text-slate-600 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-indigo-400 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> {step.time}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-slate-800">
                  {step.action}
                </span>
              </div>

              <div className="text-xs">
                <span className="font-semibold text-white">{step.actor}</span> &rarr; <span className="text-indigo-300">{step.target}</span>
                <p className="text-[11px] text-slate-400 mt-1">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
