import { NextResponse } from 'next/server';
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { prisma } from '@/lib/prisma';

const scrypt = promisify(scryptCallback);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt:${salt}:${derivedKey.toString('hex')}`;
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Employee activation is unavailable on this deployment.' },
      { status: 404 },
    );
  }

  try {
    const body = await request.json();
    const employeeCode =
      typeof body.employeeCode === 'string' ? body.employeeCode.trim() : '';
    const email =
      typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!employeeCode || !email || password.length < 12 || password.length > 128) {
      return NextResponse.json(
        { error: 'Provide your employee ID, registered work email, and a password of 12–128 characters.' },
        { status: 400 },
      );
    }

    const employee = await prisma.employee.findUnique({
      where: { employeeCode },
      select: {
        id: true,
        employeeCode: true,
        email: true,
        name: true,
        role: true,
        department: true,
        status: true,
        passwordHash: true,
      },
    });

    if (
      !employee ||
      employee.email.toLowerCase() !== email ||
      employee.status !== 'ACTIVE'
    ) {
      return NextResponse.json(
        { error: 'Employee details could not be verified.' },
        { status: 400 },
      );
    }

    if (employee.passwordHash) {
      return NextResponse.json(
        { error: 'This employee account has already been activated. Please sign in.' },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);
    const result = await prisma.employee.updateMany({
      where: {
        id: employee.id,
        passwordHash: null,
        status: 'ACTIVE',
      },
      data: { passwordHash },
    });

    if (result.count !== 1) {
      return NextResponse.json(
        { error: 'Account activation could not be completed. Please try signing in.' },
        { status: 409 },
      );
    }

    return NextResponse.json({
      message: 'Employee account activated. You can now sign in.',
      employee: {
        employeeCode: employee.employeeCode,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        department: employee.department,
      },
    });
  } catch (error) {
    console.error('Employee activation failed:', error);
    return NextResponse.json(
      { error: 'Unable to activate the account right now.' },
      { status: 500 },
    );
  }
}
