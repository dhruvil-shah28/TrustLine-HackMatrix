import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as alertsRoute from '../src/app/api/alerts/route';
import * as casesRoute from '../src/app/api/cases/route';
import * as graphRoute from '../src/app/api/graph/route';
import * as ingestRoute from '../src/app/api/events/ingest/route';
import * as reconstructRoute from '../src/app/api/alerts/[id]/reconstruct/route';

const investigator = {
  id: 'emp-investigator',
  employeeCode: 'EMP-1001',
  name: 'Asha Mehta',
  email: 'asha@trustline.in',
  role: 'INVESTIGATOR',
  department: 'Financial Crime',
  privilegeLevel: 'STANDARD',
  status: 'ACTIVE',
};

const admin = {
  ...investigator,
  id: 'emp-admin',
  employeeCode: 'EMP-9001',
  name: 'Nikhil Rao',
  role: 'ADMIN',
  privilegeLevel: 'ADMIN',
};

const employee = {
  ...investigator,
  id: 'emp-portal',
  employeeCode: 'EMP-2002',
  name: 'Rohit Nair',
  role: 'TELLER',
  privilegeLevel: 'STANDARD',
};

describe('server-side authorization for investigator APIs', () => {
  it('rejects unauthenticated access', async () => {
    const result = await alertsRoute.requireAlertAccess(
      ['INVESTIGATOR', 'COMPLIANCE', 'RISK_ANALYST', 'ADMIN'],
      'list',
      async () => null,
    );

    assert.equal(result.employee, null);
    assert.equal(result.response?.status, 401);
  });

  it('rejects employee-role access to investigator endpoints', async () => {
    const result = await casesRoute.requireCaseAccess(
      ['INVESTIGATOR', 'COMPLIANCE', 'RISK_ANALYST', 'ADMIN'],
      'list',
      async () => employee,
    );

    assert.equal(result.employee, null);
    assert.equal(result.response?.status, 403);
  });

  it('allows investigator and admin roles for investigator-only routes', async () => {
    const investigatorResult = await graphRoute.requireGraphAccess(
      ['INVESTIGATOR', 'COMPLIANCE', 'RISK_ANALYST', 'ADMIN'],
      'list',
      async () => investigator,
    );

    assert.equal(investigatorResult.response, null);
    assert.equal(investigatorResult.employee?.employeeCode, 'EMP-1001');

    const adminResult = await ingestRoute.requireIngestionAccess(
      ['INVESTIGATOR', 'RISK_ANALYST', 'ADMIN'],
      'ingest',
      async () => admin,
    );

    assert.equal(adminResult.response, null);
    assert.equal(adminResult.employee?.privilegeLevel, 'ADMIN');

    const reconstructResult = await reconstructRoute.requireReconstructionAccess(
      ['INVESTIGATOR', 'RISK_ANALYST', 'ADMIN'],
      'reconstruct',
      async () => admin,
    );

    assert.equal(reconstructResult.response, null);
    assert.equal(reconstructResult.employee?.role, 'ADMIN');
  });
});
