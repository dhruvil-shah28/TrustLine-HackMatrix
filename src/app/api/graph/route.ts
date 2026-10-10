import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MoneyFlowNode, MoneyFlowEdge } from '@/lib/types';
import { getCurrentEmployee, resolveApplicationRole } from '@/lib/employee-auth';
import type { UserRole } from '@/lib/types';

// Least privilege policy:
// - GET /api/graph: INVESTIGATOR, COMPLIANCE, RISK_ANALYST, ADMIN
export async function requireGraphAccess(
  allowedRoles: UserRole[],
  operation: 'list',
  currentEmployeeFetcher: typeof getCurrentEmployee = getCurrentEmployee,
) {
  const employee = await currentEmployeeFetcher();

  if (!employee) {
    return {
      employee: null,
      response: NextResponse.json(
        { error: 'Authentication required.' },
        { status: 401 },
      ),
    };
  }

  const role = resolveApplicationRole(employee);
  if (!allowedRoles.includes(role)) {
    return {
      employee: null,
      response: NextResponse.json(
        { error: `Forbidden: ${operation} requires an investigator role.` },
        { status: 403 },
      ),
    };
  }

  return { employee, response: null };
}

export async function GET() {
  const auth = await requireGraphAccess(
    ['INVESTIGATOR', 'COMPLIANCE', 'RISK_ANALYST', 'ADMIN'],
    'list',
  );
  if (!auth.employee) return auth.response;

  try {
    const employees = await prisma.employee.findMany();
    const customers = await prisma.customer.findMany();
    const accounts = await prisma.account.findMany({ include: { customer: true } });
    const transactions = await prisma.transaction.findMany({
      include: {
        sourceAccount: true,
        destinationAccount: true,
        initiatedByEmployee: true,
        approvedByEmployee: true,
      },
      take: 40,
    });
    const accessEvents = await prisma.accessEvent.findMany({ take: 20 });
    const employeeActions = await prisma.employeeAction.findMany({ take: 20 });

    const nodes: MoneyFlowNode[] = [];
    const edges: MoneyFlowEdge[] = [];

    // Add Employees
    employees.forEach((emp) => {
      nodes.push({
        id: `EMP-${emp.id}`,
        label: emp.name,
        type: 'EMPLOYEE',
        details: {
          subText: `${emp.role} (${emp.department})`,
          riskScore: emp.riskScore,
          role: emp.role,
          privilege: emp.privilegeLevel,
        },
        isSuspicious: emp.riskScore > 65,
      });
    });

    // Add Customers
    customers.forEach((cust) => {
      nodes.push({
        id: `CUST-${cust.id}`,
        label: cust.name,
        type: 'CUSTOMER',
        details: {
          subText: `${cust.type} | Risk: ${cust.riskProfile}`,
          customerType: cust.type,
        },
        isSuspicious: cust.riskProfile === 'HIGH',
      });
    });

    // Add Accounts & OWNS Edges
    accounts.forEach((acc) => {
      nodes.push({
        id: `ACC-${acc.id}`,
        label: acc.accountNumber,
        type: 'ACCOUNT',
        details: {
          subText: `${acc.accountType} | Balance: ₹${(acc.balance / 100000).toFixed(2)}L`,
          accountNumber: acc.accountNumber,
          balance: acc.balance,
        },
        isSuspicious: acc.accountNumber.includes('1001') || acc.accountNumber.includes('1006'),
      });

      edges.push({
        id: `edge-owns-${acc.id}`,
        source: `CUST-${acc.customerId}`,
        target: `ACC-${acc.id}`,
        label: 'OWNS',
      });
    });

    // Add Transactions & TRANSFERRED_TO / INITIATED / APPROVED Edges
    const suspiciousTxHashes = ['TXN-CIRC-001', 'TXN-CIRC-002', 'TXN-CIRC-003', 'TXN-SPLIT-001', 'TXN-SPLIT-002', 'TXN-SPLIT-003'];

    transactions.forEach((tx) => {
      const isSuspicious = suspiciousTxHashes.includes(tx.txHash);

      edges.push({
        id: `edge-tx-${tx.id}`,
        source: `ACC-${tx.sourceAccountId}`,
        target: `ACC-${tx.destinationAccountId}`,
        label: 'TRANSFERRED_TO',
        amount: tx.amount,
        isSuspicious,
        timestamp: tx.timestamp.toISOString(),
      });

      if (tx.initiatedByEmployeeId) {
        edges.push({
          id: `edge-init-${tx.id}`,
          source: `EMP-${tx.initiatedByEmployeeId}`,
          target: `ACC-${tx.sourceAccountId}`,
          label: 'INITIATED',
          isSuspicious,
        });
      }

      if (tx.approvedByEmployeeId) {
        edges.push({
          id: `edge-appr-${tx.id}`,
          source: `EMP-${tx.approvedByEmployeeId}`,
          target: `ACC-${tx.destinationAccountId}`,
          label: 'APPROVED',
          isSuspicious,
        });
      }
    });

    // Add Access & Action Edges (ACCESSED, MODIFIED)
    accessEvents.forEach((ev) => {
      const isTargetAccount = ev.entityType === 'ACCOUNT';
      const targetPrefix = isTargetAccount ? 'ACC-' : 'CUST-';
      edges.push({
        id: `edge-access-${ev.id}`,
        source: `EMP-${ev.employeeId}`,
        target: `${targetPrefix}${ev.entityId}`,
        label: 'ACCESSED',
        isSuspicious: true,
      });
    });

    employeeActions.forEach((act) => {
      edges.push({
        id: `edge-action-${act.id}`,
        source: `EMP-${act.employeeId}`,
        target: `ACC-${act.targetId}`,
        label: 'MODIFIED',
        isSuspicious: true,
      });
    });

    return NextResponse.json({ nodes, edges });
  } catch (error) {
    console.error('Error fetching graph data:', error);
    return NextResponse.json({ error: 'Failed to fetch graph network' }, { status: 500 });
  }
}
