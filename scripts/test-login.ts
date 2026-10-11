import { PrismaClient } from '@prisma/client';

const TEST_BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('--- Running Login Tests ---');
  let passed = true;

  try {
    // 1. Employee Login Success
    const empRes = await fetch(`${TEST_BASE_URL}/api/auth/employee/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeCode: 'EMP-1001', password: 'TL-Employee#2026' }),
    });
    if (empRes.ok) {
      console.log('✅ Employee login success (EMP-1001)');
    } else {
      console.error('❌ Employee login failed', await empRes.text());
      passed = false;
    }

    // 2. Investigator Login Success
    const invRes = await fetch(`${TEST_BASE_URL}/api/auth/investigator`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'd.patel@apexbank.com', password: 'TL-Employee#2026' }),
    });
    if (invRes.ok) {
      console.log('✅ Investigator login success (d.patel@apexbank.com)');
    } else {
      console.error('❌ Investigator login failed', await invRes.text());
      passed = false;
    }

    // 3. Unknown ID
    const failedIdRes = await fetch(`${TEST_BASE_URL}/api/auth/employee/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeCode: 'EMP-9999', password: 'TL-Employee#2026' }),
    });
    const failedIdData = await failedIdRes.json();
    if (failedIdRes.status === 401 && failedIdData.error === 'Invalid employee ID or password.') {
      console.log('✅ Generic error for unknown ID works correctly');
    } else {
      console.error('❌ Unknown ID test failed or returned non-generic error', failedIdData);
      passed = false;
    }

    // 4. Wrong password
    const failedPwdRes = await fetch(`${TEST_BASE_URL}/api/auth/employee/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeCode: 'EMP-1001', password: 'wrongpassword' }),
    });
    const failedPwdData = await failedPwdRes.json();
    if (failedPwdRes.status === 401 && failedPwdData.error === 'Invalid employee ID or password.') {
      console.log('✅ Generic error for wrong password works correctly');
    } else {
      console.error('❌ Wrong password test failed or returned non-generic error', failedPwdData);
      passed = false;
    }
  } catch (error) {
    console.error('❌ Exception during tests:', error);
    passed = false;
  }

  if (passed) {
    console.log('All tests passed successfully!');
    process.exit(0);
  } else {
    console.error('Some tests failed.');
    process.exit(1);
  }
}

runTests();
