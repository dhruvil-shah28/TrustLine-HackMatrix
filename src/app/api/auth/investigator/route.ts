import { NextResponse } from 'next/server';
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { prisma } from '@/lib/prisma';
import { createEmployeeSession } from '@/lib/employee-session';

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

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt:${salt}:${derivedKey.toString('hex')}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = body.action || 'login';

    if (action === 'request-access') {
      const { name, email, department = 'Anti-Financial Crime', accessJustification } = body;
      if (!name || !email || !email.includes('@')) {
        return NextResponse.json(
          { error: 'Provide your full name and valid organization email address.' },
          { status: 400 }
        );
      }

      // Check if investigator already exists in database
      const existing = await prisma.investigator.findUnique({
        where: { email: email.trim().toLowerCase() },
      });

      if (existing) {
        return NextResponse.json({
          message: 'An investigator profile already exists for this email. Please sign in with your investigator credentials.',
          investigator: existing,
        });
      }

      // Record access request in AuditLog to enforce invitation/approval gating
      await prisma.auditLog.create({
        data: {
          actorId: 'INV-REQ-001',
          actorName: name.trim(),
          action: 'INVESTIGATOR_ACCESS_REQUESTED',
          targetType: 'INVESTIGATOR',
          targetId: email.trim().toLowerCase(),
          details: `Requested investigator clearance for department: ${department}. Justification: ${accessJustification || 'N/A'}`,
        },
      });

      return NextResponse.json({
        message: 'Investigator access request submitted to Compliance Administrator. Pending clearance.',
        status: 'PENDING_APPROVAL',
      });
    }

    // Default: Investigator Sign In / Authentication
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const employeeCode = typeof body.employeeCode === 'string' ? body.employeeCode.trim() : '';

    // Check by employee code or email if employee has INVESTIGATOR/ADMIN privilege
    let authorizedEmployee = null;

    if (employeeCode) {
      authorizedEmployee = await prisma.employee.findUnique({
        where: { employeeCode },
      });
    } else if (email) {
      authorizedEmployee = await prisma.employee.findFirst({
        where: { email },
      });
    }

    if (authorizedEmployee && authorizedEmployee.passwordHash) {
      const isValid = await verifyPassword(password, authorizedEmployee.passwordHash);
      const isInvestigatorRole =
        authorizedEmployee.privilegeLevel === 'ADMIN' ||
        authorizedEmployee.role.toUpperCase().includes('INVESTIGATOR') ||
        authorizedEmployee.role.toUpperCase().includes('COMPLIANCE') ||
        ['INVESTIGATOR', 'COMPLIANCE', 'RISK_ANALYST'].includes(authorizedEmployee.role.toUpperCase());

      if (isValid && isInvestigatorRole) {
        const response = NextResponse.json({
          message: 'Investigator authentication verified.',
          user: {
            name: authorizedEmployee.name,
            email: authorizedEmployee.email,
            role: 'INVESTIGATOR',
            department: authorizedEmployee.department,
          },
          redirectTo: '/',
        });

        response.cookies.set('trustline_employee', createEmployeeSession(authorizedEmployee.employeeCode), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/',
          maxAge: 60 * 60 * 8,
        });

        return response;
      }
    }

    return NextResponse.json(
      { error: 'Invalid investigator credentials or insufficient clearance level.' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Investigator authentication failed:', error);
    return NextResponse.json(
      { error: 'Unable to authenticate investigator right now.' },
      { status: 500 }
    );
  }
}
