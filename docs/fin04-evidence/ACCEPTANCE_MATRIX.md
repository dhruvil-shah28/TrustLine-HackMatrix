# FIN 04 Acceptance Matrix

This matrix records the status of the TrustLine FIN 04 implementation as checked in the current repository state and runtime outputs.

## Summary

- Addition 1: PASS
- Addition 2: PARTIAL
- FCIRP real model inference: PASS
- Faithful graph/temporal feature reconstruction in TrustLine: PARTIAL
- Final evidence pack: CREATED

## Acceptance Matrix

| Requirement | Source / implementation | Evidence | Status |
| --- | --- | --- | --- |
| Stable event IDs and idempotent ingestion | `src/lib/attack-dna.ts` (`ingestIncrementalEvent`) | `scripts/test-attack-dna.ts` and `scripts/test-behavioural-drift.ts` both observed `DUPLICATE_IGNORED` on duplicate delivery | PASS |
| Separate occurrence and arrival timestamps | `prisma/schema.prisma` (`IngestedEvent` model) | `eventTimestamp` and `arrivalTimestamp` are persisted and used in ingest logic | PASS |
| Connected investigation updates | `src/lib/attack-dna.ts` | Revisions are created and case evidence is written for new events | PASS |
| Case revision history | `prisma/schema.prisma` (`CaseRevision`) and `src/lib/attack-dna.ts` | `Revision #9`, `Revision #13`, etc. created in live runs | PASS |
| Deterministic replay / normalized state equivalence | `scripts/test-attack-dna.ts` | Replay logic validated with event ordering changes and equivalent final state | PASS |
| Real FCIRP LightGBM inference | `src/lib/fcirp-integration.ts` and external artifact `$FCIRP_ROOT/models/case_priority.pkl` | `npx tsx scripts/test-fcirp-integration.ts` returned `priorityScore: 0.9995`; Python loader returned `REAL_SCORE 0.9995321475417952` | PASS |
| 37-feature contract | `src/lib/fcirp-integration.ts` (`FCIRP_FEATURES`) | `featureCount: 37` in script output; artifact features count also 37 | PASS |
| Faithful original FCIRP graph/temporal feature reconstruction | `src/lib/fcirp-integration.ts` + external `ml/features.py` | TrustLine mapper uses heuristics, not the original graph/temporal pipeline, so exact provenance is not yet established end-to-end | PARTIAL |
| Real model output connected to investigation priority | `src/app/api/behavioural-drift/route.ts` | API returns `fcirpPrediction` alongside the rule-based result | PARTIAL |
| Legitimate look-alike controls | `scripts/test-hidden-link-hunter.ts` | Legitimate payroll scenario `SCEN-007` preserved as `isSuspicious=false` | PASS |
| Rule baseline comparison | external FCIRP metrics JSON | Actual metric file `data/processed/metrics_case_model.json` records the rule and learned results | PASS |
| Held-out evaluation with later unseen cases | external FCIRP code and metric file | `protocol` specifies train on days 10-54 and test on days 62-79; entities disjoint | PASS |
| Final evidence pack | `docs/fin04-evidence/` | Files created in this directory | PASS |

## Final outcome

The repository satisfies the Addition 1 implementation and the live external FCIRP model path. The remaining gap is not the model availability or schema contract; it is end-to-end TrustLine feature provenance. The current TrustLine adapter matches the model schema, but its values are still approximations rather than the original FCIRP graph-temporal feature-engineering logic.
