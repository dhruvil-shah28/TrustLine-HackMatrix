# Held-out evaluation report

## Verification source

This report is based on the actual FCIRP project file:

- `$FCIRP_ROOT/data/processed/metrics_case_model.json`
- `$FCIRP_ROOT/ml/case_model.py`

## Verified dataset split

The metrics file confirms:

- train cases: 125
- test cases: 69
- suspicious test cases: 45
- look-alikes in test: 24
- protocol: train on earlier cases, evaluate on later unseen cases with disjoint entities

## Verified metrics

| Model / baseline | Precision | Recall | F1 | FPR | PR-AUC |
| --- | ---: | ---: | ---: | ---: | ---: |
| Raw rule detector | 0.652 | 1.000 | 0.789 | 1.000 | 0.652 |
| Rule detector + mitigation rules | 0.860 | 0.956 | 0.905 | 0.2917 | 0.851 |
| Learned priority (patterns only) | 1.000 | 0.978 | 0.989 | 0.000 | 1.000 |

## Key finding

The learned FCIRP model has zero false positives on the recorded holdout and a perfect PR-AUC in the reported benchmark, while the rule baseline still produces a larger false-positive rate.

## TrustLine-specific limitation

The repository does expose a live FCIRP adapter, but the TrustLine-side feature vector remains an approximation to the original graph-temporal feature function. Therefore the external benchmark is a valid artifact-level proof of the model’s learning quality, but it is not yet a fully end-to-end TrustLine dataset benchmark.
