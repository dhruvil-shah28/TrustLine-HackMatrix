import { NextResponse } from 'next/server';
import { randomBytes, scrypt as scryptCallback } from 'node:crypto';
import { promisify } from 'node:util';
import { prisma } from '@/lib/prisma';
import { createEmployeeSession } from '@/lib/employee-session';

const scrypt = promisify(scryptCallback);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt:${salt}:${derivedKey.toString('hex')}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const department = typeof body.department === 'string' ? body.department.trim() : 'Retail Banking';
    const role = typeof body.role === 'string' ? body.role.trim() : 'Retail Specialist';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!name || !email || password.length < 8 || password.length > 128) {
      return NextResponse.json(
        { error: 'Please provide full name, work email, and a password of at least 8 characters.' },
        { status: 400 }
      );
    }

    if (!email.includes('@')) {
      return NextResponse.json(
        { error: 'Please enter a valid work email address.' },
        { status: 400 }
      );
    }

    // Check for existing registered email
    const existingEmail = await prisma.employee.findFirst({
      where: { email },
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: 'An account with this work email address already exists. Please sign in or activate your account.' },
        { status: 409 }
      );
    }

    // Generate unique employee code: EMP-XXXX (e.g. EMP-2001)
    const count = await prisma.employee.count();
    let codeNum = 2000 + count + 1;
    let employeeCode = `EMP-${codeNum}`;

    let codeExists = await prisma.employee.findUnique({ where: { employeeCode } });
    while (codeExists) {
      codeNum++;
      employeeCode = `EMP-${codeNum}`;
      codeExists = await prisma.employee.findUnique({ where: { employeeCode } });
    }

    const passwordHash = await hashPassword(password);

    // Create employee record with PENDING_APPROVAL status if self-registered, or ACTIVE
    // For seamless onboarding, we mark as ACTIVE so they can immediately log in and access their portal
    const newEmployee = await prisma.employee.create({
      data: {
        employeeCode,
        name,
        email,
        department,
        role,
        privilegeLevel: 'STANDARD',
        status: 'ACTIVE',
        riskScore: 10.0,
        passwordHash,
      },
    });

    const response = NextResponse.json({
      message: 'Employee account created successfully.',
      employee: {
        employeeCode: newEmployee.employeeCode,
        name: newEmployee.name,
        email: newEmployee.email,
        role: newEmployee.role,
        department: newEmployee.department,
      },
    });

    // Automatically set session cookie
    response.cookies.set('trustline_employee', createEmployeeSession(newEmployee.employeeCode), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch (error) {
    console.error('Employee registration failed:', error);
    return NextResponse.json(
      { error: 'Unable to register employee account right now.' },
      { status: 500 }
    );
  }
}
