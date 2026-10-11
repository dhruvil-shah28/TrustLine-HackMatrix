# FCIRP model and feature provenance

## Model identity and artifact

- Model artifact: `$FCIRP_ROOT/models/case_priority.pkl`
- Model type: LightGBM classifier
- Model package source: `$FCIRP_ROOT/ml/case_model.py`
- Model contract: `dict(model=<LightGBMClassifier>, features=FEATURES)`
- Runtime environment: `$TRUSTLINE_ROOT/.venv-fcirp/bin/python`

## Inference contract

The real FCIRP model produces a class-1 probability using:

- `art['model'].predict_proba(X)[:, 1]`
- raw score semantics: suspicious-case probability in `[0,1]`
- display semantics: the TrustLine UI should treat this as a probability-like score and convert it separately to a 0-100 or banded priority if needed

The TrustLine adapter in `src/lib/fcirp-integration.ts` preserves this by calling the real Python model when both runtime and artifact are available.

## 37-feature schema

The model contract currently used in the TrustLine adapter is:

1. `n_hits`
2. `n_typologies`
3. `n_layers`
4. `has_insider`
5. `has_financial`
6. `has_connection`
7. `has_link`
8. `min_link_gap_h`
9. `max_sev`
10. `n_accounts`
11. `n_employees`
12. `n_txns`
13. `n_events`
14. `log_total_amount`
15. `span_h`
16. `log_amount_per_hour`
17. `recurring_periods`
18. `acct_recurring_amt`
19. `acct_passthrough`
20. `acct_burst`
21. `acct_idle_days`
22. `acct_vol_income`
23. `acct_pagerank`
24. `acct_comm_size`
25. `acct_temporal_cycles`
26. `acct_cycle_min_span_h`
27. `acct_in_out_lag_h`
28. `acct_ins_access_to_txn_h`
29. `acct_gap_cv`
30. `acct_repeat_cp`
31. `emp_offhours_ratio`
32. `emp_oop_ratio`
33. `emp_log_views`
34. `frac_events_offhours`
35. `frac_events_oop`
36. `n_accounts_accessed`
37. `ev_per_account`

## Real feature provenance in the original FCIRP code

The authoritative feature engineering is in:

- `$FCIRP_ROOT/ml/features.py`
- `$FCIRP_ROOT/ml/case_model.py`

The real graph and temporal feature logic includes:

- PageRank on the transaction graph
- community size
- cycle count and temporal cycles
- time-based cycle span
- in/out lag between inflow and outflow
- insider access-to-transaction time
- irregularity of timing (`gap_cv`)
- repeated counterparty ratio
- out-of-hours and out-of-pattern ratios
- event counts per touched account

These are derived from a real candidate-case graph and event-sequence context, not from a simple approximation based on a behavioural-drift feature wrapper.

## Current TrustLine status

The TrustLine adapter matches the naming and count contract but the values are still approximated from behavioural-drift features. This means the API is valid but the feature provenance is not yet identical to the original FCIRP engineering logic.

## Score semantics

- The raw model output is a probability-like suspiciousness score.
- The UI may convert it to a 0-100 or decision band, but it must not be treated as a confirmed fraud determination.
- The model should be reported as an investigation-priority aid, not a finding of wrongdoing.
