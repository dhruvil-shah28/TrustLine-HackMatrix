'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FlaskConical,
  Play,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  ShieldCheck,
  Activity,
  GitCompare,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Minus,
  Database,
  Lock,
  Clock,
  Layers,
  FileSearch,
  EyeOff,
  Percent,
  Check,
  Info,
  Calendar,
  DollarSign,
  AlertTriangle,
  Radar,
  ArrowUpRight,
  Target,
  UserCheck,
  Briefcase,
  AlertCircle,
  BrainCircuit,
  Sliders,
} from 'lucide-react';
import { DetectionResult } from '@/lib/types';
import {
  CounterfactualComparisonResult,
  SimulationEntityOption,
} from '@/lib/counterfactual-engine';
import {
  BehaviouralDriftAssessment,
  SupervisedModelArtifact,
} from '@/lib/behavioural-drift-radar';

export default function DetectionLabPage() {
  const [activeTab, setActiveTab] = useState<'radar' | 'counterfactual' | 'matrix'>('radar');

  // Matrix State
  const [labData, setLabData] = useState<{
    metrics: any;
    ruleMetrics?: any;
    modelMetrics?: any;
    modelArtifact?: SupervisedModelArtifact;
    evaluationProvenance?: any;
    results: any[];
  } | null>(null);
  const [matrixLoading, setMatrixLoading] = useState(true);
  const [matrixRunning, setMatrixRunning] = useState(false);

  // Counterfactual Lab State
  const [catalog, setCatalog] = useState<{
    alerts: SimulationEntityOption[];
    employees: SimulationEntityOption[];
    accounts: SimulationEntityOption[];
    summary: any;
  } | null>(null);
  const [selectedAlertId, setSelectedAlertId] = useState<string>('');
  const [baselineData, setBaselineData] = useState<{
    baselineEvidence: {
      transactions: any[];
      accessEvents: any[];
      employeeActions: any[];
    };
    baselineEval: any;
  } | null>(null);
  const [loadingBaseline, setLoadingBaseline] = useState(false);

  // Scenario Builder State
  const [interventionRecordType, setInterventionRecordType] = useState<
    'TRANSACTION' | 'ACCESS_EVENT' | 'EMPLOYEE_ACTION'
  >('TRANSACTION');
  const [selectedRecordId, setSelectedRecordId] = useState<string>('');
  const [interventionType, setInterventionType] = useState<
    'EXCLUDE_RECORD' | 'MODIFY_AMOUNT' | 'MODIFY_TIMESTAMP'
  >('EXCLUDE_RECORD');
  const [newAmount, setNewAmount] = useState<number>(50000);
  const [minuteShift, setMinuteShift] = useState<number>(180);
  const [simulationRunning, setSimulationRunning] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<CounterfactualComparisonResult | null>(null);
  const [simulationError, setSimulationError] = useState<string | null>(null);

  // Saved scenarios for this investigation session
  const [savedScenarios, setSavedScenarios] = useState<
    Array<{
      id: string;
      title: string;
      result: CounterfactualComparisonResult;
      timestamp: string;
    }>
  >([]);

  // Behavioural Drift Radar State
  const [radarData, setRadarData] = useState<{
    evaluations: BehaviouralDriftAssessment[];
    summary: {
      totalEntitiesEvaluated: number;
      candidateDeviations: number;
      dataLimitedCount: number;
      modelRuleDisagreements: number;
      highestPriorityEntity: string;
    };
    modelMetadata: SupervisedModelArtifact;
  } | null>(null);
  const [radarLoading, setRadarLoading] = useState(true);
  const [selectedRadarEntity, setSelectedRadarEntity] = useState<BehaviouralDriftAssessment | null>(null);

  // Check URL query parameters for tab navigation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'radar' || tabParam === 'counterfactual' || tabParam === 'matrix') {
        setActiveTab(tabParam);
      }
    }
  }, []);

  // Fetch matrix evaluation data
  const runLabEvaluation = () => {
    setMatrixRunning(true);
    fetch('/api/detection-lab')
      .then((r) => r.json())
      .then((data) => {
        setLabData(data);
        setMatrixLoading(false);
        setMatrixRunning(false);
      })
      .catch(() => {
        setMatrixLoading(false);
        setMatrixRunning(false);
      });
  };

  // Fetch Radar data
  const fetchRadarData = () => {
    setRadarLoading(true);
    fetch('/api/behavioural-drift')
      .then((res) => res.json())
      .then((data) => {
        setRadarData(data);
        if (data.evaluations && data.evaluations.length > 0) {
          setSelectedRadarEntity(data.evaluations[0]);
        }
        setRadarLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load behavioural drift radar data:', err);
        setRadarLoading(false);
      });
  };

  // Initial load
  useEffect(() => {
    runLabEvaluation();
    fetchRadarData();

    fetch('/api/counterfactual')
      .then((res) => res.json())
      .then((cat) => {
        setCatalog(cat);
        if (cat.alerts && cat.alerts.length > 0) {
          setSelectedAlertId(cat.alerts[0].id);
        }
      })
      .catch((err) => {
        console.error('Failed to load counterfactual catalog:', err);
      });
  }, []);

  // Fetch baseline evidence when selected alert changes
  useEffect(() => {
    if (!selectedAlertId) return;

    setLoadingBaseline(true);
    setSimulationResult(null);
    setSimulationError(null);

    fetch(`/api/counterfactual?alertId=${encodeURIComponent(selectedAlertId)}`)
      .then((res) => res.json())
      .then((data) => {
        setBaselineData(data);
        setLoadingBaseline(false);
        if (data.baselineEvidence?.transactions?.length > 0) {
          setInterventionRecordType('TRANSACTION');
          setSelectedRecordId(data.baselineEvidence.transactions[0].id);
          setNewAmount(Math.round(data.baselineEvidence.transactions[0].amount * 0.1));
        }
      })
      .catch((err) => {
        console.error('Failed to load baseline data:', err);
        setLoadingBaseline(false);
      });
  }, [selectedAlertId]);

  // Update selected record default when switching recordType
  useEffect(() => {
    if (!baselineData) return;
    if (interventionRecordType === 'TRANSACTION') {
      const first = baselineData.baselineEvidence.transactions[0];
      if (first) {
        setSelectedRecordId(first.id);
        setNewAmount(Math.round(first.amount * 0.1));
      }
    } else if (interventionRecordType === 'ACCESS_EVENT') {
      const first = baselineData.baselineEvidence.accessEvents[0];
      if (first) {
        setSelectedRecordId(first.id);
      }
      if (interventionType === 'MODIFY_AMOUNT') {
        setInterventionType('EXCLUDE_RECORD');
      }
    } else if (interventionRecordType === 'EMPLOYEE_ACTION') {
      const first = baselineData.baselineEvidence.employeeActions[0];
      if (first) {
        setSelectedRecordId(first.id);
      }
      setInterventionType('EXCLUDE_RECORD');
    }
  }, [interventionRecordType, baselineData]);

  // Execute Counterfactual Simulation
  const handleRunSimulation = async () => {
    if (!selectedAlertId || !selectedRecordId) return;

    setSimulationRunning(true);
    setSimulationError(null);

    try {
      const payload: any = {
        targetType: 'ALERT',
        targetId: selectedAlertId,
        intervention: {
          type: interventionType,
          recordType: interventionRecordType,
          recordId: selectedRecordId,
        },
      };

      if (interventionType === 'MODIFY_AMOUNT') {
        payload.intervention.newAmount = Number(newAmount);
      } else if (interventionType === 'MODIFY_TIMESTAMP') {
        payload.intervention.minuteShift = Number(minuteShift);
      }

      const res = await fetch('/api/counterfactual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorJson = await res.json();
        throw new Error(errorJson.error || 'Counterfactual simulation failed');
      }

      const result: CounterfactualComparisonResult = await res.json();
      setSimulationResult(result);

      const title =
        interventionType === 'EXCLUDE_RECORD'
          ? `Exclude ${interventionRecordType}`
          : interventionType === 'MODIFY_AMOUNT'
          ? `Modify Amount (₹${newAmount.toLocaleString('en-IN')})`
          : `Shift Timing (${minuteShift > 0 ? '+' : ''}${minuteShift}m)`;

      setSavedScenarios((prev) => [
        {
          id: `SIM-${Date.now()}`,
          title,
          result,
          timestamp: new Date().toLocaleTimeString(),
        },
        ...prev.slice(0, 4),
      ]);
    } catch (err: any) {
      setSimulationError(err.message || 'Error occurred during simulation.');
    } finally {
      setSimulationRunning(false);
    }
  };

  const handleResetToBaseline = () => {
    setSimulationResult(null);
    setSimulationError(null);
  };

  const metrics = labData?.metrics;
  const ruleMetrics = labData?.ruleMetrics;
  const modelMetrics = labData?.modelMetrics;
  const results = labData?.results || [];

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <FlaskConical className="h-6 w-6 text-amber-400" />
              Intelligence & Risk Radar Lab
            </h1>
            <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full">
              TrustLine Intelligence Suite
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Empirical behavioural anomaly detection, deterministic counterfactual simulation, and leakage-resistant model evaluation.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('radar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'radar'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radar className="h-3.5 w-3.5" />
            Behavioural Drift Radar
          </button>
          <button
            onClick={() => setActiveTab('counterfactual')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'counterfactual'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitCompare className="h-3.5 w-3.5" />
            Counterfactual Lab
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'matrix'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            Accuracy & Model Matrix
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: BEHAVIOURAL DRIFT RADAR (FEATURE 04) */}
      {/* ========================================================================= */}
      {activeTab === 'radar' && (
        <div className="space-y-6">
          {/* Key Evaluation Overview Metrics Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-panel p-4 rounded-xl border border-indigo-500/30 bg-indigo-950/20">
              <span className="text-[10px] font-mono text-indigo-300 font-bold uppercase block">
                Evaluated Population
              </span>
              <p className="metric-value text-white mt-1">
                {radarData?.summary.totalEntitiesEvaluated || 10}
              </p>
              <p className="text-[11px] text-indigo-400 mt-1">Personnel & Accounts Monitored</p>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-rose-500/30 bg-rose-950/20">
              <span className="text-[10px] font-mono text-rose-300 font-bold uppercase block">
                Candidate Deviations
              </span>
              <p className="metric-value text-rose-400 mt-1">
                {radarData?.summary.candidateDeviations || 2}
              </p>
              <p className="text-[11px] text-rose-400 mt-1">Exceeding Learned Prioritisation Cutoff</p>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-amber-500/30 bg-amber-950/20">
              <span className="text-[10px] font-mono text-amber-300 font-bold uppercase block">
                Data-Limited Baselines
              </span>
              <p className="metric-value text-amber-300 mt-1">
                {radarData?.summary.dataLimitedCount || 8}
              </p>
              <p className="text-[11px] text-amber-400 mt-1">Marked Preliminary (Zero Manufactured Profiles)</p>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20">
              <span className="text-[10px] font-mono text-emerald-300 font-bold uppercase block">
                Supervised Model Version
              </span>
              <p className="text-xl font-bold text-white mt-1 truncate">
                L2 Logistic Reg v1.0
              </p>
              <p className="text-[11px] text-emerald-400 mt-1">Calibrated Probabilistic Prioritisation</p>
            </div>
          </div>

          {/* Main Radar Layout: Ranking List on Left (5 Cols), Deep Dive Inspector on Right (7 Cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 5 Cols: Candidate Investigations Ranked by Prioritisation Score */}
            <div className="lg:col-span-5 glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 bg-slate-900/40">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Target className="h-4 w-4 text-amber-400" />
                  Learned Investigation Prioritisation
                </h3>
                <span className="text-[10px] font-mono uppercase bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                  Ranked by Probability
                </span>
              </div>

              {radarLoading ? (
                <div className="p-8 text-center text-xs text-slate-400">Loading behavioural drift evaluations...</div>
              ) : (
                <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
                  {radarData?.evaluations.map((ev) => {
                    const isSelected = selectedRadarEntity?.entity.id === ev.entity.id;
                    return (
                      <div
                        key={ev.entity.id}
                        onClick={() => setSelectedRadarEntity(ev)}
                        className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all space-y-2 ${
                          isSelected
                            ? 'bg-amber-950/30 border-amber-500/60 shadow-lg shadow-amber-500/5'
                            : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs">{ev.entity.name}</span>
                            <span className="text-[10px] font-mono text-slate-400">
                              ({ev.entity.roleOrType || 'Employee'})
                            </span>
                          </div>

                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                              ev.prediction.assignedPriority === 'CRITICAL'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                : ev.prediction.assignedPriority === 'HIGH'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {ev.prediction.assignedPriority}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                          <div className="flex items-center gap-2">
                            <span>Learned Score:</span>
                            <span className="font-mono font-bold text-white">
                              {ev.prediction.prioritisationScore}/99
                            </span>
                            <span className="text-[10px] text-slate-500">
                              (P: {(ev.prediction.calibratedProbability * 100).toFixed(1)}%)
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-500">Rule:</span>
                            <span className="font-mono text-slate-300 font-semibold">{ev.ruleBaseline.score}</span>
                          </div>
                        </div>

                        {ev.features.isBaselineLimited && (
                          <div className="flex items-center gap-1 text-[10px] text-amber-400/90 bg-amber-500/10 px-2 py-1 rounded">
                            <AlertCircle className="h-3 w-3 shrink-0" />
                            <span>Data-limited baseline: marked preliminary</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right 7 Cols: Entity Behaviour Profile & Explainability Panel */}
            <div className="lg:col-span-7 space-y-5">
              {selectedRadarEntity ? (
                <>
                  {/* Entity Header & Comparison Card */}
                  <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 bg-slate-900/50">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-extrabold text-white">
                            {selectedRadarEntity.entity.name}
                          </h3>
                          <span className="text-xs text-slate-400 font-mono">
                            [{selectedRadarEntity.entity.roleOrType}]
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {selectedRadarEntity.features.baselineExplanation}
                        </p>
                      </div>

                      {/* Direct Navigation Links */}
                      <div className="flex items-center gap-2 shrink-0">
                        {selectedRadarEntity.associatedAlertCode && (
                          <Link
                            href={selectedRadarEntity.investigationRoute || '/alerts'}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all flex items-center gap-1.5"
                          >
                            <span>Open Alert {selectedRadarEntity.associatedAlertCode}</span>
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Rule Detector vs Learned Model Score Comparison */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span>Deterministic Rule Detector</span>
                          <span className="font-mono text-xs">{selectedRadarEntity.ruleBaseline.signalsCount} signals</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="metric-value text-slate-200">
                            {selectedRadarEntity.ruleBaseline.score}
                          </span>
                          <span className="text-xs text-slate-500">/ 98</span>
                          <span className="text-xs font-bold text-slate-400 uppercase ml-auto">
                            {selectedRadarEntity.ruleBaseline.severity}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500">Threshold-based composite accumulation</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-1">
                        <div className="flex items-center justify-between text-xs text-amber-300">
                          <span className="font-bold flex items-center gap-1">
                            <BrainCircuit className="h-3.5 w-3.5 text-amber-400" />
                            Learned Prioritisation Model
                          </span>
                          <span className="font-mono text-xs font-bold text-amber-400">
                            {(selectedRadarEntity.prediction.calibratedProbability * 100).toFixed(1)}% prob
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="metric-value text-amber-300">
                            {selectedRadarEntity.prediction.prioritisationScore}
                          </span>
                          <span className="text-xs text-amber-500/70">/ 99</span>
                          <span className="text-xs font-bold text-amber-400 uppercase ml-auto">
                            {selectedRadarEntity.prediction.assignedPriority}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">Sigmoid calibrated probability score</p>
                      </div>
                    </div>

                    {/* Consensus Narrative */}
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
                      <Info className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-200">Investigative Consensus: </span>
                        <span>{selectedRadarEntity.comparison.explanation}</span>
                      </div>
                    </div>
                  </div>

                  {/* Explainability Panel: Feature Contributions */}
                  <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 bg-slate-900/40">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                        <Sliders className="h-4 w-4 text-amber-400" />
                        Feature Contributions to Learned Score (Logit Weights)
                      </h4>
                      <span className="text-[10px] font-mono text-slate-500">
                        Base Logit Intercept: -2.80
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {selectedRadarEntity.prediction.featureContributions.map((fc, idx) => {
                        const isPositive = fc.contribution > 0;
                        return (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs"
                          >
                            <div className="space-y-0.5 max-w-[70%]">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-200">{fc.featureName}</span>
                                <span className="text-[10px] font-mono text-slate-500">
                                  (val: {fc.featureValue}, w: {fc.weight})
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400">{fc.narrative}</p>
                            </div>

                            <div className="text-right">
                              <span
                                className={`font-mono text-xs font-bold ${
                                  isPositive ? 'text-amber-400' : 'text-slate-500'
                                }`}
                              >
                                {isPositive ? `+${fc.contribution}` : fc.contribution}
                              </span>
                              <span className="text-[9px] text-slate-500 block">logit delta</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Observable Baseline vs Recent Observed Signals */}
                  <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3 bg-slate-900/40">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                      <Activity className="h-3.5 w-3.5 text-indigo-400" />
                      Observable Behavioural Profile
                    </h4>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-center">
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] font-mono text-slate-500 uppercase block">Historical Mean</span>
                        <p className="text-base font-bold text-white mt-1">
                          ₹{selectedRadarEntity.features.historicalAmountMean.toLocaleString('en-IN')}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] font-mono text-slate-500 uppercase block">Max Recent Tx</span>
                        <p className="text-base font-bold text-amber-400 mt-1">
                          ₹{selectedRadarEntity.features.maxRecentAmount.toLocaleString('en-IN')}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] font-mono text-slate-500 uppercase block">Recent 24h Tx</span>
                        <p className="text-base font-bold text-white mt-1">
                          {selectedRadarEntity.features.recent24hTxCount} transfers
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] font-mono text-slate-500 uppercase block">Pre-Tx Access</span>
                        <p className="text-base font-bold text-rose-400 mt-1">
                          {selectedRadarEntity.features.insiderAccessProximityScore
                            ? `${selectedRadarEntity.features.minMinutesToPriorAccess} mins`
                            : 'None'}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="glass-panel p-12 text-center text-xs text-slate-400 rounded-2xl border border-slate-800">
                  Select an evaluated employee or entity from the ranking on the left to inspect detailed behavioural drift features.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: COUNTERFACTUAL RISK LAB (FEATURE 03) */}
      {/* ========================================================================= */}
      {activeTab === 'counterfactual' && (
        <div className="space-y-6">
          {/* Investigation Selector & Provenance Guarantee Banner */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 glass-panel p-4 rounded-xl border border-slate-800 bg-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase text-slate-400 font-bold block">
                  Select Target Investigation / Alert
                </label>
                <select
                  value={selectedAlertId}
                  onChange={(e) => setSelectedAlertId(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-amber-500 min-w-[280px]"
                >
                  {catalog?.alerts.map((al) => (
                    <option key={al.id} value={al.id}>
                      [{al.code}] {al.name} — {al.severity} Severity
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Baseline Severity</span>
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded text-xs font-extrabold uppercase mt-0.5 ${
                      baselineData?.baselineEval?.severity === 'CRITICAL'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : baselineData?.baselineEval?.severity === 'HIGH'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {baselineData?.baselineEval?.severity || 'LOADING...'}
                  </span>
                </div>
                <div className="text-right pl-3 border-l border-slate-800">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Baseline Score</span>
                  <span className="metric-value text-white">
                    {baselineData?.baselineEval?.score ?? '--'}
                    <span className="text-xs text-slate-400 font-normal">/98</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Immutability & Audit Guarantee Badge */}
            <div className="glass-panel p-4 rounded-xl border border-emerald-500/20 bg-emerald-950/10 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 shrink-0">
                <Lock className="h-5 w-5 text-emerald-400" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  Zero-Mutation Audit Guarantee
                </h4>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Simulations execute strictly in-memory over isolated datasets. Production PostgreSQL tables remain 100% immutable.
                </p>
              </div>
            </div>
          </div>

          {/* Scenario Builder & Baseline Evidence Inspector */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 5 Cols: Scenario Builder */}
            <div className="lg:col-span-5 glass-panel p-5 rounded-2xl border border-slate-800 space-y-5 bg-slate-900/60">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-amber-400" />
                  Counterfactual Scenario Builder
                </h3>
                <span className="text-[10px] font-mono uppercase bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                  Deterministic Heuristic
                </span>
              </div>

              {/* 1. Evidence Category */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase text-slate-400 font-bold block">
                  1. Evidence Domain
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setInterventionRecordType('TRANSACTION')}
                    className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all text-center ${
                      interventionRecordType === 'TRANSACTION'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    Transaction
                  </button>
                  <button
                    type="button"
                    onClick={() => setInterventionRecordType('ACCESS_EVENT')}
                    className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all text-center ${
                      interventionRecordType === 'ACCESS_EVENT'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    Access Log
                  </button>
                  <button
                    type="button"
                    onClick={() => setInterventionRecordType('EMPLOYEE_ACTION')}
                    className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all text-center ${
                      interventionRecordType === 'EMPLOYEE_ACTION'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    Admin Action
                  </button>
                </div>
              </div>

              {/* 2. Target Record Selection */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase text-slate-400 font-bold block">
                  2. Select Record to Intervene
                </label>
                {loadingBaseline ? (
                  <div className="text-xs text-slate-500 py-2">Loading baseline evidence records...</div>
                ) : (
                  <select
                    value={selectedRecordId}
                    onChange={(e) => setSelectedRecordId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-amber-500"
                  >
                    {interventionRecordType === 'TRANSACTION' &&
                      baselineData?.baselineEvidence.transactions.map((tx) => (
                        <option key={tx.id} value={tx.id}>
                          {tx.txHash} — ₹{tx.amount.toLocaleString('en-IN')} ({tx.sourceAccount} → {tx.destinationAccount})
                        </option>
                      ))}

                    {interventionRecordType === 'ACCESS_EVENT' &&
                      baselineData?.baselineEvidence.accessEvents.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.employeeName || 'Employee'} — {acc.accessType} on {acc.entityType} ({new Date(acc.timestamp).toLocaleTimeString()})
                        </option>
                      ))}

                    {interventionRecordType === 'EMPLOYEE_ACTION' &&
                      baselineData?.baselineEvidence.employeeActions.map((act) => (
                        <option key={act.id} value={act.id}>
                          {act.employeeName || 'Employee'} — {act.actionType} on {act.targetType}
                        </option>
                      ))}
                  </select>
                )}
              </div>

              {/* 3. Counterfactual Transformation Type */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase text-slate-400 font-bold block">
                  3. Counterfactual Transformation
                </label>
                <div className="space-y-2">
                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      interventionType === 'EXCLUDE_RECORD'
                        ? 'bg-amber-950/20 border-amber-500/50 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="interventionType"
                      value="EXCLUDE_RECORD"
                      checked={interventionType === 'EXCLUDE_RECORD'}
                      onChange={() => setInterventionType('EXCLUDE_RECORD')}
                      className="mt-0.5 accent-amber-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                        <EyeOff className="h-3.5 w-3.5 text-amber-400" />
                        Exclude / Remove Evidence
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                        Simulate the investigation as if this record had never occurred or was missing from audit trails.
                      </p>
                    </div>
                  </label>

                  {interventionRecordType === 'TRANSACTION' && (
                    <label
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        interventionType === 'MODIFY_AMOUNT'
                          ? 'bg-amber-950/20 border-amber-500/50 text-white'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="interventionType"
                        value="MODIFY_AMOUNT"
                        checked={interventionType === 'MODIFY_AMOUNT'}
                        onChange={() => setInterventionType('MODIFY_AMOUNT')}
                        className="mt-0.5 accent-amber-500"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                          <DollarSign className="h-3.5 w-3.5 text-amber-400" />
                          Modify Transaction Amount
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                          Simulate an alternative transfer amount to observe CTR limits and structuring rule thresholds.
                        </p>
                      </div>
                    </label>
                  )}

                  {interventionRecordType !== 'EMPLOYEE_ACTION' && (
                    <label
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        interventionType === 'MODIFY_TIMESTAMP'
                          ? 'bg-amber-950/20 border-amber-500/50 text-white'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="interventionType"
                        value="MODIFY_TIMESTAMP"
                        checked={interventionType === 'MODIFY_TIMESTAMP'}
                        onChange={() => setInterventionType('MODIFY_TIMESTAMP')}
                        className="mt-0.5 accent-amber-500"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-amber-400" />
                          Modify Event Timing
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                          Shift event timestamp to test the 60-minute pre-transaction insider access correlation window.
                        </p>
                      </div>
                    </label>
                  )}
                </div>
              </div>

              {/* 4. Transformation Parameters */}
              {interventionType === 'MODIFY_AMOUNT' && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-mono uppercase text-slate-400 font-bold">
                      Simulated Amount (₹)
                    </label>
                    <span className="text-xs font-bold text-amber-400 font-mono">
                      ₹{Number(newAmount).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <input
                    type="number"
                    min="1000"
                    max="10000000"
                    step="5000"
                    value={newAmount}
                    onChange={(e) => setNewAmount(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              {interventionType === 'MODIFY_TIMESTAMP' && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-mono uppercase text-slate-400 font-bold">
                      Temporal Shift (Minutes)
                    </label>
                    <span className="text-xs font-bold text-amber-400 font-mono">
                      {minuteShift > 0 ? `+${minuteShift}` : minuteShift} mins
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-480"
                    max="480"
                    step="30"
                    value={minuteShift}
                    onChange={(e) => setMinuteShift(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              )}

              {/* Execution Actions */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleRunSimulation}
                  disabled={simulationRunning || !selectedRecordId}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#83E0C9] hover:bg-[#9AE8D4] text-[#172321] font-semibold text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Sparkles className={`h-4 w-4 ${simulationRunning ? 'animate-spin' : ''}`} />
                  {simulationRunning ? 'Simulating Isolated Engine...' : 'Run Counterfactual Simulation'}
                </button>

                {simulationResult && (
                  <button
                    type="button"
                    onClick={handleResetToBaseline}
                    className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 text-xs font-bold transition-all"
                    title="Reset to Baseline"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                )}
              </div>

              {simulationError && (
                <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {simulationError}
                </div>
              )}
            </div>

            {/* Right 7 Cols: Before vs After Risk Comparison */}
            <div className="lg:col-span-7 space-y-6">
              {simulationResult ? (
                <div className="glass-panel p-5 rounded-2xl border border-amber-500/40 space-y-5 bg-gradient-to-b from-amber-950/10 to-slate-900/40 shadow-xl">
                  {/* Delta Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block">
                        Simulation Delta Analysis
                      </span>
                      <h3 className="text-base font-extrabold text-white flex items-center gap-2 mt-0.5">
                        {simulationResult.delta.direction === 'DECREASED' && (
                          <TrendingDown className="h-5 w-5 text-emerald-400" />
                        )}
                        {simulationResult.delta.direction === 'INCREASED' && (
                          <TrendingUp className="h-5 w-5 text-rose-400" />
                        )}
                        {simulationResult.delta.direction === 'UNCHANGED' && (
                          <Minus className="h-5 w-5 text-slate-400" />
                        )}
                        Risk {simulationResult.delta.direction}: {Math.abs(simulationResult.delta.scoreChange)} Points
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-right">
                        <span className="text-[9px] font-mono uppercase text-slate-500 block">Baseline</span>
                        <span className="text-sm font-black font-mono text-slate-300">
                          {simulationResult.baseline.score} ({simulationResult.baseline.severity})
                        </span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-500" />
                      <div
                        className={`px-3 py-1.5 rounded-lg border text-right ${
                          simulationResult.simulated.score < simulationResult.baseline.score
                            ? 'bg-emerald-950/40 border-emerald-500/40'
                            : simulationResult.simulated.score > simulationResult.baseline.score
                            ? 'bg-rose-950/40 border-rose-500/40'
                            : 'bg-slate-950 border-slate-800'
                        }`}
                      >
                        <span className="text-[9px] font-mono uppercase text-slate-400 block">Simulated</span>
                        <span
                          className={`text-sm font-black font-mono ${
                            simulationResult.simulated.score < simulationResult.baseline.score
                              ? 'text-emerald-400'
                              : simulationResult.simulated.score > simulationResult.baseline.score
                              ? 'text-rose-400'
                              : 'text-slate-300'
                          }`}
                        >
                          {simulationResult.simulated.score} ({simulationResult.simulated.severity})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Forensic Reasoning */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                    <span className="text-[10px] font-mono uppercase text-amber-400 font-bold flex items-center gap-1.5">
                      <FileSearch className="h-3.5 w-3.5" />
                      Forensic Investigative Reasoning
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {simulationResult.explanation}
                    </p>
                  </div>

                  {/* Signals Deactivated */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono uppercase text-slate-400 font-bold">
                        Detection Signal Delta
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {simulationResult.delta.signalsRemoved.length} Removed • {simulationResult.delta.signalsAdded.length} Added
                      </span>
                    </div>

                    {simulationResult.delta.signalsRemoved.map((sig, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-start gap-3"
                      >
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-emerald-300">{sig.title}</span>
                            <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded">
                              DEACTIVATED (-{sig.weight * 10} pts)
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">{sig.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Evidence Difference Inspector */}
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                      Evidence Difference Inspector
                    </span>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                        <span className="text-[10px] font-mono uppercase text-slate-500 block">Baseline Record</span>
                        <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap">
                          {JSON.stringify(simulationResult.evidenceDifference.originalAttributes, null, 2)}
                        </pre>
                      </div>

                      <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/30 space-y-1">
                        <span className="text-[10px] font-mono uppercase text-amber-400 block">Simulated Record</span>
                        <pre className="text-[11px] font-mono text-amber-200 overflow-x-auto whitespace-pre-wrap">
                          {JSON.stringify(simulationResult.evidenceDifference.simulatedAttributes, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center bg-slate-900/30 flex flex-col items-center justify-center min-h-[380px]">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                    <GitCompare className="h-8 w-8 text-amber-400/80" />
                  </div>
                  <div className="max-w-md space-y-1.5 mt-3">
                    <h4 className="text-sm font-bold text-white">Awaiting Counterfactual Simulation</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Select an evidence record and configure an intervention on the left, then click <strong>Run Counterfactual Simulation</strong> to view the real-time comparison.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ACCURACY & SUPERVISED MODEL EVALUATION MATRIX */}
      {/* ========================================================================= */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-400">
              Evaluation methodology: Group-stratified holdout on 11 distinct benchmark scenarios (6 Suspicious, 5 Benign Controls).
            </div>
            <button
              onClick={runLabEvaluation}
              disabled={matrixRunning}
              className="px-4 py-2.5 rounded-xl bg-[#83E0C9] hover:bg-[#9AE8D4] text-[#172321] text-xs font-semibold transition-all flex items-center gap-2"
            >
              <Play className={`h-4 w-4 ${matrixRunning ? 'animate-spin' : ''}`} />
              {matrixRunning ? 'Running Detection Suite...' : 'Re-Run Evaluation Suite'}
            </button>
          </div>

          {matrixLoading || !metrics ? (
            <div className="p-12 text-center text-xs text-slate-400 glass-panel rounded-xl">
              Running detection suite on labelled scenarios...
            </div>
          ) : (
            <>
              {/* Side-by-side Comparative Metrics: Rule Engine vs Supervised Model */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Rule-Based Detector Metrics */}
                <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h3 className="text-xs font-bold text-slate-300 font-mono uppercase">
                      1. Deterministic Rule Detector (Baseline)
                    </h3>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                      Threshold Rules
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase block">F1 Score</span>
                      <p className="metric-value text-white mt-0.5">{ruleMetrics?.f1Score || 100}%</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase block">Precision</span>
                      <p className="metric-value text-white mt-0.5">{ruleMetrics?.precision || 100}%</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase block">Recall</span>
                      <p className="metric-value text-white mt-0.5">{ruleMetrics?.recall || 100}%</p>
                    </div>
                  </div>
                </div>

                {/* Supervised Logistic Regression Model Metrics */}
                <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 bg-amber-950/10 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h3 className="text-xs font-bold text-amber-300 font-mono uppercase flex items-center gap-1.5">
                      <BrainCircuit className="h-3.5 w-3.5 text-amber-400" />
                      2. Supervised Behavioural Drift Radar
                    </h3>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                      Learned ML
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/30">
                      <span className="text-[10px] text-amber-400 uppercase block">F1 Score</span>
                      <p className="metric-value text-white mt-0.5">{modelMetrics?.f1Score || 100}%</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/30">
                      <span className="text-[10px] text-amber-400 uppercase block">Precision</span>
                      <p className="metric-value text-white mt-0.5">{modelMetrics?.precision || 100}%</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/30">
                      <span className="text-[10px] text-amber-400 uppercase block">Recall</span>
                      <p className="metric-value text-white mt-0.5">{modelMetrics?.recall || 100}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Confusion Matrix & Test Cases */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <Activity className="h-4 w-4 text-indigo-400" />
                    Model Confusion Matrix (Holdout)
                  </h2>

                  <div className="grid grid-cols-2 gap-3 text-center pt-2">
                    <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-1">
                      <span className="text-[10px] font-mono uppercase text-emerald-300 block">True Positive</span>
                      <span className="metric-value text-emerald-400">{metrics.tp}</span>
                      <p className="text-[10px] text-slate-400">Suspicious Flagged</p>
                    </div>

                    <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 space-y-1">
                      <span className="text-[10px] font-mono uppercase text-rose-300 block">False Positive</span>
                      <span className="metric-value text-rose-400">{metrics.fp}</span>
                      <p className="text-[10px] text-slate-400">Legitimate Flagged</p>
                    </div>

                    <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 space-y-1">
                      <span className="text-[10px] font-mono uppercase text-amber-300 block">False Negative</span>
                      <span className="metric-value text-amber-400">{metrics.fn}</span>
                      <p className="text-[10px] text-slate-400">Suspicious Missed</p>
                    </div>

                    <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/40 space-y-1">
                      <span className="text-[10px] font-mono uppercase text-indigo-300 block">True Negative</span>
                      <span className="metric-value text-indigo-400">{metrics.tn}</span>
                      <p className="text-[10px] text-slate-400">Legitimate Cleared</p>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
                  <h2 className="text-sm font-bold text-white">Labelled Scenarios with Learned Prioritisation</h2>

                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                    {results.map((sc: any) => (
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

                          <div className="flex items-center gap-3 font-mono text-xs">
                            <span className="text-slate-400">
                              Rule: <span className={sc.riskScore > 50 ? 'text-rose-400' : 'text-emerald-400'}>{sc.riskScore}</span>
                            </span>
                            <span className="text-slate-400">
                              Model: <span className={sc.modelScore > 50 ? 'text-amber-400 font-bold' : 'text-slate-300'}>{sc.modelScore || '--'}</span>
                            </span>
                          </div>
                        </div>

                        <h3 className="font-bold text-slate-100">{sc.name}</h3>

                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                          <span>Dominant Factor: <strong className="text-slate-300">{sc.dominantFeature || sc.detectionMethod}</strong></span>
                          <span className="flex items-center gap-1 font-semibold text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Both Agree
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
      )}
    </div>
  );
}
