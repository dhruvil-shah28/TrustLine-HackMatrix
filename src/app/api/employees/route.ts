import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const riskLevel = searchParams.get('riskLevel') || 'ALL';
    const privilege = searchParams.get('privilege') || 'ALL';
    const department = searchParams.get('department') || 'ALL';
    const role = searchParams.get('role') || 'ALL';

    // Build Prisma query conditions
    const where: any = {};

    if (search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q } },
        { employeeCode: { contains: q } },
        { role: { contains: q } },
        { department: { contains: q } },
        { email: { contains: q } },
      ];
    }

    if (riskLevel !== 'ALL') {
      if (riskLevel === 'CRITICAL') {
        where.riskScore = { gte: 75 };
      } else if (riskLevel === 'HIGH') {
        where.riskScore = { gte: 60, lt: 75 };
      } else if (riskLevel === 'MEDIUM') {
        where.riskScore = { gte: 35, lt: 60 };
      } else if (riskLevel === 'LOW') {
        where.riskScore = { lt: 35 };
      }
    }

    if (privilege !== 'ALL') {
      where.privilegeLevel = privilege;
    }

    if (department !== 'ALL') {
      where.department = department;
    }

    if (role !== 'ALL') {
      where.role = role;
    }

    const employees = await prisma.employee.findMany({
      where,
      include: {
        accessEvents: { take: 1, orderBy: { timestamp: 'desc' } },
        _count: {
          select: {
            accessEvents: true,
            employeeActions: true,
            txInitiated: true,
            txApproved: true,
          },
        },
      },
      orderBy: { riskScore: 'desc' },
    });

    const enrichedEmployees = employees.map((emp) => {
      let primaryRiskStatus = 'LOW';
      if (emp.riskScore >= 75) primaryRiskStatus = 'CRITICAL';
      else if (emp.riskScore >= 60) primaryRiskStatus = 'HIGH';
      else if (emp.riskScore >= 35) primaryRiskStatus = 'ELEVATED';

      const lastAccess = emp.accessEvents[0]?.timestamp || emp.createdAt;

      return {
        ...emp,
        primaryRiskStatus,
        lastActive: lastAccess,
        accessCount: emp._count.accessEvents,
        actionCount: emp._count.employeeActions,
        txCount: emp._count.txInitiated + emp._count.txApproved,
      };
    });

    return NextResponse.json(enrichedEmployees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json({ error: 'Failed to fetch employee profiles' }, { status: 500 });
  }
}

