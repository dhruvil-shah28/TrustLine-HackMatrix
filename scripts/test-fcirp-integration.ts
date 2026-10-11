import { getFcirpModelMetadata, inferFcirpPriority } from '../src/lib/fcirp-integration';

async function main() {
  const result = await inferFcirpPriority({
    n_hits: 4,
    n_typologies: 2,
    n_layers: 2,
    has_insider: 1,
    has_financial: 1,
    has_connection: 1,
    has_link: 1,
    min_link_gap_h: 6,
    max_sev: 3,
    n_accounts: 3,
    n_employees: 2,
    n_txns: 6,
    n_events: 8,
    log_total_amount: 11.5,
    span_h: 18,
    log_amount_per_hour: 3.2,
    recurring_periods: 2,
    acct_recurring_amt: 0.62,
    acct_passthrough: 0.21,
    acct_burst: 0.44,
    acct_idle_days: 4,
    acct_vol_income: 2.8,
    acct_pagerank: 0.38,
    acct_comm_size: 2,
    acct_temporal_cycles: 1,
    acct_cycle_min_span_h: 20,
    acct_in_out_lag_h: 6,
    acct_ins_access_to_txn_h: 4,
    acct_gap_cv: 0.31,
    acct_repeat_cp: 0.28,
    emp_offhours_ratio: 0.5,
    emp_oop_ratio: 0.34,
    emp_log_views: 3.4,
    frac_events_offhours: 0.42,
    frac_events_oop: 0.27,
    n_accounts_accessed: 3,
    ev_per_account: 2.4,
  });

  console.log(JSON.stringify({
    modelName: getFcirpModelMetadata().modelName,
    priorityScore: result.priorityScore,
    riskBand: result.riskBand,
    featureCount: Object.keys(result.features).length,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
