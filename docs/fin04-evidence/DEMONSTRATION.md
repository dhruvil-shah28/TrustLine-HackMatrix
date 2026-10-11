# FIN 04 final demonstration guide

## Required scenarios

1. Legitimate look-alike: `scripts/test-hidden-link-hunter.ts`
2. Coordinated suspicious activity: `scripts/test-attack-dna.ts`
3. Late-linking evidence: `scripts/test-attack-dna.ts` (late event test)
4. Duplicate delivery: `scripts/test-attack-dna.ts` and `scripts/test-behavioural-drift.ts`
5. Case revision history: `scripts/test-attack-dna.ts` and `scripts/test-behavioural-drift.ts`
6. FCIRP inference: `scripts/test-fcirp-integration.ts`

## Commands to reproduce

```bash
cd $TRUSTLINE_ROOT
npx prisma generate
npx tsc --noEmit
npx tsx scripts/test-attack-dna.ts
npx tsx scripts/test-behavioural-drift.ts
npx tsx scripts/test-hidden-link-hunter.ts
npx tsx scripts/test-fcirp-integration.ts
```

## Real runtime evidence already observed

- Attack DNA: `Revision #9`, `Revision #13`, duplicate detection and replay validated.
- Behavioural drift: suspicious employee prioritized to `CRITICAL`; benign baseline remained `LOW`.
- Hidden link hunter: legitimate scenario `SCEN-007` preserved as non-suspicious.
- FCIRP adapter: returns `priorityScore: 0.9995`, `riskBand: CRITICAL`, `featureCount: 37`.

## External FCIRP model verification

```bash
cd $FCIRP_ROOT
$TRUSTLINE_ROOT/.venv-fcirp/bin/python - <<'PY'
import os, joblib, pandas as pd
p = os.environ["FCIRP_MODEL_PATH"]
art = joblib.load(p)
feat = {k: 0.0 for k in art['features']}
feat['n_hits'] = 4
feat['n_typologies'] = 2
feat['n_layers'] = 2
feat['has_insider'] = 1
feat['has_financial'] = 1
feat['has_connection'] = 1
feat['has_link'] = 1
feat['min_link_gap_h'] = 6
feat['max_sev'] = 3
feat['n_accounts'] = 3
feat['n_employees'] = 2
feat['n_txns'] = 6
feat['n_events'] = 8
feat['log_total_amount'] = 11.5
feat['span_h'] = 18
feat['log_amount_per_hour'] = 3.2
feat['recurring_periods'] = 2
feat['acct_recurring_amt'] = 0.62
feat['acct_passthrough'] = 0.21
feat['acct_burst'] = 0.44
feat['acct_idle_days'] = 4
feat['acct_vol_income'] = 2.8
feat['acct_pagerank'] = 0.38
feat['acct_comm_size'] = 2
feat['acct_temporal_cycles'] = 1
feat['acct_cycle_min_span_h'] = 20
feat['acct_in_out_lag_h'] = 6
feat['acct_ins_access_to_txn_h'] = 4
feat['acct_gap_cv'] = 0.31
feat['acct_repeat_cp'] = 0.28
feat['emp_offhours_ratio'] = 0.5
feat['emp_oop_ratio'] = 0.34
feat['emp_log_views'] = 3.4
feat['frac_events_offhours'] = 0.42
feat['frac_events_oop'] = 0.27
feat['n_accounts_accessed'] = 3
feat['ev_per_account'] = 2.4
row = pd.DataFrame([feat], columns=art['features'])
score = float(art['model'].predict_proba(row)[:, 1][0])
print('REAL_SCORE', score)
PY
```

Observed real output: `REAL_SCORE 0.9995321475417952`.
