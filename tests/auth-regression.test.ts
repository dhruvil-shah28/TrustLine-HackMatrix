import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { POST as employeeLogin } from '../src/app/api/auth/employee/login/route';
import { POST as investigatorLogin } from '../src/app/api/auth/investigator/route';
import { requireGraphAccess } from '../src/app/api/graph/route';
import { createEmployeeSession, verifyEmployeeSession } from '../src/lib/employee-session';

const validEmployee = {
  employeeCode: 'EMP-1001',
  password: 'TL-Employee#2026',
};

const validInvestigator = {
  employeeCode: 'EMP-INVESTIGATOR-01',
  email: 'rahul.sharma@trustline.in',
  password: 'TL-Investigator#2026',
};

const employeeProfile = {
  id: 'emp-portal',
  employeeCode: 'EMP-1001',
  name: 'Vikram Malhotra',
  email: 'v.malhotra@apexbank.com',
  role: 'Senior Relationship Manager',
  department: 'Wealth Management',
  privilegeLevel: 'ELEVATED',
  status: 'ACTIVE',
};

describe('TrustLine auth regression checks', () => {
  it('accepts a valid employee login and sets a signed session cookie', async () => {
    const response = await employeeLogin(
      new Request('https://example.com/api/auth/employee/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeCode: validEmployee.employeeCode,
          password: validEmployee.password,
        }),
      }),
    );

    assert.equal(response.status, 200);
    const header = response.headers.get('set-cookie') || '';
    assert.match(header, /trustline_employee=/);

    const payload = await response.json();
    assert.equal(payload.employee.employeeCode, validEmployee.employeeCode);
  });

  it('rejects an invalid employee password', async () => {
    const response = await employeeLogin(
      new Request('https://example.com/api/auth/employee/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeCode: validEmployee.employeeCode,
          password: 'wrong-password',
        }),
      }),
    );

    assert.equal(response.status, 401);
  });

  it('accepts a valid investigator login for a cleared account', async () => {
    const response = await investigatorLogin(
      new Request('https://example.com/api/auth/investigator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeCode: validInvestigator.employeeCode,
          email: validInvestigator.email,
          password: validInvestigator.password,
        }),
      }),
    );

    assert.equal(response.status, 200);
    const payload = await response.json();
    assert.equal(payload.user.email, validInvestigator.email);
    assert.equal(payload.redirectTo, '/dashboard');
  });

  it('rejects insufficient investigator clearance', async () => {
    const response = await investigatorLogin(
      new Request('https://example.com/api/auth/investigator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeCode: validEmployee.employeeCode,
          email: 'v.malhotra@apexbank.com',
          password: validEmployee.password,
        }),
      }),
    );

    assert.equal(response.status, 401);
  });

  it('rejects unknown employee accounts', async () => {
    const response = await employeeLogin(
      new Request('https://example.com/api/auth/employee/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeCode: 'EMP-0000',
          password: 'any-password',
        }),
      }),
    );

    assert.equal(response.status, 401);
  });

  it('rejects signed session tokens that are tampered with', () => {
    const validToken = createEmployeeSession('EMP-1001');
    assert.ok(verifyEmployeeSession(validToken));
    assert.equal(verifyEmployeeSession(`${validToken.split('.')[0]}.tampered`), null);
  });

  it('denies employee-role access to an investigator-only graph endpoint', async () => {
    const result = await requireGraphAccess(
      ['INVESTIGATOR', 'COMPLIANCE', 'RISK_ANALYST', 'ADMIN'],
      'list',
      async () => employeeProfile,
    );

    assert.equal(result.employee, null);
    assert.equal(result.response?.status, 403);
  });
});
