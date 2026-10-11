import { randomBytes, scrypt as scryptCallback } from 'node:crypto';
import { promisify } from 'node:util';
import { prisma } from '../src/lib/prisma';

const scrypt = promisify(scryptCallback);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt:${salt}:${derivedKey.toString('hex')}`;
}

export async function bootstrapDemoAccounts() {
  const enabled = process.env.ENABLE_DEMO_BOOTSTRAP === 'true';
  const employeePassword = process.env.DEMO_EMPLOYEE_PASSWORD;
  const investigatorPassword = process.env.DEMO_INVESTIGATOR_PASSWORD;

  if (!enabled) {
    console.log('Demo bootstrap disabled; no seed changes were applied.');
    return;
  }

  if (!employeePassword || !investigatorPassword) {
    throw new Error('DEMO_EMPLOYEE_PASSWORD and DEMO_INVESTIGATOR_PASSWORD must be set when ENABLE_DEMO_BOOTSTRAP=true.');
  }

  console.log('--- Bootstrapping TrustLine Demo Accounts ---');

  const empPasswordHash = await hashPassword(employeePassword);
  const emp = await prisma.employee.upsert({
    where: { employeeCode: 'EMP-1001' },
    update: {
      passwordHash: empPasswordHash,
      status: 'ACTIVE',
    },
    create: {
      employeeCode: 'EMP-1001',
      name: 'Vikram Malhotra',
      email: 'v.malhotra@apexbank.com',
      role: 'Senior Relationship Manager',
      department: 'Wealth Management',
      privilegeLevel: 'ELEVATED',
      status: 'ACTIVE',
      riskScore: 88.5,
      passwordHash: empPasswordHash,
    },
  });

  const invPasswordHash = await hashPassword(investigatorPassword);
  const inv = await prisma.investigator.upsert({
    where: { email: 'rahul.sharma@trustline.in' },
    update: {
      name: 'Rahul Sharma',
      role: 'Lead AML Investigator',
      avatar: 'RS',
    },
    create: {
      name: 'Rahul Sharma',
      email: 'rahul.sharma@trustline.in',
      role: 'Lead AML Investigator',
      avatar: 'RS',
    },
  });

  const invEmp = await prisma.employee.upsert({
    where: { employeeCode: 'EMP-INVESTIGATOR-01' },
    update: {
      email: 'rahul.sharma@trustline.in',
      role: 'Lead AML Investigator',
      privilegeLevel: 'ADMIN',
      status: 'ACTIVE',
      passwordHash: invPasswordHash,
    },
    create: {
      employeeCode: 'EMP-INVESTIGATOR-01',
      name: 'Rahul Sharma',
      email: 'rahul.sharma@trustline.in',
      role: 'Lead AML Investigator',
      department: 'Financial Crime & AML Investigations',
      privilegeLevel: 'ADMIN',
      status: 'ACTIVE',
      riskScore: 5.0,
      passwordHash: invPasswordHash,
    },
  });

  console.log(`✅ Employee Demo Account Bootstrapped: ${emp.employeeCode} (${emp.email})`);
  console.log(`✅ Investigator Demo Account Bootstrapped: ${inv.email} / ${invEmp.employeeCode}`);
}

if (require.main === module) {
  bootstrapDemoAccounts()
    .catch((e) => {
      console.error('Bootstrap failed:', e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
