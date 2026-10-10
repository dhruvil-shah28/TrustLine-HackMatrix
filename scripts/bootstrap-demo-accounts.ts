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
  console.log('--- Bootstrapping TrustLine Demo Accounts ---');

  // 1. Employee Demo Account: EMP-1001 (Vikram Malhotra)
  const empPasswordHash = await hashPassword('TL-Employee#2026');
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
  console.log(`✅ Employee Demo Account Bootstrapped: ${emp.employeeCode} (${emp.email})`);

  // 2. Investigator Demo Account: INVESTIGATOR-001 (Rahul Sharma)
  const invPasswordHash = await hashPassword('TL-Investigator#2026');
  
  // Upsert into Investigator table
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

  // Also create/update associated Employee record with INVESTIGATOR role and password hash
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
