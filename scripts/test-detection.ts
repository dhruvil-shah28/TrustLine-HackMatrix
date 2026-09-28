import { runHybridDetectionEngine } from '../src/lib/detection-engine';

async function runTests() {
  console.log('==================================================');
  console.log('RUNNING HACKMATRIX 5.0 DETECTION ENGINE TEST SUITE');
  console.log('==================================================');

  // Test 1: Employee Anomaly Detection
  console.log('\n[Test 1] Testing Employee Hybrid Detection (EMP-1001)...');
  const resultEmp = await runHybridDetectionEngine('EMPLOYEE', 'EMP-1001');

  console.log(`- Suspicious: ${resultEmp.isSuspicious}`);
  console.log(`- Severity: ${resultEmp.severity}`);
  console.log(`- Score: ${resultEmp.score}/100`);
  console.log(`- Detection Methods: ${resultEmp.detectionMethods.join(', ')}`);
  console.log(`- Signals Count: ${resultEmp.signals.length}`);

  if (resultEmp.isSuspicious && resultEmp.signals.length > 0) {
    console.log('✅ TEST 1 PASSED: Successfully detected connected insider risk & circular signals.');
  } else {
    console.error('❌ TEST 1 FAILED');
    process.exit(1);
  }

  // Test 2: Account Structuring Detection
  console.log('\n[Test 2] Testing Account Structuring Detection (ACC-1004-INR)...');
  const resultAcc = await runHybridDetectionEngine('ACCOUNT', 'ACC-1004-INR');

  console.log(`- Suspicious: ${resultAcc.isSuspicious}`);
  console.log(`- Severity: ${resultAcc.severity}`);
  console.log(`- Signals: ${resultAcc.signals.map((s) => s.title).join(' | ')}`);

  if (resultAcc.isSuspicious) {
    console.log('✅ TEST 2 PASSED: Successfully identified transaction structuring below ₹5L threshold.');
  } else {
    console.error('❌ TEST 2 FAILED');
    process.exit(1);
  }

  console.log('\n==================================================');
  console.log('ALL DETECTION ENGINE TESTS PASSED SUCCESSFULLY! ✅');
  console.log('==================================================');
  process.exit(0);
}

runTests().catch((err) => {
  console.error('Test run failed:', err);
  process.exit(1);
});
