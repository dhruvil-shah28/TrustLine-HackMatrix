import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

export const FCIRP_FEATURES = [
  'n_hits',
  'n_typologies',
  'n_layers',
  'has_insider',
  'has_financial',
  'has_connection',
  'has_link',
  'min_link_gap_h',
  'max_sev',
  'n_accounts',
  'n_employees',
  'n_txns',
  'n_events',
  'log_total_amount',
  'span_h',
  'log_amount_per_hour',
  'recurring_periods',
  'acct_recurring_amt',
  'acct_passthrough',
  'acct_burst',
  'acct_idle_days',
  'acct_vol_income',
  'acct_pagerank',
  'acct_comm_size',
  'acct_temporal_cycles',
  'acct_cycle_min_span_h',
  'acct_in_out_lag_h',
  'acct_ins_access_to_txn_h',
  'acct_gap_cv',
  'acct_repeat_cp',
  'emp_offhours_ratio',
  'emp_oop_ratio',
  'emp_log_views',
  'frac_events_offhours',
  'frac_events_oop',
  'n_accounts_accessed',
  'ev_per_account',
] as const;

export type FcirpFeatureName = (typeof FCIRP_FEATURES)[number];
export type FcirpFeatureMap = Partial<Record<FcirpFeatureName, number>>;

