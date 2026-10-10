/**
 * TRUSTLINE END-TO-END DEMO ACCOUNTS AUTHENTICATION SUITE
 */

import { prisma } from '../src/lib/prisma';
import { bootstrapDemoAccounts } from '../scripts/bootstrap-demo-accounts';
import { verifyEmployeeSession } from '../src/lib/employee-session';

async function runEndToEndVerification() {
  console.log('================================================================');
  console.log('🧪 TRUSTLINE END-TO-END DEMO ACCOUNTS VERIFICATION SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    total++;
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName}${detail ? ` - ${detail}` : ''}`);
    }
  }

  // Step 1: Run Idempotent Bootstrap
  console.log('--- Step 1: Execute Demo Account Bootstrap ---');
  await bootstrapDemoAccounts();

  // Step 2: Database Record Verification
  console.log('\n--- Step 2: Database Record & Password Hash Verification ---');
  const emp = await prisma.employee.findUnique({ where: { employeeCode: 'EMP-1001' } });
  assert(!!emp, 'Employee EMP-1001 exists in database');
  assert(!!emp?.passwordHash && emp.passwordHash.startsWith('scrypt:'), 'Employee EMP-1001 has valid scrypt password hash');

  const invEmp = await prisma.employee.findUnique({ where: { employeeCode: 'EMP-INVESTIGATOR-01' } });
  assert(!!invEmp, 'Investigator account EMP-INVESTIGATOR-01 exists in database');
  assert(!!invEmp?.passwordHash && invEmp.passwordHash.startsWith('scrypt:'), 'Investigator has valid scrypt password hash');
  assert(emp?.passwordHash !== invEmp?.passwordHash, 'Employee and Investigator have distinct password hashes');

  // Step 3: Investigator Authentication API Test
  console.log('\n--- Step 3: Investigator Sign In API (TL-Investigator#2026) ---');
  const invLoginRes = await fetch('http://localhost:3000/api/auth/investigator', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'rahul.sharma@trustline.in',
      password: 'TL-Investigator#2026',
    }),
  });

  const invData = await invLoginRes.json();
  assert(invLoginRes.status === 200, `Investigator Login HTTP 200 OK (Got ${invLoginRes.status})`);
  assert(invData.redirectTo === '/', `Investigator Redirect URL is '/' (Got '${invData.redirectTo}')`);
  assert(invData.user?.role === 'INVESTIGATOR', 'Returned user role is INVESTIGATOR');

  const invCookieHeader = invLoginRes.headers.get('set-cookie');
  assert(!!invCookieHeader && invCookieHeader.includes('trustline_employee='), 'Investigator session cookie created');

  // Step 4: Employee Authentication API Test
  console.log('\n--- Step 4: Employee Sign In API (TL-Employee#2026) ---');
  const empLoginRes = await fetch('http://localhost:3000/api/auth/employee/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      employeeCode: 'EMP-1001',
      password: 'TL-Employee#2026',
    }),
  });

  const empData = await empLoginRes.json();
  assert(empLoginRes.status === 200, `Employee Login HTTP 200 OK (Got ${empLoginRes.status})`);
  assert(empData.employee?.employeeCode === 'EMP-1001', 'Returned employeeCode is EMP-1001');

  const empCookieHeader = empLoginRes.headers.get('set-cookie');
  assert(!!empCookieHeader && empCookieHeader.includes('trustline_employee='), 'Employee session cookie created');

  // Step 5: Cross-Account Password Isolation Security Test
  console.log('\n--- Step 5: Password Isolation Security Verification ---');
  const crossRes1 = await fetch('http://localhost:3000/api/auth/employee/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      employeeCode: 'EMP-1001',
      password: 'TL-Investigator#2026', // Trying investigator password on employee account
    }),
  });
  assert(crossRes1.status === 401, 'Employee sign in with Investigator password rejected with HTTP 401');

  const crossRes2 = await fetch('http://localhost:3000/api/auth/investigator', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'rahul.sharma@trustline.in',
      password: 'TL-Employee#2026', // Trying employee password on investigator account
    }),
  });
  assert(crossRes2.status === 401, 'Investigator sign in with Employee password rejected with HTTP 401');

  // Step 6: Session Endpoint Role Resolution Test
  console.log('\n--- Step 6: Session Endpoint & Workspace Role Resolution ---');
  const invSessionCookie = invCookieHeader?.split(';')[0] || '';
  const invSessionRes = await fetch('http://localhost:3000/api/auth/employee/session', {
    headers: { Cookie: invSessionCookie },
  });
  const invSessionData = await invSessionRes.json();
  assert(invSessionData.employee?.mappedRole === 'INVESTIGATOR', 'Investigator session maps to INVESTIGATOR role');

  const empSessionCookie = empCookieHeader?.split(';')[0] || '';
  const empSessionRes = await fetch('http://localhost:3000/api/auth/employee/session', {
    headers: { Cookie: empSessionCookie },
  });
  const empSessionData = await empSessionRes.json();
  assert(empSessionData.employee?.mappedRole === 'EMPLOYEE', 'Employee session maps to EMPLOYEE role');

  console.log('\n================================================================');
  console.log(`  VERIFICATION RESULTS: ${passed} / ${total} Passed (${((passed / total) * 100).toFixed(0)}%)`);
  console.log('================================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runEndToEndVerification()
  .catch((e) => {
    console.error('Verification crashed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
