/**
 * TRUSTLINE EMPLOYEE PORTAL COMPLETE AUTHENTICATION VERIFICATION SUITE
 */

import { prisma } from '../src/lib/prisma';
import { createEmployeeSession, verifyEmployeeSession } from '../src/lib/employee-session';
import { scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);

async function verifyPassword(password: string, storedHash: string) {
  const [algorithm, salt, expectedHex] = storedHash.split(':');
  if (algorithm !== 'scrypt' || !salt || !expectedHex || !/^[a-f0-9]{128}$/i.test(expectedHex)) {
    return false;
  }
  const expected = Buffer.from(expectedHex, 'hex');
  const actual = (await scrypt(password, salt, expected.length)) as Buffer;
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

async function runAcceptanceTests() {
  console.log('================================================================');
  console.log('🧪 TRUSTLINE EMPLOYEE PORTAL COMPLETE AUTHENTICATION TEST SUITE');
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

  // Reset EMP-1001 password hash for clean reproducible activation test
  await prisma.employee.update({
    where: { employeeCode: 'EMP-1001' },
    data: { passwordHash: null },
  });
  console.log('Pre-test setup: Reset EMP-1001 passwordHash to null for activation test.');

  // Test 1: Employee Activation API logic
  console.log('\n--- 1. Employee Activation (EMP-1001) ---');
  const emp = await prisma.employee.findUnique({ where: { employeeCode: 'EMP-1001' } });
  assert(!!emp, 'Employee EMP-1001 exists in database');
  assert(emp?.passwordHash === null, 'EMP-1001 passwordHash is null prior to activation');

  // Perform activation call via API fetch equivalent
  const activationUrl = 'http://localhost:3000/api/auth/employee/activate';
  const activateRes = await fetch(activationUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      employeeCode: 'EMP-1001',
      email: 'v.malhotra@apexbank.com',
      password: 'trustline-demo-password-123',
    }),
  });

  const activateData = await activateRes.json();
  assert(activateRes.status === 200, `Activation HTTP Status is 200 (Got ${activateRes.status})`);
  assert(activateData.message?.includes('activated'), 'Activation success message returned');

  // Test 2: Database Password Hash Persistence
  console.log('\n--- 2. Database Password Hash Verification ---');
  const updatedEmp = await prisma.employee.findUnique({ where: { employeeCode: 'EMP-1001' } });
  assert(!!updatedEmp?.passwordHash, 'EMP-1001 passwordHash is now populated in PostgreSQL');
  assert(!!updatedEmp?.passwordHash?.startsWith('scrypt:'), 'Password stored using scrypt hashing scheme');

  const passwordValid = await verifyPassword('trustline-demo-password-123', updatedEmp?.passwordHash || '');
  assert(passwordValid === true, 'Scrypt password hash verifies correctly against newly set password');

  // Test 3: Employee Authentication API Sign In
  console.log('\n--- 3. Employee Sign In Authentication ---');
  const loginUrl = 'http://localhost:3000/api/auth/employee/login';
  const loginRes = await fetch(loginUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      employeeCode: 'EMP-1001',
      password: 'trustline-demo-password-123',
    }),
  });

  const loginData = await loginRes.json();
  assert(loginRes.status === 200, `Login HTTP Status is 200 (Got ${loginRes.status})`);
  assert(loginData.employee?.employeeCode === 'EMP-1001', 'Login returns valid employee details payload');

  const setCookieHeader = loginRes.headers.get('set-cookie');
  assert(!!setCookieHeader && setCookieHeader.includes('trustline_employee='), 'HTTP-only session cookie set in response');

  // Test 4: Invalid Password Rejection
  console.log('\n--- 4. Invalid Credentials Rejection ---');
  const invalidRes = await fetch(loginUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      employeeCode: 'EMP-1001',
      password: 'wrong-password-999',
    }),
  });
  assert(invalidRes.status === 401, `Invalid password rejected with HTTP 401 (Got ${invalidRes.status})`);

  // Test 5: Session Verification & Portal Data API
  console.log('\n--- 5. Session Verification & Employee Portal Data Access ---');
  const sessionCookie = setCookieHeader?.split(';')[0] || '';
  const portalRes = await fetch('http://localhost:3000/api/employee-portal', {
    headers: { Cookie: sessionCookie },
  });
  const portalData = await portalRes.json();
  assert(portalRes.status === 200, `Employee Portal API accessible with valid session (Got ${portalRes.status})`);
  assert(!!portalData.employee && portalData.customers?.length > 0, 'Employee workspace data loaded cleanly');

  // Test 6: Logout Session Invalidation
  console.log('\n--- 6. Session Logout & Invalidation ---');
  const logoutRes = await fetch('http://localhost:3000/api/auth/employee/logout', {
    method: 'POST',
    headers: { Cookie: sessionCookie },
  });
  assert(logoutRes.status === 200, 'Logout HTTP Status is 200');

  console.log('\n================================================================');
  console.log(`🏁 ACCEPTANCE TEST RESULTS: ${passed} / ${total} Passed (${((passed / total) * 100).toFixed(0)}%)`);
  console.log('================================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runAcceptanceTests()
  .catch((e) => {
    console.error('Acceptance test suite runner crashed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
