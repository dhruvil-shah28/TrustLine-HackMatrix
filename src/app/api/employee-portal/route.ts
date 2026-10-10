import { NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { prisma } from '@/lib/prisma';
import {
  getCurrentEmployee,
  resolveApplicationRole,
} from '@/lib/employee-auth';

export const runtime = 'nodejs';

async function authorizeEmployee() {
  const employee = await getCurrentEmployee();

  if (!employee) {
    return {
      employee: null,
      response: NextResponse.json(
        { error: 'Please sign in again.' },
        { status: 401 },
      ),
    };
  }

  if (resolveApplicationRole(employee) !== 'EMPLOYEE') {
    return {
      employee: null,
      response: NextResponse.json(
        { error: 'This endpoint is reserved for employee-portal accounts.' },
        { status: 403 },
      ),
    };
  }

  return { employee, response: null };
}

export async function GET() {
  try {
    const auth = await authorizeEmployee();
    if (!auth.employee) return auth.response;

    const [customers, recentActions] = await Promise.all([
      prisma.customer.findMany({
        select: {
          id: true,
          customerCode: true,
          name: true,
          type: true,
          kycStatus: true,
          accounts: {
            select: {
              id: true,
              accountNumber: true,
              accountType: true,
              balance: true,
              currency: true,
              status: true,
            },
            orderBy: { accountNumber: 'asc' },
          },
        },
        orderBy: { customerCode: 'asc' },
      }),
      prisma.employeeAction.findMany({
        where: { employeeId: auth.employee.id },
        select: {
          id: true,
          actionType: true,
          targetType: true,
          targetId: true,
          detailsJson: true,
          timestamp: true,
        },
        orderBy: { timestamp: 'desc' },
        take: 12,
      }),
    ]);

    return NextResponse.json({
      employee: {
        employeeCode: auth.employee.employeeCode,
        name: auth.employee.name,
        role: auth.employee.role,
        department: auth.employee.department,
      },
      customers,
      recentActions,
    }, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('Employee portal load failed:', error);
    return NextResponse.json(
      { error: 'Unable to load the employee workspace.' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await authorizeEmployee();
    if (!auth.employee) return auth.response;

    const body = await request.json();
    const action = typeof body.action === 'string' ? body.action : '';
    const customerCode = typeof body.customerCode === 'string'
      ? body.customerCode.trim()
      : '';
    const accountNumber = typeof body.accountNumber === 'string'
      ? body.accountNumber.trim()
      : '';

    if (!customerCode || !accountNumber) {
      return NextResponse.json(
        { error: 'Choose a customer and account.' },
        { status: 400 },
      );
    }

    const customer = await prisma.customer.findUnique({
      where: { customerCode },
      include: { accounts: true },
    });
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found.' },
        { status: 404 },
      );
    }

    const sourceAccount = customer.accounts.find(
      (account) => account.accountNumber === accountNumber,
    );
    if (!sourceAccount || sourceAccount.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'The selected account is unavailable.' },
        { status: 400 },
      );
    }

    if (action === 'access') {
      await prisma.accessEvent.create({
        data: {
          employeeId: auth.employee.id,
          entityType: 'CUSTOMER',
          entityId: customer.id,
          accessType: 'VIEW',
        },
      });

      return NextResponse.json({
        message: 'Customer profile opened successfully.',
        customerCode,
        accountNumber,
      });
    }

    if (action === 'beneficiary') {
      const beneficiaryName = typeof body.beneficiaryName === 'string'
        ? body.beneficiaryName.trim()
        : '';
      const beneficiaryAccountNumber =
        typeof body.beneficiaryAccountNumber === 'string'
          ? body.beneficiaryAccountNumber.trim()
          : '';

      if (
        beneficiaryName.length < 2 ||
        beneficiaryName.length > 120 ||
        !beneficiaryAccountNumber ||
        beneficiaryAccountNumber === sourceAccount.accountNumber
      ) {
        return NextResponse.json(
          { error: 'Enter a valid beneficiary and a different destination account.' },
          { status: 400 },
        );
      }

      const destination = await prisma.account.findUnique({
        where: { accountNumber: beneficiaryAccountNumber },
      });

      if (!destination || destination.status !== 'ACTIVE') {
        return NextResponse.json(
          { error: 'Choose an active synthetic destination account.' },
          { status: 400 },
        );
      }

      await prisma.accessEvent.create({
        data: {
          employeeId: auth.employee.id,
          entityType: 'ACCOUNT',
          entityId: sourceAccount.id,
          accessType: 'BENEFICIARY_UPDATE',
        },
      });

      await prisma.employeeAction.create({
        data: {
          employeeId: auth.employee.id,
          actionType: 'BENEFICIARY_CHANGE',
          targetType: 'ACCOUNT',
          targetId: sourceAccount.id,
          detailsJson: JSON.stringify({
            demoMode: true,
            customerCode,
            accountNumber: sourceAccount.accountNumber,
            beneficiaryName,
            beneficiaryAccountNumber: destination.accountNumber,
            beneficiaryCustomerId: destination.customerId,
          }),
        },
      });

      return NextResponse.json({
        message: 'Beneficiary updated successfully.',
        simulated: true,
      });
    }

    if (action === 'transfer') {
      const destinationAccountNumber =
        typeof body.destinationAccountNumber === 'string'
          ? body.destinationAccountNumber.trim()
          : '';
      const amount = Number(body.amount);

      if (
        !Number.isFinite(amount) ||
        amount <= 0 ||
        amount > sourceAccount.balance ||
        amount > 20000000
      ) {
        return NextResponse.json(
          { error: 'Enter a positive amount within the displayed account balance and demo limit.' },
          { status: 400 },
        );
      }

      if (!destinationAccountNumber ||
          destinationAccountNumber === sourceAccount.accountNumber) {
        return NextResponse.json(
          { error: 'Choose a different destination account.' },
          { status: 400 },
        );
      }

      const destination = await prisma.account.findUnique({
        where: { accountNumber: destinationAccountNumber },
      });

      if (!destination || destination.status !== 'ACTIVE') {
        return NextResponse.json(
          { error: 'Destination account not found or inactive.' },
          { status: 400 },
        );
      }

      const recentChange = await prisma.employeeAction.findFirst({
        where: {
          employeeId: auth.employee.id,
          actionType: 'BENEFICIARY_CHANGE',
          targetType: 'ACCOUNT',
          targetId: sourceAccount.id,
        },
        orderBy: { timestamp: 'desc' },
      });

      let beneficiaryMatches = false;
      if (recentChange?.detailsJson) {
        try {
          const details = JSON.parse(recentChange.detailsJson);
          beneficiaryMatches =
            details.beneficiaryAccountNumber === destination.accountNumber;
        } catch {
          beneficiaryMatches = false;
        }
      }

      if (!beneficiaryMatches) {
        return NextResponse.json(
          { error: 'For this demo, record a beneficiary change for this source account and destination before simulating the transfer.' },
          { status: 409 },
        );
      }

      const txHash = `TXN-DEMO-${Date.now()}-${randomBytes(3).toString('hex').toUpperCase()}`;

      const transaction = await prisma.transaction.create({
        data: {
          txHash,
          sourceAccountId: sourceAccount.id,
          destinationAccountId: destination.id,
          amount,
          currency: sourceAccount.currency,
          channel: 'INSIDER_PORTAL',
          status: 'SIMULATED',
          initiatedByEmployeeId: auth.employee.id,
          flagsJson: JSON.stringify([
            'SIMULATED_DEMO',
            'BENEFICIARY_CHANGE',
            'EMPLOYEE_PORTAL_ACTIVITY',
          ]),
        },
      });

      await prisma.accessEvent.create({
        data: {
          employeeId: auth.employee.id,
          entityType: 'ACCOUNT',
          entityId: sourceAccount.id,
          accessType: 'TRANSFER_SIMULATED',
        },
      });

      await prisma.employeeAction.create({
        data: {
          employeeId: auth.employee.id,
          actionType: 'SIMULATED_TRANSFER',
          targetType: 'ACCOUNT',
          targetId: sourceAccount.id,
          detailsJson: JSON.stringify({
            demoMode: true,
            transactionId: transaction.id,
            txHash,
            destinationAccountNumber: destination.accountNumber,
            amount,
            currency: sourceAccount.currency,
            balanceChanged: false,
          }),
        },
      });

      const alert = await prisma.alert.create({
        data: {
          alertCode: `TL-INS-${Date.now()}-${randomBytes(2).toString('hex').toUpperCase()}`,
          title: 'Insider Risk: Beneficiary Change Followed by Transfer',
          severity: amount >= 1000000 ? 'CRITICAL' : amount >= 500000 ? 'HIGH' : 'MEDIUM',
          confidence: 'HIGH',
          financialExposure: amount,
          primaryEntityId: transaction.id,
          primaryEntityType: 'TRANSACTION',
          summary: `${auth.employee.name} performed a simulated transfer of ${sourceAccount.currency} ${amount.toLocaleString('en-IN')} after changing a beneficiary on account ${sourceAccount.accountNumber}. No funds were moved.`,
          riskExplanation: 'Correlated employee access, beneficiary modification, and transfer-initiation events were recorded in the demo environment. The amount and event sequence are risk signals for investigator review, not proof of misconduct.',
          detectionMethod: 'INSIDER_TIMELINE',
          scenarioName: 'Employee Portal Insider Simulation',
          signals: {
            create: [
              {
                type: 'INSIDER_ACCESS',
                title: 'Employee accessed the source account',
                description: 'The authenticated employee accessed a customer account before initiating a simulated transfer.',
                observedValue: `${auth.employee.employeeCode} / ${sourceAccount.accountNumber}`,
                expectedValue: 'Access and activity should align with assigned duties.',
                weight: 1.2,
                evidenceCategory: 'PRIVILEGE',
              },
              {
                type: 'BENEFICIARY_CHANGE',
                title: 'Beneficiary changed before transfer',
                description: 'A recorded beneficiary-change action matches the simulated transfer destination.',
                observedValue: destination.accountNumber,
                expectedValue: 'Beneficiary changes should be independently verified and audited.',
                weight: 1.8,
                evidenceCategory: 'TIMELINE',
              },
              {
                type: 'HIGH_VALUE_TRANSFER',
                title: 'Simulated transfer initiated',
                description: 'The transfer is a demo record used to demonstrate an insider-risk detection workflow. No account balances were changed.',
                observedValue: `${sourceAccount.currency} ${amount.toLocaleString('en-IN')}`,
                expectedValue: 'High-value activity should be reviewed under applicable controls.',
                weight: amount >= 1000000 ? 2.0 : 1.0,
                evidenceCategory: 'TRANSACTION',
              },
            ],
          },
        },
      });

      return NextResponse.json({
        message: 'Transfer submitted successfully.',
      }, { status: 201 });
    }

    return NextResponse.json(
      { error: 'Unsupported employee-portal action.' },
      { status: 400 },
    );
  } catch (error) {
    console.error('Employee portal action failed:', error);
    return NextResponse.json(
      { error: 'Unable to complete that demo action.' },
      { status: 500 },
    );
  }
}
