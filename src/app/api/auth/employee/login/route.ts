import { NextResponse } from 'next/server';
import { scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const employeeCode =
      typeof body.employeeCode === 'string' ? body.employeeCode.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!employeeCode || !password || password.length > 128) {
      return NextResponse.json(
        { error: 'Enter your employee ID and password.' },
        { status: 400 },
      );
    }

    const employee = await prisma.employee.findUnique({
      where: { employeeCode },
      select: {
        employeeCode: true,
        name: true,
        email: true,
        role: true,
        department: true,
        privilegeLevel: true,
        status: true,
        passwordHash: true,
      },
    });

    if (
      !employee ||
      employee.status !== 'ACTIVE' ||
      !employee.passwordHash ||
      !(await verifyPassword(password, employee.passwordHash))
    ) {
      return NextResponse.json(
        { error: 'Invalid employee ID or password.' },
        { status: 401 },
      );
    }

    const response = NextResponse.json({
      message: 'Sign-in successful.',
      employee: {
        employeeCode: employee.employeeCode,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        department: employee.department,
        privilegeLevel: employee.privilegeLevel,
      },
    });

    response.cookies.set('trustline_employee', createEmployeeSession(employee.employeeCode), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch (error) {
    console.error('Employee login failed:', error);
    return NextResponse.json(
      { error: 'Unable to sign in right now.' },
      { status: 500 },
    );
  }
}
