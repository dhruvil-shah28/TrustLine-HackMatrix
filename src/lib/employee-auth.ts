import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyEmployeeSession } from '@/lib/employee-session';
import type { UserRole } from '@/lib/types';

export async function getCurrentEmployee() {
  const cookieStore = await cookies();
  const token = cookieStore.get('trustline_employee')?.value;
  if (!token) return null;

  const session = verifyEmployeeSession(token);
  if (!session) return null;

  return prisma.employee.findUnique({
    where: { employeeCode: session.employeeCode },
    select: {
      id: true,
      employeeCode: true,
      name: true,
      email: true,
      role: true,
      department: true,
      privilegeLevel: true,
      status: true,
    },
  }).then((employee) => {
    if (!employee || employee.status !== 'ACTIVE') return null;
    return employee;
  });
}

export function resolveApplicationRole(employee: {
  role: string;
  privilegeLevel: string;
}): UserRole {
  if (employee.privilegeLevel === 'ADMIN') return 'INVESTIGATOR';

  const roleUpper = employee.role.toUpperCase();
  const investigatorRoles: UserRole[] = [
    'INVESTIGATOR',
    'COMPLIANCE',
    'RISK_ANALYST',
  ];

  if (investigatorRoles.includes(roleUpper as UserRole)) {
    return roleUpper as UserRole;
  }

  // Check if explicit role indicates an investigator or compliance analyst
  if (
    roleUpper.includes('INVESTIGATOR') ||
    roleUpper.includes('COMPLIANCE') ||
    roleUpper.includes('AML ANALYST') ||
    roleUpper.includes('RISK ANALYST')
  ) {
    return 'INVESTIGATOR';
  }

  return 'EMPLOYEE';
}
