import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    if (!q || q.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const query = q.toLowerCase();

    const employees = await prisma.employee.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { employeeCode: { contains: query } },
          { role: { contains: query } },
        ],
      },
      take: 5,
    });

    const customers = await prisma.customer.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { customerCode: { contains: query } },
        ],
      },
      take: 5,
    });

    const accounts = await prisma.account.findMany({
      where: {
        accountNumber: { contains: query },
      },
      take: 5,
    });

    const alerts = await prisma.alert.findMany({
      where: {
        OR: [
          { alertCode: { contains: query } },
          { title: { contains: query } },
        ],
      },
      take: 5,
    });

    const cases = await prisma.case.findMany({
      where: {
        OR: [
          { caseCode: { contains: query } },
          { title: { contains: query } },
        ],
      },
      take: 5,
    });

    const results = [
      ...employees.map((e) => ({ id: e.id, type: 'EMPLOYEE', label: e.name, subLabel: `${e.employeeCode} • ${e.role}`, link: `/employees/${e.id}` })),
      ...customers.map((c) => ({ id: c.id, type: 'CUSTOMER', label: c.name, subLabel: `${c.customerCode} • ${c.type}`, link: `/customers` })),
      ...accounts.map((a) => ({ id: a.id, type: 'ACCOUNT', label: a.accountNumber, subLabel: `Balance: ₹${(a.balance / 100000).toFixed(2)}L`, link: `/graph` })),
      ...alerts.map((al) => ({ id: al.id, type: 'ALERT', label: al.alertCode, subLabel: al.title, link: `/alerts/${al.id}` })),
      ...cases.map((cs) => ({ id: cs.id, type: 'CASE', label: cs.caseCode, subLabel: cs.title, link: `/cases/${cs.id}` })),
    ];

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error executing search:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
