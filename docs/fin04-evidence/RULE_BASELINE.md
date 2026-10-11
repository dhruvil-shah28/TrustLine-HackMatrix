# Rule baseline and FCIRP model comparison

## Actual rule baseline in the external FCIRP project

The FCIRP project records three rule-driven baselines in the evaluation file:

1. `Rule detector, raw (every correlated case alerts)`
2. `Rule detector + mitigation rules`
3. `Learned priority (patterns only, no mitigation info)`

The actual metrics are serialized in `$FCIRP_ROOT/data/processed/metrics_case_model.json`.

## Observed metrics

```json
{
  "Rule detector, raw (every correlated case alerts)": {
    "precision": 0.652,
    "recall": 1.0,
    "f1": 0.789,
    "fpr": 1.0,
    "pr_auc": 0.652,
    "flagged": 69,
    "decoy_fpr": 1.0
  },
  "Rule detector + mitigation rules": {
    "precision": 0.86,
    "recall": 0.956,
    "f1": 0.905,
    "fpr": 0.2917,
    "pr_auc": 0.851,
    "flagged": 50,
    "decoy_fpr": 0.292
  },
  "Learned priority (patterns only, no mitigation info)": {
    "precision": 1.0,
    "recall": 0.978,
    "f1": 0.989,
    "fpr": 0.0,
    "pr_auc": 1.0,
    "flagged": 44,
    "decoy_fpr": 0.0
  }
}
```

## Interpretation

The model materially outperforms the raw rule detector and also improves over a mitigation-aware rule baseline on the held-out suspicious-versus-look-alike assessment.

## TrustLine status

TrustLine exposes a rule-based behavioural-drift detector and an FCIRP prediction in `src/app/api/behavioural-drift/route.ts`, but it does not yet reproduce the full external holdout benchmark pipeline end-to-end from the actual TrustLine dataset.
