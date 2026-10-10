import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyEmployeeSession } from '@/lib/employee-session';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('trustline_employee')?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const session = verifyEmployeeSession(token);

    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const employee = await prisma.employee.findUnique({
      where: { employeeCode: session.employeeCode },
      select: {
        employeeCode: true,
        name: true,
        email: true,
        role: true,
        department: true,
        privilegeLevel: true,
        status: true,
      },
    });

    if (!employee || employee.status !== 'ACTIVE') {
      const response = NextResponse.json(
        { authenticated: false },
        { status: 401 },
      );
      response.cookies.delete('trustline_employee');
      return response;
    }

    return NextResponse.json({
      authenticated: true,
      employee: {
        employeeCode: employee.employeeCode,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        department: employee.department,
        privilegeLevel: employee.privilegeLevel,
      },
    });
  } catch (error) {
    console.error('Employee session verification failed:', error);
    return NextResponse.json(
      { error: 'Unable to verify the session right now.' },
      { status: 500 },
    );
  }
}
