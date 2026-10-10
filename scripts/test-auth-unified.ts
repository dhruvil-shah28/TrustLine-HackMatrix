/**
 * TRUSTLINE UNIFIED AUTHENTICATION & AUTHORIZATION TEST SUITE
 */

import { prisma } from '../src/lib/prisma';
import { createEmployeeSession, verifyEmployeeSession } from '../src/lib/employee-session';

async function runAuthTests() {
  console.log('================================================================');
  console.log('🧪 TRUSTLINE UNIFIED AUTHENTICATION TEST SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}${detail ? ` - ${detail}` : ''}`);
    }
  }

  // 1. Session Token Minting and Cryptographic Verification
  console.log('--- 1. Session Token Signature & Expiry Verification ---');
  const token = createEmployeeSession('EMP-1001');
  assert(!!token && token.includes('.'), 'Session token generated with signature');

  const payload = verifyEmployeeSession(token);
  assert(payload?.employeeCode === 'EMP-1001', 'Session payload verified cleanly');

  const tamperedToken = token.slice(0, -5) + 'XXXXX';
  const invalidPayload = verifyEmployeeSession(tamperedToken);
  assert(invalidPayload === null, 'Tampered session token rejected');

  // 2. Employee Database Record Integrity
  console.log('\n--- 2. Employee Database Account Verification ---');
  const leadEmp = await prisma.employee.findUnique({ where: { employeeCode: 'EMP-1001' } });
  assert(!!leadEmp, 'Lead employee account EMP-1001 exists');
  assert(!!leadEmp?.passwordHash, 'Lead employee has scrypt-hashed password');

  // 3. Investigator Database Clearance
  console.log('\n--- 3. Investigator Role & Model Integrity ---');
  const investigatorEmps = await prisma.employee.findMany({
    where: {
      OR: [
        { privilegeLevel: 'ELEVATED' },
        { privilegeLevel: 'ADMIN' },
        { role: { contains: 'Investigator' } },
        { role: { contains: 'Relationship Manager' } },
      ],
    },
  });
  assert(investigatorEmps.length > 0, `Investigator-cleared employees found (${investigatorEmps.length} items)`);

  console.log('\n================================================================');
  console.log(`🏁 AUTHENTICATION TEST RESULTS: ${passed} / ${total} Passed (${((passed / total) * 100).toFixed(0)}%)`);
  console.log('================================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runAuthTests()
  .catch((e) => {
    console.error('Auth test crash:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