function resolveFcirpModelPath(): string | null {
  const candidates = [
    process.env.FCIRP_MODEL_PATH,
    process.env.NEXT_PUBLIC_FCIRP_MODEL_PATH,
    process.env.FCIRP_MODEL_DIR ? path.join(process.env.FCIRP_MODEL_DIR, 'case_priority.pkl') : '',
    path.resolve(process.cwd(), '..', '..', 'Downloads', 'fcirp', 'models', 'case_priority.pkl'),
    path.resolve(process.cwd(), 'external', 'fcirp', 'models', 'case_priority.pkl'),
    path.resolve(process.cwd(), '..', 'fcirp', 'models', 'case_priority.pkl'),
  ].filter((candidate): candidate is string => Boolean(candidate));

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

export function getFcirpModelMetadata() {
  return {
    modelName: 'FCIRP_CASE_PRIORITY_V1',
    version: '1.0.0',
    source: resolveFcirpModelPath() ?? 'FCIRP model path is not configured in this environment.',
    featureCount: FCIRP_FEATURES.length,
    featureNames: [...FCIRP_FEATURES],
    protocol:
      'Trained on FCIRP case candidates from the external Python project; uses the original 37 feature schema and LightGBM classification head.',
  };
}

export function normalizeFcirpFeatureMap(input: FcirpFeatureMap): Record<FcirpFeatureName, number> {
  const rows = {} as Record<FcirpFeatureName, number>;

  for (const feature of FCIRP_FEATURES) {
    const raw = input[feature] ?? 0;
    const value = typeof raw === 'number' && Number.isFinite(raw) ? raw : 0;
    rows[feature] = Number.isFinite(value) ? value : 0;
  }

  return rows;
}

export function buildFcirpFeatureVectorFromBehaviouralFeatures(
  features: object
): FcirpFeatureMap {
  const values = features as Record<string, number | string | boolean | undefined>;

  const recent24hTxCount = Number(values.recent24hTxCount ?? 0);
  const txFrequencyRatio = Number(values.txFrequencyRatio ?? 0);
  const newCounterpartyCount = Number(values.newCounterpartyCount ?? 0);
  const circularLoopHopDetected = Number(values.circularLoopHopDetected ?? 0);
  const insiderAccessProximityScore = Number(values.insiderAccessProximityScore ?? 0);
  const recentBeneficiaryChangeCount = Number(values.recentBeneficiaryChangeCount ?? 0);
  const roleEntityMismatchScore = Number(values.roleEntityMismatchScore ?? 0);
  const amountZScore = Number(values.amountZScore ?? 0);
  const minMinutesToPriorAccess = Number(values.minMinutesToPriorAccess ?? 0);
  const historicalDailyTxAverage = Number(values.historicalDailyTxAverage ?? 0);
  const sampleCount = Number(values.sampleCount ?? 0);
  const maxRecentAmount = Number(values.maxRecentAmount ?? 0);

  const nHits = Math.max(
    1,
    recent24hTxCount +
      recentBeneficiaryChangeCount +
      circularLoopHopDetected * 2 +
      insiderAccessProximityScore * 2 +
      roleEntityMismatchScore
  );

  return normalizeFcirpFeatureMap({
    n_hits: nHits,
    n_typologies: Math.min(4, Math.max(1, Math.round((nHits + newCounterpartyCount) / 3))),
    n_layers: Math.min(3, Math.max(1, insiderAccessProximityScore + roleEntityMismatchScore + circularLoopHopDetected + 1)),
    has_insider: insiderAccessProximityScore > 0 ? 1 : 0,
    has_financial: recent24hTxCount > 0 ? 1 : 0,
    has_connection: newCounterpartyCount > 0 ? 1 : 0,
    has_link: insiderAccessProximityScore > 0 ? 1 : 0,
    min_link_gap_h: minMinutesToPriorAccess / 60,
    max_sev: Math.min(5, Math.max(1, Math.round((amountZScore + 1) * 2))),
    n_accounts: Math.max(1, newCounterpartyCount + 1),
    n_employees: 1,
    n_txns: Math.max(1, recent24hTxCount + sampleCount),
    n_events: Math.max(1, sampleCount + recentBeneficiaryChangeCount + recent24hTxCount),
    log_total_amount: Math.log1p(Math.max(0, maxRecentAmount)),
    span_h: Math.max(1, recent24hTxCount * 2),
    log_amount_per_hour: Math.log1p(Math.max(1, maxRecentAmount / Math.max(1, recent24hTxCount || 1))),
    recurring_periods: circularLoopHopDetected > 0 ? 2 : 0,
    acct_recurring_amt: circularLoopHopDetected > 0 ? 0.5 : 0,
    acct_passthrough: newCounterpartyCount > 0 ? 0.25 : 0,
    acct_burst: txFrequencyRatio > 0 ? Math.min(1, txFrequencyRatio / 2) : 0,
    acct_idle_days: historicalDailyTxAverage > 0 ? Math.max(0, 30 / Math.max(1, historicalDailyTxAverage)) : 0,
    acct_vol_income: Math.max(0, amountZScore / 2),
    acct_pagerank: newCounterpartyCount > 0 ? 0.33 : 0.1,
    acct_comm_size: Math.max(1, newCounterpartyCount + 1),
    acct_temporal_cycles: circularLoopHopDetected,
    acct_cycle_min_span_h: Math.max(1, minMinutesToPriorAccess / 60),
    acct_in_out_lag_h: Math.max(1, minMinutesToPriorAccess / 60),
    acct_ins_access_to_txn_h: Math.max(1, minMinutesToPriorAccess / 60),
    acct_gap_cv: txFrequencyRatio > 0 ? 0.35 : 0,
    acct_repeat_cp: recentBeneficiaryChangeCount > 0 ? 0.4 : 0,
    emp_offhours_ratio: circularLoopHopDetected > 0 ? 0.35 : 0.1,
    emp_oop_ratio: roleEntityMismatchScore > 0 ? 0.6 : 0.1,
    emp_log_views: Math.log1p(sampleCount + recent24hTxCount),
    frac_events_offhours: insiderAccessProximityScore > 0 ? 0.5 : 0.1,
    frac_events_oop: roleEntityMismatchScore > 0 ? 0.5 : 0.1,
    n_accounts_accessed: Math.max(1, newCounterpartyCount + 1),
    ev_per_account: Math.max(1, recent24hTxCount / Math.max(1, newCounterpartyCount + 1)),
  });
}

function resolveFcirpPython(): string | null {
  const candidates = [
    path.resolve(process.cwd(), '.venv-fcirp', 'bin', 'python'),
    path.resolve(process.cwd(), '..', '..', 'Downloads', 'fcirp', '.venv', 'Scripts', 'python.exe'),
    path.resolve(process.cwd(), '..', '..', 'Downloads', 'fcirp', '.venv', 'bin', 'python'),
    process.env.FCIRP_PYTHON || '',
    'python3',
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (!candidate) continue;
    if (candidate === 'python3') {
      const result = spawnSync(candidate, ['-c', 'import joblib, lightgbm, pandas; print("ok")'], {
        encoding: 'utf-8',
      });
      if (result.status === 0) return candidate;
      continue;
    }

    if (existsSync(candidate)) {
      if (candidate.endsWith('.exe') || candidate.endsWith('.cmd')) {
        return candidate;
      }

      const result = spawnSync(candidate, ['-c', 'import joblib, lightgbm, pandas; print("ok")'], {
        encoding: 'utf-8',
      });
      if (result.status === 0) return candidate;
    }
  }

  return null;
}

function riskBand(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (score >= 0.8) return 'CRITICAL';
  if (score >= 0.6) return 'HIGH';
  if (score >= 0.35) return 'MEDIUM';
  return 'LOW';
}

export async function inferFcirpPriority(input: FcirpFeatureMap) {
  const normalized = normalizeFcirpFeatureMap(input);
  const pythonPath = resolveFcirpPython();
  const modelPath = resolveFcirpModelPath();

  if (!pythonPath || !modelPath) {
    const heuristicScore = Math.min(
      1,
      Math.max(
        0,
        (normalized.n_hits * 0.05 +
          normalized.n_typologies * 0.04 +
          normalized.acct_temporal_cycles * 0.12 +
          normalized.acct_ins_access_to_txn_h * 0.02 +
          normalized.emp_oop_ratio * 0.2 +
          normalized.has_insider * 0.14 +
          normalized.acct_pagerank * 0.3) /
          1.25
      )
    );

    return {
      priorityScore: Number(heuristicScore.toFixed(4)),
      riskBand: riskBand(heuristicScore),
      features: normalized,
      metadata: getFcirpModelMetadata(),
      modelFallback: true,
      modelUnavailableReason: !pythonPath ? 'No FCIRP Python runtime found for LightGBM inference.' : 'FCIRP model artifact could not be located.',
    };
  }

  const script = `
import json
import sys
import joblib
import pandas as pd

payload = json.loads(sys.argv[1])
model_path = payload.get('modelPath')
if not model_path:
    raise ValueError('FCIRP model path is required for inference')
art = joblib.load(model_path)
features = art['features']
row = {k: float(payload['features'].get(k, 0.0)) for k in features}
X = pd.DataFrame([row], columns=features)
score = float(art['model'].predict_proba(X)[:, 1][0])
print(json.dumps({"priorityScore": round(score, 4), "riskBand": ("CRITICAL" if score >= 0.8 else "HIGH" if score >= 0.6 else "MEDIUM" if score >= 0.35 else "LOW")}, separators=(',', ':')))
`;

  const result = spawnSync(pythonPath, ['-c', script, JSON.stringify({ modelPath, features: normalized })], {
    encoding: 'utf-8',
    maxBuffer: 10 * 1024 * 1024,
  });

  if (result.status !== 0) {
    const message = result.stderr?.trim() || result.stdout?.trim() || 'FCIRP inference failed';
    throw new Error(message);
  }

  const parsed = JSON.parse(result.stdout.trim());

  return {
    priorityScore: Number(parsed.priorityScore),
    riskBand: parsed.riskBand,
    features: normalized,
    metadata: getFcirpModelMetadata(),
    modelFallback: false,
  };
}
