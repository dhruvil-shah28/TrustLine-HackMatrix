# Labeling assumptions and split methodology

## Data source and assumptions

The external FCIRP project includes synthetic data generation and a labelled case dataset in the external `$FCIRP_ROOT` project. The model is trained on suspicious-case patterns plus legitimate look-alike scenarios.

The authoritative metadata file is:

- `$FCIRP_ROOT/data/processed/metrics_case_model.json`

This file records the train/test protocol:

- `train_cases: 125`
- `test_cases: 69`
- `test_suspicious: 45`
- `test_look_alikes: 24`
- `protocol`: "trained on cases from days 10-54, tested on unseen cases from days 62-79; entities disjoint"

## Label semantics

The FCIRP project labels candidate cases as:

- `1`: suspicious case overlap
- `0`: decoy / stray / look-alike scenario
- `-1`: excluded peripheral entities

This separation is established in `ml/case_model.py` (`label_candidates`). The feature matrix excludes the ground-truth labels from the model inputs.

## Legitimate look-alike scenarios

The project includes look-alikes such as:

- payroll scenarios
- routine commercial flows
- benign operational activity that resembles suspicious behavior superficially

The TrustLine repo confirms a legitimate control scenario is preserved as non-suspicious in `scripts/test-hidden-link-hunter.ts` (`SCEN-007`).

## Leakage-prevention checks

The authoritative code intentionally prevents leakage by:

- using temporal train/test cutoffs
- grouping by case/entity relationships
- keeping later unseen cases separate from training data
- not using mitigation variables or dismissed status in the model,
- evaluating on later event windows and separate scenarios

The current TrustLine integration does not yet fully mirror the same case-level feature-generation pipeline, so the TrustLine-side evidence is valid as a runtime wrapper but not as a complete reimplementation of the external benchmark pipeline.
